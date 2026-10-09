import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserSubscriptionRecord, UserSubscriptionStorePort, BillingPlan } from "@kan/core";

interface UserSubscriptionRow {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: BillingPlan;
  status: string | null;
  current_period_end: string | null;
}

function toRecord(row: UserSubscriptionRow): UserSubscriptionRecord {
  return {
    userId: row.user_id,
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    stripeSubscriptionId: row.stripe_subscription_id ?? undefined,
    plan: row.plan,
    status: row.status ?? undefined,
    currentPeriodEnd: row.current_period_end ?? undefined,
  };
}

/** Adaptador de UserSubscriptionStorePort sobre la tabla `user_subscriptions` (migración 0019) — solo lo usa apps/gateway (service_role), nunca apps/web. */
export class SupabaseUserSubscriptionStore implements UserSubscriptionStorePort {
  constructor(private readonly client: SupabaseClient) {}

  async getByUserId(userId: string): Promise<UserSubscriptionRecord | undefined> {
    const { data, error } = await this.client.from("user_subscriptions").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toRecord(data as UserSubscriptionRow) : undefined;
  }

  async getByStripeCustomerId(stripeCustomerId: string): Promise<UserSubscriptionRecord | undefined> {
    const { data, error } = await this.client
      .from("user_subscriptions")
      .select("*")
      .eq("stripe_customer_id", stripeCustomerId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toRecord(data as UserSubscriptionRow) : undefined;
  }

  async upsert(record: UserSubscriptionRecord): Promise<void> {
    const { error } = await this.client.from("user_subscriptions").upsert(
      {
        user_id: record.userId,
        stripe_customer_id: record.stripeCustomerId ?? null,
        stripe_subscription_id: record.stripeSubscriptionId ?? null,
        plan: record.plan,
        status: record.status ?? null,
        current_period_end: record.currentPeriodEnd ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
  }
}
