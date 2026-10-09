import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface UserSubscriptionRow {
  plan: "maker" | "pro";
  stripeCustomerId?: string;
}

/**
 * Lee la fila propia de `user_subscriptions` (migración 0019) — anon+RLS,
 * mismo cliente que el resto de `apps/web` (`createSupabaseServerClient()`).
 * Nunca escribe: la única escritura es el webhook de Stripe en
 * `apps/gateway` (service_role), ver `RLS: user_subscriptions_read_own`.
 * Sin fila todavía (nunca inició un checkout) → `undefined`, tratado como
 * plan "maker" por los callers.
 */
export async function getUserSubscription(userId: string): Promise<UserSubscriptionRow | undefined> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from("user_subscriptions")
    .select("plan, stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return undefined;
  return { plan: data.plan, stripeCustomerId: data.stripe_customer_id ?? undefined };
}
