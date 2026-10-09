import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ReferralSummary {
  referralCode: string | null;
  invitedCount: number;
}

/**
 * Lee el código de referido propio (`profiles.referral_code`, migración
 * 0021) + cuántos amigos invitó (`count(referrals)`, migración 0022) — anon+
 * RLS (`referrals_read_own_as_referrer`), mismo cliente que el resto de
 * apps/web. Nunca escribe: la única escritura es el webhook de Supabase Auth
 * en apps/gateway (service_role), ver ReferralRewardService.
 */
export async function getReferralSummary(userId: string): Promise<ReferralSummary> {
  const client = await createSupabaseServerClient();

  const [profileResult, referralsResult] = await Promise.all([
    client.from("profiles").select("referral_code").eq("id", userId).maybeSingle(),
    client.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", userId),
  ]);

  return {
    referralCode: profileResult.data?.referral_code ?? null,
    invitedCount: referralsResult.count ?? 0,
  };
}
