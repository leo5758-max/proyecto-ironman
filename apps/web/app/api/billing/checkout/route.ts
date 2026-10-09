import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getStripeClient, requireProPriceId, MissingStripeConfigError } from "@/lib/billing/stripeClient";
import { getUserSubscription } from "@/lib/billing/getUserSubscription";
import { getSiteUrl } from "@/lib/seo/siteUrl";

// 14 días — mismo criterio que "Empezar prueba gratis" en /precios (PricingPage.tsx).
const TRIAL_PERIOD_DAYS = 14;

/**
 * Crea una sesión de Stripe Checkout para el plan Profesional — el cliente
 * redirige directo a `session.url` (sin `@stripe/stripe-js` ni la
 * publishable key: Stripe recomienda hoy el redirect directo en vez de
 * `redirectToCheckout()`). `client_reference_id` es cómo el webhook
 * (apps/gateway) linkea el Customer nuevo de Stripe con este `userId` de
 * Supabase — ver `stripeWebhookRoutes.ts`.
 */
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const stripe = getStripeClient();
    const priceId = requireProPriceId();
    const existing = await getUserSubscription(auth.user.userId);
    const siteUrl = getSiteUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: auth.user.userId,
      // Reusa el Customer si ya existe (evita duplicados en pagos/reintentos
      // anteriores) — sin uno todavía, Stripe crea uno nuevo a partir del email.
      ...(existing?.stripeCustomerId ? { customer: existing.stripeCustomerId } : { customer_email: auth.user.email }),
      subscription_data: { trial_period_days: TRIAL_PERIOD_DAYS },
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/precios`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe no devolvió una URL de checkout." }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof MissingStripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 501 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo iniciar el checkout." }, { status: 500 });
  }
}
