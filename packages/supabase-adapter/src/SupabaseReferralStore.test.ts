import { describe, expect, it } from "vitest";
import { SupabaseReferralStore } from "./SupabaseReferralStore";
import { createFakeFromClient } from "./testFakes";

describe("SupabaseReferralStore", () => {
  it("findReferrerIdByCode() devuelve el id del perfil dueño del código", async () => {
    const client = createFakeFromClient({ profiles: { data: { id: "referrer-1" }, error: null } });
    const store = new SupabaseReferralStore(client);

    expect(await store.findReferrerIdByCode("ABCD1234")).toBe("referrer-1");
  });

  it("findReferrerIdByCode() devuelve undefined si el código no existe", async () => {
    const client = createFakeFromClient({ profiles: { data: null, error: null } });
    const store = new SupabaseReferralStore(client);

    expect(await store.findReferrerIdByCode("DESCONOCIDO")).toBeUndefined();
  });

  it("create() mapea la fila insertada a camelCase", async () => {
    const client = createFakeFromClient({
      referrals: { data: { id: "r1", referrer_id: "u1", referred_id: "u2", reward_status: "pending" }, error: null },
    });
    const store = new SupabaseReferralStore(client);

    expect(await store.create("u1", "u2")).toEqual({
      id: "r1",
      referrerId: "u1",
      referredId: "u2",
      rewardStatus: "pending",
    });
  });

  it("create() devuelve undefined ante un conflicto (referred_id ya registrado)", async () => {
    const client = createFakeFromClient({ referrals: { data: null, error: { message: "duplicate key" } } });
    const store = new SupabaseReferralStore(client);

    expect(await store.create("u1", "u2")).toBeUndefined();
  });

  it("updateRewardStatus() lanza si Supabase devuelve error", async () => {
    const client = createFakeFromClient({ referrals: { data: null, error: { message: "db caída" } } });
    const store = new SupabaseReferralStore(client);

    await expect(store.updateRewardStatus("r1", "granted")).rejects.toThrow("db caída");
  });

  it("updateRewardStatus() resuelve sin error cuando Supabase confirma el update", async () => {
    const client = createFakeFromClient({ referrals: { data: null, error: null } });
    const store = new SupabaseReferralStore(client);

    await expect(store.updateRewardStatus("r1", "granted")).resolves.toBeUndefined();
  });
});
