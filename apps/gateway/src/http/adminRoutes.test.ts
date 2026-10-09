import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import { createAdminRoutes } from "./adminRoutes";

const INTERNAL_TOKEN = "test-internal-token";

interface FakeAuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

function fakeSupabaseClient(options: {
  authUsers: FakeAuthUser[];
  profiles?: Array<{ id: string; display_name: string | null }>;
  subscriptions?: Array<{
    user_id: string;
    plan: "maker" | "pro";
    status: string | null;
    current_period_end: string | null;
    stripe_customer_id: string | null;
  }>;
}) {
  const perPageDefault = 200;
  return {
    auth: {
      admin: {
        listUsers: async ({ page, perPage }: { page: number; perPage: number }) => {
          const size = perPage ?? perPageDefault;
          const start = (page - 1) * size;
          return { data: { users: options.authUsers.slice(start, start + size) }, error: null };
        },
      },
    },
    from: (table: string) => ({
      select: async () => {
        if (table === "profiles") return { data: options.profiles ?? [], error: null };
        if (table === "user_subscriptions") return { data: options.subscriptions ?? [], error: null };
        return { data: [], error: null };
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function appWith(supabaseClient: ReturnType<typeof fakeSupabaseClient>) {
  const app = express();
  app.use(createAdminRoutes(supabaseClient, INTERNAL_TOKEN));
  return app;
}

describe("GET /v1/admin/overview", () => {
  it("rechaza sin el token interno", async () => {
    const app = appWith(fakeSupabaseClient({ authUsers: [] }));
    const response = await request(app).get("/v1/admin/overview");
    expect(response.status).toBe(401);
  });

  it("combina auth.users + profiles + user_subscriptions en users/subscriptions/metrics", async () => {
    const now = Date.now();
    const recent = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString();
    const old = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString();

    const client = fakeSupabaseClient({
      authUsers: [
        { id: "u1", email: "pro@kan.dev", created_at: "2024-01-01T00:00:00Z", last_sign_in_at: recent },
        { id: "u2", email: "maker@kan.dev", created_at: "2024-02-01T00:00:00Z", last_sign_in_at: old },
      ],
      profiles: [
        { id: "u1", display_name: "Pro User" },
        { id: "u2", display_name: null },
      ],
      subscriptions: [
        { user_id: "u1", plan: "pro", status: "active", current_period_end: "2024-06-01T00:00:00Z", stripe_customer_id: "cus_1" },
      ],
    });

    const response = await request(appWith(client)).get("/v1/admin/overview").set("Authorization", `Bearer ${INTERNAL_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.users.find((u: { userId: string }) => u.userId === "u1")).toMatchObject({
      email: "pro@kan.dev",
      displayName: "Pro User",
      plan: "pro",
    });
    expect(response.body.users.find((u: { userId: string }) => u.userId === "u2")).toMatchObject({
      plan: "maker",
      displayName: null,
    });

    expect(response.body.subscriptions).toEqual([
      { userId: "u1", email: "pro@kan.dev", status: "active", currentPeriodEnd: "2024-06-01T00:00:00Z" },
    ]);

    expect(response.body.metrics).toEqual({
      totalUsers: 2,
      activeLast30Days: 1,
      makerToProConversionRate: 0.5,
    });
  });

  it("pagina auth.admin.listUsers() hasta que una página vuelve incompleta", async () => {
    const authUsers: FakeAuthUser[] = Array.from({ length: 3 }, (_, i) => ({
      id: `u${i}`,
      email: `u${i}@kan.dev`,
      created_at: "2024-01-01T00:00:00Z",
      last_sign_in_at: null,
    }));
    const client = fakeSupabaseClient({ authUsers });

    const response = await request(appWith(client)).get("/v1/admin/overview").set("Authorization", `Bearer ${INTERNAL_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(3);
  });
});
