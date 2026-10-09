import { Router } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { safeCompareToken } from "@kan/plugin-contract";

const LIST_USERS_PAGE_SIZE = 200;
const ACTIVE_WINDOW_DAYS = 30;

interface AuthUserRow {
  userId: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
}

/**
 * `auth.admin.listUsers()` está paginada por diseño de GoTrue (nunca devuelve
 * todo de una) — mismo patrón que el comentario de resolveUserEmail en
 * server.ts ("Admin API real de Supabase"), acá recorriendo todas las
 * páginas en vez de resolver un solo userId. Volumen esperado chico (MVP),
 * ver docs/00 — si la base de usuarios crece mucho esto necesita
 * paginación real en la UI en vez de traer todo de una.
 */
async function listAllAuthUsers(client: SupabaseClient): Promise<AuthUserRow[]> {
  const rows: AuthUserRow[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: LIST_USERS_PAGE_SIZE });
    if (error || !data) break;
    for (const user of data.users) {
      rows.push({
        userId: user.id,
        email: user.email ?? "",
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
      });
    }
    if (data.users.length < LIST_USERS_PAGE_SIZE) break;
  }
  return rows;
}

/**
 * Panel de administración (solo lectura) — router separado, protegido con el
 * mismo `internalToken` que `createRoutes()` (apps/web es el único caller,
 * vía `/api/admin/overview`, que ya verificó que el usuario es admin antes de
 * llegar acá). Un único endpoint que arma las 3 secciones del panel de una
 * — evita repetir la paginación de `listUsers()` tres veces.
 */
export function createAdminRoutes(supabaseClient: SupabaseClient, internalToken: string): Router {
  const router = Router();

  router.get("/v1/admin/overview", async (req, res) => {
    if (!safeCompareToken(req.headers.authorization, `Bearer ${internalToken}`)) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    try {
      const [authUsers, profilesResult, subscriptionsResult] = await Promise.all([
        listAllAuthUsers(supabaseClient),
        supabaseClient.from("profiles").select("id, display_name"),
        supabaseClient.from("user_subscriptions").select("user_id, plan, status, current_period_end, stripe_customer_id"),
      ]);

      const displayNameByUserId = new Map<string, string | null>(
        (profilesResult.data ?? []).map((row) => [row.id as string, row.display_name as string | null]),
      );
      const subscriptionByUserId = new Map(
        (subscriptionsResult.data ?? []).map((row) => [row.user_id as string, row]),
      );

      const now = Date.now();
      const activeCutoff = now - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

      const users = authUsers.map((user) => {
        const subscription = subscriptionByUserId.get(user.userId);
        return {
          userId: user.userId,
          email: user.email,
          displayName: displayNameByUserId.get(user.userId) ?? null,
          plan: (subscription?.plan as "maker" | "pro" | undefined) ?? "maker",
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
        };
      });

      const proUsers = users.filter((user) => user.plan === "pro");
      const subscriptions = proUsers.map((user) => {
        const subscription = subscriptionByUserId.get(user.userId);
        return {
          userId: user.userId,
          email: user.email,
          status: (subscription?.status as string | null) ?? null,
          currentPeriodEnd: (subscription?.current_period_end as string | null) ?? null,
        };
      });

      const totalUsers = users.length;
      const activeLast30Days = users.filter(
        (user) => user.lastSignInAt !== null && new Date(user.lastSignInAt).getTime() >= activeCutoff,
      ).length;
      const makerToProConversionRate = totalUsers === 0 ? 0 : proUsers.length / totalUsers;

      res.json({
        users,
        subscriptions,
        metrics: { totalUsers, activeLast30Days, makerToProConversionRate },
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Error desconocido" });
    }
  });

  return router;
}
