import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReferralRecord, ReferralRewardStatus, ReferralStorePort } from "@kan/core";

interface ReferralRow {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_status: ReferralRewardStatus;
}

function toRecord(row: ReferralRow): ReferralRecord {
  return { id: row.id, referrerId: row.referrer_id, referredId: row.referred_id, rewardStatus: row.reward_status };
}

/** Adaptador de ReferralStorePort (migraciones 0021/0022) — solo lo usa apps/gateway (service_role), nunca apps/web. */
export class SupabaseReferralStore implements ReferralStorePort {
  constructor(private readonly client: SupabaseClient) {}

  async findReferrerIdByCode(referralCode: string): Promise<string | undefined> {
    const { data, error } = await this.client
      .from("profiles")
      .select("id")
      .eq("referral_code", referralCode)
      .maybeSingle();
    if (error || !data) return undefined;
    return data.id as string;
  }

  async create(referrerId: string, referredId: string): Promise<ReferralRecord | undefined> {
    const { data, error } = await this.client
      .from("referrals")
      .insert({ referrer_id: referrerId, referred_id: referredId })
      .select("id, referrer_id, referred_id, reward_status")
      .maybeSingle();
    // `referred_id` es unique (migración 0022) — un conflicto acá significa
    // que este usuario ya tiene un referral registrado (reintento del mismo
    // signup, o el webhook de Supabase reentregando el evento); tratarlo
    // como "no hay nada nuevo que hacer", no como un error.
    if (error || !data) return undefined;
    return toRecord(data as ReferralRow);
  }

  async updateRewardStatus(referralId: string, status: ReferralRewardStatus): Promise<void> {
    const { error } = await this.client.from("referrals").update({ reward_status: status }).eq("id", referralId);
    if (error) throw new Error(error.message);
  }
}
