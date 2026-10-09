import { Router } from "express";
import { buildWelcomeEmailBody, welcomeEmailSubject, type EmailServicePort, type ReferralRewardService } from "@kan/gateway-core";
import { safeCompareToken, type LoggerPort } from "@kan/plugin-contract";
import type { ReferralStorePort } from "@kan/core";

interface SupabaseUserWebhookRecord {
  id?: string;
  email?: string;
  raw_user_meta_data?: { full_name?: string; name?: string; referral_code?: string };
}

function nameFromRecord(record: SupabaseUserWebhookRecord): string {
  const metaName = record.raw_user_meta_data?.full_name ?? record.raw_user_meta_data?.name;
  if (metaName) return metaName;
  // Sin nombre real disponible (registro por email/contraseña, sin campo de
  // nombre en signup/page.tsx) — la parte local del email como fallback,
  // mismo criterio "degradar con gracia" que el resto del proyecto.
  const email = record.email ?? "";
  return email.split("@")[0] || "che";
}

/**
 * Crédito de referido (Mejora "sistema de referidos") — si el signup trae un
 * `referral_code` válido, registra el referral y dispara la recompensa
 * (ReferralRewardService, Stripe). Nunca deja que un error acá haga
 * responder 500 al webhook: eso haría que Supabase reintregue el evento
 * entero, incluyendo un segundo email de bienvenida — cualquier falla queda
 * contenida acá (loggeada, `referrals.reward_status='failed'` si llegó a
 * crearse la fila).
 */
async function processReferral(
  record: SupabaseUserWebhookRecord,
  referralStore: ReferralStorePort,
  referralRewardService: ReferralRewardService | undefined,
): Promise<void> {
  const referralCode = record.raw_user_meta_data?.referral_code;
  const referredId = record.id;
  if (!referralCode || !referredId) return;

  const referrerId = await referralStore.findReferrerIdByCode(referralCode);
  if (!referrerId || referrerId === referredId) return; // código inválido, o alguien pasó su propio código

  const referral = await referralStore.create(referrerId, referredId);
  if (!referral) return; // ya existía un referral para este usuario (reintento del mismo signup)

  if (referralRewardService) {
    await referralRewardService.grant(referral.id, referrerId, referredId);
  } else {
    await referralStore.updateRewardStatus(referral.id, "failed");
  }
}

/**
 * Database Webhook de Supabase sobre `auth.users` (INSERT) — cubre los 3
 * caminos que crean una cuenta (password, Magic Link, Google OAuth: los
 * tres insertan la misma fila, a diferencia de interceptar solo
 * `signup/actions.ts`, que se pierde los otros dos). Se configura desde el
 * Dashboard de Supabase (Database → Webhooks), no por migración SQL — la URL
 * destino es específica de cada deploy, ver apps/gateway/.env.example.
 *
 * Mismo patrón que `createPairingRoutes`/`createStripeWebhookRoutes`: router
 * separado, sin el token interno, autenticado por su propio secreto (acá,
 * un header custom que se configura al crear el webhook en el Dashboard).
 */
export function createAuthWebhookRoutes(
  emailService: EmailServicePort | undefined,
  webhookSecret: string,
  appUrl: string,
  referralStore: ReferralStorePort,
  referralRewardService: ReferralRewardService | undefined,
  logger: LoggerPort,
): Router {
  const router = Router();

  router.post("/webhooks/supabase-auth", async (req, res) => {
    if (!safeCompareToken(req.headers["x-webhook-secret"] as string | undefined, webhookSecret)) {
      res.status(401).json({ error: "Secreto de webhook inválido." });
      return;
    }

    const record = (req.body?.record ?? {}) as SupabaseUserWebhookRecord;

    await processReferral(record, referralStore, referralRewardService).catch((error) => {
      logger.error(`[authWebhookRoutes] error procesando referido: ${error}`);
    });

    // 200 aunque no haya emailService configurado (RESEND_API_KEY ausente)
    // — nunca hace que Supabase reintente por algo que no vamos a poder
    // resolver solos, mismo criterio que el resto de las integraciones
    // opcionales del Gateway.
    if (!emailService) {
      res.json({ received: true, sent: false });
      return;
    }

    if (!record.email) {
      res.json({ received: true, sent: false });
      return;
    }

    try {
      const name = nameFromRecord(record);
      const { html, text } = buildWelcomeEmailBody({ name, appUrl });
      await emailService.send({ to: record.email, subject: welcomeEmailSubject(name), html, text });
      res.json({ received: true, sent: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Error desconocido" });
    }
  });

  return router;
}
