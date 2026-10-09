import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * ¿El usuario tiene una fila en `admin_users` (migración 0020)? Lectura
 * anon+RLS (`admin_users_read_own`) — funciona con cualquier cliente de
 * Supabase ya atado a la sesión del usuario actual, tanto el que arma
 * proxy.ts (cookies de la request) como `createSupabaseServerClient()`
 * (Server Components), así que este helper no construye ninguno propio.
 */
export async function isAdmin(client: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await client.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
  return data !== null;
}
