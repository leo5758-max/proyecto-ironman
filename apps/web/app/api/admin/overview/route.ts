import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin/isAdmin";
import { gatewayFetch } from "@/lib/gateway/gatewayFetch";

/**
 * BFF de /admin — el navegador nunca habla directo con el Gateway (ver
 * gatewayFetch.ts). Doble chequeo de admin a propósito: proxy.ts ya lo hizo
 * para la navegación de la página, pero esta ruta también es alcanzable
 * aparte (fetch directo), así que repite el gate (mismo criterio que
 * requireUser() en el resto de /api).
 */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const client = await createSupabaseServerClient();
  if (!(await isAdmin(client, auth.user.userId))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const response = await gatewayFetch("/v1/admin/overview");
    if (!response.ok) {
      return NextResponse.json({ error: "El Gateway no pudo responder." }, { status: 502 });
    }
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: "KAN no está disponible en este momento." }, { status: 500 });
  }
}
