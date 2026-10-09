import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { buildAuthUseCases } from "@/lib/auth/composition";
import { buildMemoryUseCases } from "@/lib/memory/composition";
import { buildPreferencesUseCases } from "@/lib/preferences/composition";

const PLUGIN_CONFIG_KEY_PREFIX = "plugin_config:";

/**
 * BFF de perfil (mismo criterio que /api/status) — agrega en un solo fetch
 * todo lo que `(shell)/configuracion/page.tsx` resuelve server-side, para
 * que `ConfiguracionPanel.tsx` (overlay del hamburguesa en /inicio,
 * rediseño JARVIS) pueda pedirlo como client component sin duplicar cada
 * composition root en su propio fetch.
 */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const [summary, memories, preferences] = await Promise.all([
    (await buildAuthUseCases()).getDashboardSummary.execute(auth.user.userId).catch(() => undefined),
    (await buildMemoryUseCases()).listMemories.execute(auth.user.userId),
    (await buildPreferencesUseCases()).listPreferences.execute(auth.user.userId),
  ]);

  const personality = preferences.find((p) => p.key === "personality")?.value;
  const voice = preferences.find((p) => p.key === "ttsVoice")?.value;
  const dailyReportEnabled = preferences.find((p) => p.key === "dailyReportEnabled")?.value === true;
  const dailyReportHour = preferences.find((p) => p.key === "dailyReportHour")?.value;
  const pluginConfigValues = Object.fromEntries(
    preferences
      .filter((p) => p.key.startsWith(PLUGIN_CONFIG_KEY_PREFIX))
      .map((p) => [p.key.slice(PLUGIN_CONFIG_KEY_PREFIX.length), String(p.value ?? "")]),
  );

  return NextResponse.json({
    user: { userId: auth.user.userId, email: auth.user.email },
    summary,
    memories,
    preferences: {
      personality: typeof personality === "string" ? personality : "",
      voice: typeof voice === "string" ? voice : undefined,
      dailyReportEnabled,
      dailyReportHour: typeof dailyReportHour === "number" ? dailyReportHour : 9,
    },
    pluginConfigValues,
  });
}

/** Actualiza `displayName` — devuelve JSON en vez de `redirect()` (a diferencia de `updateDisplayNameAction`), para no navegar fuera del overlay. */
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as { displayName?: string };
  const displayName = String(body.displayName ?? "").trim();
  if (!displayName) return NextResponse.json({ error: "displayName requerido." }, { status: 400 });

  const { updateDisplayName } = await buildAuthUseCases();
  await updateDisplayName.execute(auth.user.userId, displayName);
  return NextResponse.json({ ok: true });
}
