import { describe, expect, it } from "vitest";
import { SupabaseUserSubscriptionStore } from "./SupabaseUserSubscriptionStore";
import { createFakeFromClient } from "./testFakes";

const ROW = {
  user_id: "u1",
  stripe_customer_id: "cus_123",
  stripe_subscription_id: "sub_123",
  plan: "pro" as const,
  status: "active",
  current_period_end: "2026-01-01T00:00:00.000Z",
};

describe("SupabaseUserSubscriptionStore", () => {
  it("getByUserId() mapea la fila a camelCase", async () => {
    const client = createFakeFromClient({ user_subscriptions: { data: ROW, error: null } });
    const store = new SupabaseUserSubscriptionStore(client);

    expect(await store.getByUserId("u1")).toEqual({
      userId: "u1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      plan: "pro",
      status: "active",
      currentPeriodEnd: "2026-01-01T00:00:00.000Z",
    });
  });

  it("getByUserId() devuelve undefined sin fila", async () => {
    const client = createFakeFromClient({ user_subscriptions: { data: null, error: null } });
    const store = new SupabaseUserSubscriptionStore(client);

    expect(await store.getByUserId("u1")).toBeUndefined();
  });

  it("getByUserId() lanza si Supabase devuelve error", async () => {
    const client = createFakeFromClient({ user_subscriptions: { data: null, error: { message: "db caída" } } });
    const store = new SupabaseUserSubscriptionStore(client);

    await expect(store.getByUserId("u1")).rejects.toThrow("db caída");
  });

  it("getByStripeCustomerId() mapea la fila a camelCase", async () => {
    const client = createFakeFromClient({ user_subscriptions: { data: ROW, error: null } });
    const store = new SupabaseUserSubscriptionStore(client);

    const record = await store.getByStripeCustomerId("cus_123");
    expect(record?.userId).toBe("u1");
    expect(record?.plan).toBe("pro");
  });

  it("getByStripeCustomerId() devuelve undefined sin fila (customer nunca linkeado)", async () => {
    const client = createFakeFromClient({ user_subscriptions: { data: null, error: null } });
    const store = new SupabaseUserSubscriptionStore(client);

    expect(await store.getByStripeCustomerId("cus_desconocido")).toBeUndefined();
  });

  it("upsert() hace upsert por user_id, con null para los campos opcionales ausentes", async () => {
    const client = createFakeFromClient({ user_subscriptions: { data: null, error: null } });
    const store = new SupabaseUserSubscriptionStore(client);

    await expect(store.upsert({ userId: "u1", plan: "maker" })).resolves.toBeUndefined();
  });

  it("upsert() lanza si Supabase devuelve error", async () => {
    const client = createFakeFromClient({ user_subscriptions: { data: null, error: { message: "constraint violada" } } });
    const store = new SupabaseUserSubscriptionStore(client);

    await expect(store.upsert({ userId: "u1", plan: "pro" })).rejects.toThrow("constraint violada");
  });
});
