import { describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import type { EmailMessage, EmailServicePort, ReferralRewardService } from "@kan/gateway-core";
import type { LoggerPort } from "@kan/plugin-contract";
import type { ReferralStorePort } from "@kan/core";
import { createAuthWebhookRoutes } from "./authWebhookRoutes";

const SECRET = "test-webhook-secret";

function fakeEmailService(overrides: Partial<EmailServicePort> = {}): EmailServicePort & { send: ReturnType<typeof vi.fn> } {
  const send = vi.fn(async (_message: EmailMessage) => undefined);
  return { send, ...overrides } as EmailServicePort & { send: ReturnType<typeof vi.fn> };
}

function fakeReferralStore(overrides: Partial<ReferralStorePort> = {}): ReferralStorePort & {
  findReferrerIdByCode: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  updateRewardStatus: ReturnType<typeof vi.fn>;
} {
  return {
    findReferrerIdByCode: vi.fn(async () => undefined),
    create: vi.fn(async () => undefined),
    updateRewardStatus: vi.fn(async () => undefined),
    ...overrides,
  } as ReferralStorePort & {
    findReferrerIdByCode: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateRewardStatus: ReturnType<typeof vi.fn>;
  };
}

function fakeLogger(): LoggerPort {
  return { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

function appWith(
  emailService: EmailServicePort | undefined,
  referralStore: ReferralStorePort = fakeReferralStore(),
  referralRewardService: ReferralRewardService | undefined = undefined,
) {
  const app = express();
  app.use(express.json());
  app.use(createAuthWebhookRoutes(emailService, SECRET, "https://kan.dev", referralStore, referralRewardService, fakeLogger()));
  return app;
}

describe("POST /webhooks/supabase-auth", () => {
  it("rechaza con 401 sin el header X-Webhook-Secret", async () => {
    const app = appWith(fakeEmailService());

    const response = await request(app)
      .post("/webhooks/supabase-auth")
      .send({ type: "INSERT", table: "users", schema: "auth", record: { email: "fabian@example.com" } });

    expect(response.status).toBe(401);
  });

  it("rechaza con 401 si el secreto no matchea", async () => {
    const app = appWith(fakeEmailService());

    const response = await request(app)
      .post("/webhooks/supabase-auth")
      .set("X-Webhook-Secret", "otro-secreto")
      .send({ record: { email: "fabian@example.com" } });

    expect(response.status).toBe(401);
  });

  it("con secreto válido y email, manda el email de bienvenida usando el nombre de raw_user_meta_data.full_name", async () => {
    const emailService = fakeEmailService();
    const app = appWith(emailService);

    const response = await request(app)
      .post("/webhooks/supabase-auth")
      .set("X-Webhook-Secret", SECRET)
      .send({
        type: "INSERT",
        table: "users",
        schema: "auth",
        record: { email: "fabian@example.com", raw_user_meta_data: { full_name: "Fabián Vargas" } },
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true, sent: true });
    expect(emailService.send).toHaveBeenCalledTimes(1);
    const message = emailService.send.mock.calls[0][0] as EmailMessage;
    expect(message.to).toBe("fabian@example.com");
    expect(message.subject).toBe("Bienvenido a KAN, Fabián Vargas");
    expect(message.html).toContain("https://kan.dev/inicio");
    expect(message.html).toContain("https://kan.dev/docs");
  });

  it("sin raw_user_meta_data, cae a la parte local del email como nombre", async () => {
    const emailService = fakeEmailService();
    const app = appWith(emailService);

    await request(app)
      .post("/webhooks/supabase-auth")
      .set("X-Webhook-Secret", SECRET)
      .send({ record: { email: "fabian@example.com" } });

    const message = emailService.send.mock.calls[0][0] as EmailMessage;
    expect(message.subject).toBe("Bienvenido a KAN, fabian");
  });

  it("sin emailService configurado, responde 200 sin mandar nada (nunca hace que Supabase reintente)", async () => {
    const app = appWith(undefined);

    const response = await request(app)
      .post("/webhooks/supabase-auth")
      .set("X-Webhook-Secret", SECRET)
      .send({ record: { email: "fabian@example.com" } });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true, sent: false });
  });

  it("sin 'record.email', responde 200 sin mandar nada", async () => {
    const emailService = fakeEmailService();
    const app = appWith(emailService);

    const response = await request(app).post("/webhooks/supabase-auth").set("X-Webhook-Secret", SECRET).send({ record: {} });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true, sent: false });
    expect(emailService.send).not.toHaveBeenCalled();
  });

  it("responde 500 si emailService.send() lanza", async () => {
    const emailService = fakeEmailService({
      send: vi.fn(async () => {
        throw new Error("Resend caído");
      }),
    });
    const app = appWith(emailService);

    const response = await request(app)
      .post("/webhooks/supabase-auth")
      .set("X-Webhook-Secret", SECRET)
      .send({ record: { email: "fabian@example.com" } });

    expect(response.status).toBe(500);
  });

  it("con referral_code válido, registra el referral y dispara la recompensa", async () => {
    const referralStore = fakeReferralStore({
      findReferrerIdByCode: vi.fn(async () => "referrer-1"),
      create: vi.fn(async () => ({ id: "referral-1", referrerId: "referrer-1", referredId: "u-nuevo", rewardStatus: "pending" as const })),
    });
    const grant = vi.fn(async () => undefined);
    const referralRewardService = { grant } as unknown as ReferralRewardService;
    const app = appWith(fakeEmailService(), referralStore, referralRewardService);

    const response = await request(app)
      .post("/webhooks/supabase-auth")
      .set("X-Webhook-Secret", SECRET)
      .send({
        record: { id: "u-nuevo", email: "amigo@example.com", raw_user_meta_data: { referral_code: "ABCD1234" } },
      });

    expect(response.status).toBe(200);
    expect(referralStore.findReferrerIdByCode).toHaveBeenCalledWith("ABCD1234");
    expect(referralStore.create).toHaveBeenCalledWith("referrer-1", "u-nuevo");
    expect(grant).toHaveBeenCalledWith("referral-1", "referrer-1", "u-nuevo");
  });

  it("con referral_code inválido (sin dueño), no crea ningún referral", async () => {
    const referralStore = fakeReferralStore({ findReferrerIdByCode: vi.fn(async () => undefined) });
    const app = appWith(fakeEmailService(), referralStore);

    await request(app)
      .post("/webhooks/supabase-auth")
      .set("X-Webhook-Secret", SECRET)
      .send({ record: { id: "u-nuevo", email: "amigo@example.com", raw_user_meta_data: { referral_code: "NOEXISTE" } } });

    expect(referralStore.create).not.toHaveBeenCalled();
  });

  it("sin ReferralRewardService configurado (Stripe ausente), marca el referral como failed", async () => {
    const referralStore = fakeReferralStore({
      findReferrerIdByCode: vi.fn(async () => "referrer-1"),
      create: vi.fn(async () => ({ id: "referral-1", referrerId: "referrer-1", referredId: "u-nuevo", rewardStatus: "pending" as const })),
    });
    const app = appWith(fakeEmailService(), referralStore, undefined);

    await request(app)
      .post("/webhooks/supabase-auth")
      .set("X-Webhook-Secret", SECRET)
      .send({ record: { id: "u-nuevo", email: "amigo@example.com", raw_user_meta_data: { referral_code: "ABCD1234" } } });

    expect(referralStore.updateRewardStatus).toHaveBeenCalledWith("referral-1", "failed");
  });

  it("un error procesando el referido no impide que se mande el email de bienvenida", async () => {
    const referralStore = fakeReferralStore({
      findReferrerIdByCode: vi.fn(async () => {
        throw new Error("db caída");
      }),
    });
    const emailService = fakeEmailService();
    const app = appWith(emailService, referralStore);

    const response = await request(app)
      .post("/webhooks/supabase-auth")
      .set("X-Webhook-Secret", SECRET)
      .send({ record: { id: "u-nuevo", email: "amigo@example.com", raw_user_meta_data: { referral_code: "ABCD1234" } } });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true, sent: true });
  });
});
