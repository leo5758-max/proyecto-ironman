import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getStripeClient, MissingStripeConfigError } from "@/lib/billing/stripeClient";
import { getUserSubscription } from "@/lib/billing/getUserSubscription";
import { getSiteUrl } from "@/lib/seo/siteUrl";

/** Crea una sesión del Customer Portal de Stripe — "Gestionar suscripción" en /configuracion (PlanSection.tsx). */
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const existing = await getUserSubscription(auth.user.userId);
  if (!existing?.stripeCustomerId) {
    return NextResponse.json({ error: "Todavía no tenés una suscripción para gestionar." }, { status: 404 });
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: existing.stripeCustomerId,
      return_url: `${getSiteUrl()}/configuracion`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof MissingStripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 501 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo abrir el portal." }, { status: 500 });
  }
}
