import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getUserSubscription } from "@/lib/billing/getUserSubscription";

/** Plan actual del usuario, para la sección "Tu plan" de /configuracion (PlanSection.tsx). Sin fila todavía = "maker", sin suscripción que gestionar. */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const existing = await getUserSubscription(auth.user.userId);
  return NextResponse.json({
    plan: existing?.plan ?? "maker",
    hasSubscription: Boolean(existing?.stripeCustomerId),
  });
}
