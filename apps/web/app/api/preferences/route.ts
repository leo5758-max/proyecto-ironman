import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { buildPreferencesUseCases } from "@/lib/preferences/composition";

/**
 * Set/remove genérico de una preferencia — mismo store (`user_preferences`)
 * y mismos Use Cases que `updatePersonalityAction`/`updateVoiceAction`/
 * `updateDailyReportAction`/`setPluginConfigAction` ya usan (todos
 * `setPreference`/`removePreference` sobre una key distinta; `plugin_config:*`
 * conviven en la misma tabla, ver `(shell)/configuracion/page.tsx`). A
 * diferencia de esos server actions, que redirigen a `/configuracion`, esta
 * ruta devuelve JSON — la necesita `ConfiguracionPanel.tsx` (overlay del
 * hamburguesa en /inicio) para guardar sin navegar fuera del overlay.
 * `value` vacío ("") borra la preferencia; cualquier otro valor la setea.
 */
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as { key?: string; value?: unknown };
  const key = String(body.key ?? "").trim();
  if (!key) return NextResponse.json({ error: "key requerida." }, { status: 400 });

  const { setPreference, removePreference } = await buildPreferencesUseCases();
  if (body.value === "" || body.value === undefined || body.value === null) {
    await removePreference.execute(auth.user.userId, key);
  } else {
    await setPreference.execute(auth.user.userId, key, body.value);
  }
  return NextResponse.json({ ok: true });
}
