"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { User, Brain, Sparkles, Volume2, Puzzle, Palette, Bell, Cpu, LogOut, Mail } from "lucide-react";
import type { MemoryEntry } from "@kan/core";
import { GEMINI_TTS_VOICES, DEFAULT_VOICE } from "@kan/voice-abstraction";
import { Card } from "@/components/ui/Card";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";
import { INPUT_CLASSES, PRIMARY_BUTTON_CLASSES, SECONDARY_BUTTON_CLASSES } from "@/components/ui/formStyles";
import { MemoryManager } from "@/components/configuracion/MemoryManager";
import { PluginConfigManager } from "@/components/configuracion/PluginConfigManager";
import { ThemeAccentPicker } from "@/components/configuracion/ThemeAccentPicker";
import { PushNotificationToggle } from "@/components/configuracion/PushNotificationToggle";
import { PlanSection } from "@/components/configuracion/PlanSection";
import { SoundToggle } from "@/components/kan/SoundToggle";
import { signOutAction } from "@/lib/auth/actions";

interface ProfileResponse {
  user: { userId: string; email: string };
  summary?: { profile: { displayName?: string } };
  memories: MemoryEntry[];
  preferences: {
    personality: string;
    voice?: string;
    dailyReportEnabled: boolean;
    dailyReportHour: number;
  };
  pluginConfigValues: Record<string, string>;
}

