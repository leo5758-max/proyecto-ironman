export type ReferralRewardStatus = "pending" | "granted" | "failed";

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredId: string;
  rewardStatus: ReferralRewardStatus;
}

/**
 * Sistema de referidos (migraciones 0021/0022) — usado desde el Database
 * Webhook de Supabase Auth en apps/gateway (service_role, ver
 * authWebhookRoutes.ts + ReferralRewardService en @kan/gateway-core).
 * apps/web lee sus propios referidos directo con anon+RLS
 * (`referrals_read_own_as_referrer`), sin pasar por este puerto — este es
 * solo para la escritura, que solo el Gateway hace.
 */
export interface ReferralStorePort {
  /** `undefined` si ningún perfil tiene ese `referral_code` (código inválido/vencido). */
  findReferrerIdByCode(referralCode: string): Promise<string | undefined>;
  /** `undefined` si `referredId` ya tenía un referral registrado (constraint unique, alguien reintentó el mismo signup). */
  create(referrerId: string, referredId: string): Promise<ReferralRecord | undefined>;
  updateRewardStatus(referralId: string, status: ReferralRewardStatus): Promise<void>;
}
