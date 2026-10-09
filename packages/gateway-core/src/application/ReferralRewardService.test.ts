import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import type { LoggerPort } from "@kan/plugin-contract";
import type { ReferralStorePort, UserSubscriptionRecord, UserSubscriptionStorePort } from "@kan/core";
import { ReferralRewardService } from "./ReferralRewardService";

const CONFIG = { proPriceId: "price_pro", couponId: "coupon_referral" };

function fakeLogger(): LoggerPort {
  return { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

function fakeSubscriptionStore(byUserId: Record<string, UserSubscriptionRecord | undefined> = {}) {
  const upsert = vi.fn(async (_record: UserSubscriptionRecord) => undefined);
  const store: UserSubscriptionStorePort = {
    getByUserId: async (userId: string) => byUserId[userId],
    getByStripeCustomerId: async () => undefined,
    upsert,
  };
  return { store, upsert };
}

function fakeReferralStore() {
  const updateRewardStatus = vi.fn(async () => undefined);
  const store: ReferralStorePort = {
    findReferrerIdByCode: async () => undefined,
    create: async () => undefined,
    updateRewardStatus,
  };
  return { store, updateRewardStatus };
}

function fakeStripe(overrides: { create?: ReturnType<typeof vi.fn>; update?: ReturnType<typeof vi.fn>; customersCreate?: ReturnType<typeof vi.fn> } = {}) {
  return {
    subscriptions: {
      create: overrides.create ?? vi.fn(async () => ({ id: "sub_new", status: "active" })),
      update: overrides.update ?? vi.fn(async () => ({ id: "sub_existing", status: "active" })),
    },
    customers: {
      create: overrides.customersCreate ?? vi.fn(async () => ({ id: "cus_new" })),
    },
  } as unknown as Stripe;
}

describe("ReferralRewardService", () => {
  it("marca 'failed' sin tocar Stripe si no hay config (env vars ausentes)", async () => {
    const { store: subscriptionStore } = fakeSubscriptionStore();
    const { store: referralStore, updateRewardStatus } = fakeReferralStore();
    const stripe = fakeStripe();
    const service = new ReferralRewardService(stripe, subscriptionStore, referralStore, async () => "a@b.com", undefined, fakeLogger());

    await service.grant("r1", "referrer-1", "referido-1");

    expect(updateRewardStatus).toHaveBeenCalledWith("r1", "failed");
    expect(stripe.subscriptions.create).not.toHaveBeenCalled();
  });

  it("crea una suscripción nueva con el cupón para un usuario sin suscripción previa", async () => {
    const { store: subscriptionStore, upsert } = fakeSubscriptionStore();
    const { store: referralStore, updateRewardStatus } = fakeReferralStore();
    const stripe = fakeStripe();
    const resolveUserEmail = vi.fn(async () => "nuevo@kan.dev");
    const service = new ReferralRewardService(stripe, subscriptionStore, referralStore, resolveUserEmail, CONFIG, fakeLogger());

    await service.grant("r1", "referrer-1", "referido-1");

    expect(stripe.customers.create).toHaveBeenCalledWith({ email: "nuevo@kan.dev" });
    expect(stripe.subscriptions.create).toHaveBeenCalledWith({
      customer: "cus_new",
      items: [{ price: "price_pro" }],
      discounts: [{ coupon: "coupon_referral" }],
    });
    expect(upsert).toHaveBeenCalledWith({
      userId: "referrer-1",
      stripeCustomerId: "cus_new",
      stripeSubscriptionId: "sub_new",
      plan: "pro",
      status: "active",
    });
    expect(updateRewardStatus).toHaveBeenCalledWith("r1", "granted");
  });

  it("reusa el customer existente sin crear uno nuevo si ya tiene stripeCustomerId (pero sin suscripción activa)", async () => {
    const { store: subscriptionStore } = fakeSubscriptionStore({
      "referrer-1": { userId: "referrer-1", stripeCustomerId: "cus_existing", plan: "maker" },
    });
    const { store: referralStore } = fakeReferralStore();
    const stripe = fakeStripe();
    const service = new ReferralRewardService(stripe, subscriptionStore, referralStore, async () => "a@b.com", CONFIG, fakeLogger());

    await service.grant("r1", "referrer-1", "referido-1");

    // Al referrer (ya tiene stripeCustomerId) no se le crea un customer nuevo
    // — el único customer creado en este test es para "referido-1", que no
    // tenía ninguno todavía.
    expect(stripe.customers.create).toHaveBeenCalledTimes(1);
    expect(stripe.subscriptions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing" }),
    );
  });

  it("aplica el cupón a la suscripción existente en vez de crear una segunda", async () => {
    const { store: subscriptionStore, upsert } = fakeSubscriptionStore({
      "referrer-1": {
        userId: "referrer-1",
        stripeCustomerId: "cus_existing",
        stripeSubscriptionId: "sub_existing",
        plan: "pro",
        status: "active",
      },
    });
    const { store: referralStore } = fakeReferralStore();
    const stripe = fakeStripe();
    const service = new ReferralRewardService(stripe, subscriptionStore, referralStore, async () => "a@b.com", CONFIG, fakeLogger());

    await service.grant("r1", "referrer-1", "referido-1");

    expect(stripe.subscriptions.update).toHaveBeenCalledWith("sub_existing", { discounts: [{ coupon: "coupon_referral" }] });
    expect(stripe.subscriptions.create).not.toHaveBeenCalledWith(expect.objectContaining({ customer: "cus_existing" }));
    expect(upsert).toHaveBeenCalledWith({
      userId: "referrer-1",
      stripeCustomerId: "cus_existing",
      stripeSubscriptionId: "sub_existing",
      plan: "pro",
      status: "active",
    });
  });

  it("marca 'failed' si no se pudo resolver el email para crear el customer", async () => {
    const { store: subscriptionStore } = fakeSubscriptionStore();
    const { store: referralStore, updateRewardStatus } = fakeReferralStore();
    const stripe = fakeStripe();
    const service = new ReferralRewardService(stripe, subscriptionStore, referralStore, async () => undefined, CONFIG, fakeLogger());

    await service.grant("r1", "referrer-1", "referido-1");

    expect(updateRewardStatus).toHaveBeenCalledWith("r1", "failed");
  });

  it("marca 'failed' si Stripe lanza para uno de los dos usuarios, pero sigue intentando con el otro", async () => {
    const { store: subscriptionStore, upsert } = fakeSubscriptionStore();
    const { store: referralStore, updateRewardStatus } = fakeReferralStore();
    const create = vi
      .fn()
      .mockRejectedValueOnce(new Error("tarjeta rechazada"))
      .mockResolvedValueOnce({ id: "sub_new", status: "active" });
    const stripe = fakeStripe({ create });
    const service = new ReferralRewardService(stripe, subscriptionStore, referralStore, async () => "a@b.com", CONFIG, fakeLogger());

    await service.grant("r1", "referrer-1", "referido-1");

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(updateRewardStatus).toHaveBeenCalledWith("r1", "failed");
  });
});