async function postJson(path: string, method: string, body: unknown) {
  await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

/**
 * Overlay de Configuración del menú hamburguesa en /inicio (rediseño
 * JARVIS) — mismo contenido/componentes que `(shell)/configuracion/page.tsx`,
 * pero como client component: los server actions que usa esa página
 * (`updateDisplayNameAction`, `updatePersonalityAction`, etc.) todos
 * `redirect()` a /configuracion, lo que navegaría fuera del overlay. Acá
 * cada mutación pega a `/api/profile`, `/api/preferences` o `/api/memories`
 * (devuelven JSON) y `refresh()` vuelve a pedir `/api/profile` para reflejar
 * el cambio, sin salir nunca de /inicio.
 */
export function ConfiguracionPanel({ onNavigateSection }: { onNavigateSection?: (section: "dispositivos" | "logs") => void }) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // `refresh` (re-pedir tras cada mutación) es un `useCallback` aparte, solo
  // llamado desde manejadores de evento — el fetch inicial va inline acá
  // (no vía `refresh`) para que el efecto llame `setProfile` recién dentro
  // del `.then()`, no de forma sincrónica en el cuerpo del efecto.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setProfile(data as ProfileResponse);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/profile", { cache: "no-store" });
    if (response.ok) setProfile((await response.json()) as ProfileResponse);
  }, []);

  function flashSaved() {
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  async function handleDisplayName(formData: FormData) {
    const displayName = String(formData.get("displayName") ?? "").trim();
    if (!displayName) return;
    await postJson("/api/profile", "POST", { displayName });
    await refresh();
    flashSaved();
  }

  async function handlePersonality(formData: FormData) {
    const personality = String(formData.get("personality") ?? "").trim();
    await postJson("/api/preferences", "POST", { key: "personality", value: personality });
    await refresh();
    flashSaved();
  }

  async function handleVoice(formData: FormData) {
    const voice = String(formData.get("voice") ?? "").trim();
    await postJson("/api/preferences", "POST", { key: "ttsVoice", value: voice });
    await refresh();
    flashSaved();
  }

  async function handleDailyReport(formData: FormData) {
    const enabled = formData.get("dailyReportEnabled") === "on";
    const hour = Number(formData.get("dailyReportHour") ?? 9);
    await postJson("/api/preferences", "POST", { key: "dailyReportEnabled", value: enabled });
    await postJson("/api/preferences", "POST", { key: "dailyReportHour", value: hour });
    await refresh();
    flashSaved();
  }

  async function handlePluginSave(formData: FormData) {
    const envVar = String(formData.get("envVar") ?? "").trim();
    const value = String(formData.get("value") ?? "").trim();
    if (!envVar) return;
    await postJson("/api/preferences", "POST", { key: `plugin_config:${envVar}`, value });
    await refresh();
    flashSaved();
  }

  async function handleMemoryAdd(formData: FormData) {
    const category = String(formData.get("category") ?? "").trim();
    const key = String(formData.get("key") ?? "").trim();
    const value = String(formData.get("value") ?? "").trim();
    if (!category || !key || !value) return;
    await postJson("/api/memories", "POST", { category, key, value });
    await refresh();
    flashSaved();
  }

  async function handleMemoryRemove(formData: FormData) {
    const category = String(formData.get("category") ?? "");
    const key = String(formData.get("key") ?? "");
    await postJson("/api/memories", "DELETE", { category, key });
    await refresh();
    flashSaved();
  }

  if (!profile) {
    return <p className="text-sm text-ink-faint">Cargando…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {justSaved && <p className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">Guardado.</p>}

      <Card className="fade-in flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <User className="h-4 w-4" aria-hidden="true" />
          Perfil
        </h2>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-ink-faint">Email</span>
          <span className="text-sm text-ink">{profile.user.email}</span>
        </div>
        <form action={handleDisplayName} className="flex flex-col gap-2">
          <label htmlFor="displayName" className="text-xs text-ink-faint">
            Nombre para mostrar
          </label>
          <div className="flex gap-2">
            <input
              id="displayName"
              name="displayName"
              type="text"
              defaultValue={profile.summary?.profile.displayName ?? ""}
              placeholder="Ej: Fabián"
              maxLength={60}
              className={`flex-1 ${INPUT_CLASSES}`}
            />
            <button type="submit" className={PRIMARY_BUTTON_CLASSES}>
              Guardar
            </button>
          </div>
        </form>
      </Card>

      <Card className="fade-in flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Cuenta
        </h2>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-ink-faint">Sesión iniciada como</span>
          <span className="text-sm text-ink">{profile.user.email}</span>
        </div>
        <form action={signOutAction}>
          <button type="submit" className={`self-start ${SECONDARY_BUTTON_CLASSES}`}>
            Cerrar sesión
          </button>
        </form>
      </Card>

      <PlanSection />

      <Card className="fade-in flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <Palette className="h-4 w-4" aria-hidden="true" />
          Identidad visual
        </h2>
        <p className="text-xs text-ink-faint">El color de acento de KAN — HUD, avatar, botones y glow. Se guarda en este navegador.</p>
        <ThemeAccentPicker />
        <div className="border-t border-line pt-4">
          <SoundToggle variant="row" />
        </div>
      </Card>

      <Card className="fade-in flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Personalidad
        </h2>
        <p className="text-xs text-ink-faint">Cómo querés que KAN te hable — tono, estilo, límites. Se aplica en cada conversación nueva.</p>
        <form action={handlePersonality} className="flex flex-col gap-2">
          <textarea
            name="personality"
            defaultValue={profile.preferences.personality}
            placeholder="Ej: Sé directo y breve, sin rodeos. Tono técnico. Nunca uses emojis."
            maxLength={1000}
            className={`min-h-[5rem] ${INPUT_CLASSES}`}
          />
          <button type="submit" className={`self-start ${PRIMARY_BUTTON_CLASSES}`}>
            Guardar
          </button>
        </form>
      </Card>

      <Card className="fade-in flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          Voz
        </h2>
        <p className="text-xs text-ink-faint">La voz que usa KAN para leerte sus respuestas en voz alta.</p>
        <form action={handleVoice} className="flex flex-col gap-2">
          <select name="voice" defaultValue={profile.preferences.voice ?? DEFAULT_VOICE} className={INPUT_CLASSES}>
            {GEMINI_TTS_VOICES.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} — {v.style}
              </option>
            ))}
          </select>
          <button type="submit" className={`self-start ${PRIMARY_BUTTON_CLASSES}`}>
            Guardar
          </button>
        </form>
      </Card>

      <Card className="fade-in flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <Brain className="h-4 w-4" aria-hidden="true" />
          Memoria
        </h2>
        <p className="text-xs text-ink-faint">
          Hechos que KAN tiene en cuenta en cada conversación. KAN los guarda solo cuando se lo pedís en el chat (&quot;recordá
          que...&quot;) — acá podés agregarlos, editarlos o borrarlos a mano también.
        </p>
        <MemoryManager memories={profile.memories} onAdd={handleMemoryAdd} onRemove={handleMemoryRemove} />
      </Card>

      <div id="plugins">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-medium text-ink-muted">
          <Puzzle className="h-4 w-4" aria-hidden="true" />
          Plugins de hardware
        </h2>
        <p className="mb-3 text-xs text-ink-faint">Conexiones de cada plugin (hosts SSH, brokers MQTT, targets Modbus, etc.).</p>
        <PluginConfigManager values={profile.pluginConfigValues} onSave={handlePluginSave} />
      </div>

      <Card className="fade-in flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <Cpu className="h-4 w-4" aria-hidden="true" />
          Dispositivos
        </h2>
        <p className="text-xs text-ink-faint">Ver el estado de tus equipos y sensores conectados, y compartir acceso con otros usuarios.</p>
        {onNavigateSection ? (
          <button type="button" onClick={() => onNavigateSection("dispositivos")} className={`self-start ${SECONDARY_BUTTON_CLASSES}`}>
            Ir a Dispositivos
          </button>
        ) : (
          <Link href="/dispositivos" className={`self-start ${SECONDARY_BUTTON_CLASSES}`}>
            Ir a Dispositivos
          </Link>
        )}
      </Card>

      <Card className="fade-in flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <Bell className="h-4 w-4" aria-hidden="true" />
          Notificaciones push
        </h2>
        <p className="text-xs text-ink-faint">Recibí un aviso en tu celular cuando se dispare una alerta, aunque KAN esté cerrado.</p>
        <PushNotificationToggle />
      </Card>

      <Card className="fade-in flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Reporte diario por email
        </h2>
        <p className="text-xs text-ink-faint">
          Un resumen de las últimas 24 horas (alertas disparadas, acciones ejecutadas, sensores fuera de rango) a tu email, todos los
          días a la hora que elijas.
        </p>
        <form action={handleDailyReport} className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input type="checkbox" name="dailyReportEnabled" defaultChecked={profile.preferences.dailyReportEnabled} />
            Activar reporte diario
          </label>
          <label className="flex max-w-[10rem] flex-col gap-1 text-xs text-ink-faint">
            Hora (UTC)
            <select name="dailyReportHour" defaultValue={profile.preferences.dailyReportHour} className={INPUT_CLASSES}>
              {Array.from({ length: 24 }, (_, hour) => (
                <option key={hour} value={hour}>
                  {String(hour).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={`self-start ${PRIMARY_BUTTON_CLASSES}`}>
            Guardar
          </button>
        </form>
      </Card>

      <PlaceholderPage title="Proveedores de IA" description="Elegir proveedor de IA llega en un incremento futuro." />

      <p className="text-xs text-ink-faint">
        {onNavigateSection ? (
          <button type="button" onClick={() => onNavigateSection("logs")} className="text-accent hover:underline">
            Ver registro técnico de actividad
          </button>
        ) : (
          <Link href="/logs" className="text-accent hover:underline">
            Ver registro técnico de actividad
          </Link>
        )}
      </p>
    </div>
  );
}
