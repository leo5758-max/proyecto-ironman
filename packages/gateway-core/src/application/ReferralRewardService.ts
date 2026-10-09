import type Stripe from "stripe";
import type { LoggerPort } from "@kan/plugin-contract";
import type { ReferralStorePort, UserSubscriptionStorePort } from "@kan/core";

export interface ReferralRewardConfig {
  /** Price de Stripe del plan Pro — mismo price que usa el Checkout de apps/web. */
  proPriceId: string;
  /** Coupon 100% off, `duration: "once"` — creado a mano en el Dashboard de Stripe (ver .env.example). */
  couponId: string;
}

/**
 * Otorga "1 mes gratis del plan Pro" a referrer + referido apenas se registra
 * un signup con código de invitación válido (Mejora "sistema de referidos",
 * disparado desde `authWebhookRoutes.ts`, service_role). Crea una suscripción
 * de Stripe real con el cupón aplicado — con un 100% off, Stripe la activa
 * sin pedir método de pago (la primera factura sale en $0), así que funciona
 * también para un referido que nunca cargó una tarjeta.
 *
 * Si alguno de los dos usuarios ya tiene una suscripción activa/en trial, se
 * le aplica el cupón a ESA suscripción (su próxima factura sale gratis) en
 * vez de crear una segunda.
 */
export class ReferralRewardService {
  constructor(
    private readonly stripe: Stripe,
    private readonly subscriptionStore: UserSubscriptionStorePort,
    private readonly referralStore: ReferralStorePort,
    private readonly resolveUserEmail: (userId: string) => Promise<string | undefined>,
    private readonly config: ReferralRewardConfig | undefined,
    private readonly logger: LoggerPort,
  ) {}

  async grant(referralId: string, referrerId: string, referredId: string): Promise<void> {
    if (!this.config) {
      this.logger.warn(
        "[ReferralRewardService] STRIPE_PRO_PRICE_ID/STRIPE_REFERRAL_COUPON_ID no configuradas — recompensa de referido no otorgada.",
      );
      await this.referralStore.updateRewardStatus(referralId, "failed");
      return;
    }

    const [referrerOk, referredOk] = await Promise.all([
      this.rewardUser(referrerId, "referrer"),
      this.rewardUser(referredId, "referido"),
    ]);

    await this.referralStore.updateRewardStatus(referralId, referrerOk && referredOk ? "granted" : "failed");
  }

  private async rewardUser(userId: string, role: "referrer" | "referido"): Promise<boolean> {
    try {
      const { proPriceId, couponId } = this.config!;
      const existing = await this.subscriptionStore.getByUserId(userId);

      if (existing?.stripeSubscriptionId && (existing.status === "active" || existing.status === "trialing")) {
        const subscription = await this.stripe.subscriptions.update(existing.stripeSubscriptionId, {
          discounts: [{ coupon: couponId }],
        });
        await this.subscriptionStore.upsert({
          userId,
          stripeCustomerId: existing.stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          plan: "pro",
          status: subscription.status,
        });
        return true;
      }

      const customerId = existing?.stripeCustomerId ?? (await this.ensureCustomer(userId));
      if (!customerId) return false;

      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: proPriceId }],
        discounts: [{ coupon: couponId }],
      });

      await this.subscriptionStore.upsert({
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        plan: "pro",
        status: subscription.status,
      });
      return true;
    } catch (error) {
      this.logger.error(`[ReferralRewardService] no se pudo recompensar al ${role} ${userId}: ${error}`);
      return false;
    }
  }

  private async ensureCustomer(userId: string): Promise<string | undefined> {
    const email = await this.resolveUserEmail(userId);
    if (!email) return undefined;
    const customer = await this.stripe.customers.create({ email });
    return customer.id;
  }
}
