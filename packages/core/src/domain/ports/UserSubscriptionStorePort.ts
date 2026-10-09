export type BillingPlan = "maker" | "pro";

export interface UserSubscriptionRecord {
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: BillingPlan;
  status?: string;
  currentPeriodEnd?: string;
}

/**
 * Plan de suscripción por usuario, sincronizado desde el webhook de Stripe
 * (apps/gateway, service_role — Stripe es la fuente de verdad, el usuario
 * nunca escribe su propio plan directo, ver migración 0019). `upsert` recibe
 * `userId` (la primera vez, vía `client_reference_id` del Checkout) O
 * `stripeCustomerId` (eventos posteriores de la misma suscripción) para
 * encontrar la fila — al menos uno de los dos tiene que venir.
 */
export interface UserSubscriptionStorePort {
  getByUserId(userId: string): Promise<UserSubscriptionRecord | undefined>;
  getByStripeCustomerId(stripeCustomerId: string): Promise<UserSubscriptionRecord | undefined>;
  upsert(record: UserSubscriptionRecord): Promise<void>;
}
