import Stripe from "stripe";

export class MissingStripeConfigError extends Error {
  constructor(varName: string) {
    super(
      `Falta ${varName}. Copiá apps/web/.env.example a .env.local y agregá tus keys de Stripe (Dashboard → Developers → API keys / Webhooks).`,
    );
  }
}

function requireEnv(name: "STRIPE_SECRET_KEY" | "STRIPE_PRO_PRICE_ID"): string {
  const value = process.env[name];
  if (!value) throw new MissingStripeConfigError(name);
  return value;
}

let cachedClient: Stripe | undefined;

/**
 * Construcción perezosa (no en import-time): mismo criterio que
 * `createSupabaseServerClient()` — sin esto, `next build` fallaría en
 * cualquier deploy sin `STRIPE_SECRET_KEY` configurada todavía.
 */
export function getStripeClient(): Stripe {
  if (!cachedClient) cachedClient = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  return cachedClient;
}

export function requireProPriceId(): string {
  return requireEnv("STRIPE_PRO_PRICE_ID");
}
