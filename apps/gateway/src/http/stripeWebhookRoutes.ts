import express, { Router } from "express";
import type Stripe from "stripe";
import type { UserSubscriptionStorePort, BillingPlan } from "@kan/core";

function extractId(value: string | { id: string } | null | undefined): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.id;
}

function planFromStatus(status: Stripe.Subscription.Status): BillingPlan {
  return status === "active" || status === "trialing" ? "pro" : "maker";
}

/**
 * Webhook de Stripe — router separado de `createRoutes()`, montado ANTES de
 * `app.use(express.json())` en server.ts (mismo motivo que
 * `createPairingRoutes`/`createSnapshotRoutes`: no lleva el token interno,
 * autenticado por su propio mecanismo — acá la firma de Stripe, no un
 * secreto de pairing). `express.raw()` propio en esta ruta: la verificación
 * de firma (`stripe.webhooks.constructEvent`) necesita el body CRUDO, el
 * body-parser JSON global lo dejaría inservible para esto.
 *
 * `checkout.session.completed` es la ÚNICA vez que sabemos el `userId` de
 * Supabase (vía `client_reference_id`, seteado al crear la sesión en
 * apps/web) — a partir de ahí, cualquier evento posterior de la misma
 * suscripción llega solo con el Stripe Customer ID, que matchea contra la
 * fila ya creada (`stripe_customer_id`, columna unique).
 */
export function createStripeWebhookRoutes(
  stripe: Stripe,
  webhookSecret: string,
  subscriptionStore: UserSubscriptionStorePort,
): Router {
  const router = Router();

  router.post("/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") {
      res.status(400).json({ error: "Falta el header 'stripe-signature'." });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error) {
      res.status(400).json({ error: `Firma inválida: ${error instanceof Error ? error.message : "error desconocido"}` });
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.client_reference_id;
          const stripeCustomerId = extractId(session.customer);
          const stripeSubscriptionId = extractId(session.subscription);
          if (userId && stripeCustomerId) {
            await subscriptionStore.upsert({
              userId,
              stripeCustomerId,
              stripeSubscriptionId,
              plan: "pro",
              status: "active",
            });
          }
          break;
        }

        // Fuente de verdad para el estado real de la suscripción (trial,
        // pago fallido, cancelación programada, etc.) — checkout.session.completed
        // solo confirma que el checkout arrancó bien, este evento (que Stripe
        // dispara casi en simultáneo, y de nuevo en cada cambio de estado) es
        // el que manda.
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const stripeCustomerId = extractId(subscription.customer);
          if (!stripeCustomerId) break;

          // Puede no existir todavía si este evento llega antes que
          // checkout.session.completed (Stripe no garantiza el orden) — sin
          // la fila (y por lo tanto sin userId), no hay a quién actualizarle
          // el plan; checkout.session.completed la va a crear en cuanto
          // llegue.
          const existing = await subscriptionStore.getByStripeCustomerId(stripeCustomerId);
          if (!existing) break;

          const canceled = event.type === "customer.subscription.deleted";
          await subscriptionStore.upsert({
            userId: existing.userId,
            stripeCustomerId,
            stripeSubscriptionId: subscription.id,
            plan: canceled ? "maker" : planFromStatus(subscription.status),
            status: canceled ? "canceled" : subscription.status,
          });
          break;
        }

        default:
          // Cualquier otro tipo de evento: 200 sin hacer nada — Stripe
          // reintenta si no hay 200, no queremos reintentos infinitos por
          // eventos que no nos interesan.
          break;
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Error desconocido" });
      return;
    }

    res.json({ received: true });
  });

  return router;
}
