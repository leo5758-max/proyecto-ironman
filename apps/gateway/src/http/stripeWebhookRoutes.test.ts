import { describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import Stripe from "stripe";
import type { UserSubscriptionRecord, UserSubscriptionStorePort } from "@kan/core";
import { createStripeWebhookRoutes } from "./stripeWebhookRoutes";

const WEBHOOK_SECRET = "whsec_test_secret";
const stripe = new Stripe("sk_test_fake");

function fakeStore(overrides: Partial<UserSubscriptionStorePort> = {}): UserSubscriptionStorePort & {
  upsert: ReturnType<typeof vi.fn>;
} {
  const upsert = vi.fn(async (_record: UserSubscriptionRecord) => undefined);
  return {
    getByUserId: async () => undefined,
    getByStripeCustomerId: async () => undefined,
    upsert,
    ...overrides,
  } as UserSubscriptionStorePort & { upsert: ReturnType<typeof vi.fn> };
}

function appWith(store: UserSubscriptionStorePort) {
  const app = express();
  app.use(createStripeWebhookRoutes(stripe, WEBHOOK_SECRET, store));
  return app;
}

/** Firma un payload como lo haría Stripe de verdad — mismo helper que usa el SDK en sus propios tests. */
function sign(payload: object): { body: string; signature: string } {
  const body = JSON.stringify(payload);
  const signature = stripe.webhooks.generateTestHeaderString({ payload: body, secret: WEBHOOK_SECRET });
  return { body, signature };
}

function stripeEvent(type: string, object: unknown) {
  return { id: "evt_1", object: "event", type, data: { object } };
}

describe("POST /webhooks/stripe", () => {
  it("rechaza con 400 si falta el header 'stripe-signature'", async () => {
    const app = appWith(fakeStore());

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .send(JSON.stringify(stripeEvent("checkout.session.completed", {})));

    expect(response.status).toBe(400);
  });

  it("rechaza con 400 si la firma no matchea (secreto incorrecto)", async () => {
    const app = appWith(fakeStore());
    const { body } = sign(stripeEvent("checkout.session.completed", {}));

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "t=1,v1=firma-invalida")
      .send(body);

    expect(response.status).toBe(400);
  });

  it("checkout.session.completed: crea la fila con plan 'pro' vía client_reference_id", async () => {
    const store = fakeStore();
    const app = appWith(store);
    const { body, signature } = sign(
      stripeEvent("checkout.session.completed", {
        client_reference_id: "user-1",
        customer: "cus_123",
        subscription: "sub_123",
      }),
    );

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(body);

    expect(response.status).toBe(200);
    expect(store.upsert).toHaveBeenCalledWith({
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      plan: "pro",
      status: "active",
    });
  });

  it("checkout.session.completed: no hace nada sin client_reference_id (evento ajeno a un checkout iniciado por KAN)", async () => {
    const store = fakeStore();
    const app = appWith(store);
    const { body, signature } = sign(
      stripeEvent("checkout.session.completed", { client_reference_id: null, customer: "cus_123" }),
    );

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(body);

    expect(response.status).toBe(200);
    expect(store.upsert).not.toHaveBeenCalled();
  });

  it("customer.subscription.updated: sincroniza plan 'pro' para una fila ya linkeada, status 'active'", async () => {
    const store = fakeStore({
      getByStripeCustomerId: async (id) => (id === "cus_123" ? { userId: "user-1", plan: "maker" } : undefined),
    });
    const app = appWith(store);
    const { body, signature } = sign(
      stripeEvent("customer.subscription.updated", { id: "sub_123", customer: "cus_123", status: "active" }),
    );

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(body);

    expect(response.status).toBe(200);
    expect(store.upsert).toHaveBeenCalledWith({
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      plan: "pro",
      status: "active",
    });
  });

  it("customer.subscription.updated: 'past_due' baja el plan a 'maker' pero conserva el status real", async () => {
    const store = fakeStore({
      getByStripeCustomerId: async () => ({ userId: "user-1", plan: "pro" }),
    });
    const app = appWith(store);
    const { body, signature } = sign(
      stripeEvent("customer.subscription.updated", { id: "sub_123", customer: "cus_123", status: "past_due" }),
    );

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(body);

    expect(response.status).toBe(200);
    expect(store.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "maker", status: "past_due" }),
    );
  });

  it("customer.subscription.updated: sin fila existente para ese customer, no hace nada (todavía no llegó checkout.session.completed)", async () => {
    const store = fakeStore();
    const app = appWith(store);
    const { body, signature } = sign(
      stripeEvent("customer.subscription.updated", { id: "sub_123", customer: "cus_desconocido", status: "active" }),
    );

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(body);

    expect(response.status).toBe(200);
    expect(store.upsert).not.toHaveBeenCalled();
  });

  it("customer.subscription.deleted: baja el plan a 'maker' con status 'canceled'", async () => {
    const store = fakeStore({
      getByStripeCustomerId: async () => ({ userId: "user-1", plan: "pro" }),
    });
    const app = appWith(store);
    const { body, signature } = sign(
      stripeEvent("customer.subscription.deleted", { id: "sub_123", customer: "cus_123", status: "canceled" }),
    );

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(body);

    expect(response.status).toBe(200);
    expect(store.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "maker", status: "canceled" }),
    );
  });

  it("ignora tipos de evento que no le interesan (200, sin tocar el store)", async () => {
    const store = fakeStore();
    const app = appWith(store);
    const { body, signature } = sign(stripeEvent("invoice.paid", { id: "in_1" }));

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(body);

    expect(response.status).toBe(200);
    expect(store.upsert).not.toHaveBeenCalled();
  });

  it("rechaza con 500 si el store lanza", async () => {
    const store = fakeStore({
      upsert: vi.fn(async () => {
        throw new Error("db caída");
      }),
    });
    const app = appWith(store);
    const { body, signature } = sign(
      stripeEvent("checkout.session.completed", { client_reference_id: "user-1", customer: "cus_123" }),
    );

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(body);

    expect(response.status).toBe(500);
  });
});
