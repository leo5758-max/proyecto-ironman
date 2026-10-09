"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { KANAvatar } from "@/components/kan/KANAvatar";
import { SensorsPanel } from "@/components/kan/hud/panels/SensorsPanel";
import { DevicesPanel } from "@/components/kan/hud/panels/DevicesPanel";
import { AlertsPanel } from "@/components/kan/hud/panels/AlertsPanel";
import { StatusPanel } from "@/components/kan/hud/panels/StatusPanel";
import { HUD_SCOPE_STYLE } from "@/components/kan/hud/hudScope";
import { playDisplayActivate } from "@/lib/kan/sound";
import type { ActiveDisplay, ChatMessage } from "@/lib/chat/useConversation";

const TRANSITION_MS = 700;

const VIEW_TITLES: Record<ActiveDisplay["view"], string> = {
  sensors: "Sensores",
  devices: "Dispositivos",
  alerts: "Alertas",
  status: "Estado general",
  custom: "Panel general",
};

/**
 * Modo Presentación JARVIS — toma control de toda la pantalla
 * (`fixed inset-0 z-[200]`, por encima de `BootSequence`, el `z-[100]` más
 * alto hoy) cuando `useConversation().activeDisplay` no es null (ver
 * `KANHome.tsx`). Dos fases: `"transition"` (negro + la bolita de KAN
 * pulsando, ~700ms) y `"active"` (los paneles pedidos, con animación de
 * materialización). El usuario puede seguir escribiéndole a KAN sin salir
 * del modo (`onSendMessage` — mismo `sendMessage` de `useConversation`,
 * que además intercepta "volver"/"cerrar"/etc. para cerrar sin ida y vuelta
 * al LLM, ver ese hook).
 */
export function JARVISDisplay({
  display,
  messages,
  isSending,
  streamingStatus,
  onClose,
  onSendMessage,
}: {
  display: ActiveDisplay;
  messages: ChatMessage[];
  isSending: boolean;
  streamingStatus: string | null;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}) {
  const [phase, setPhase] = useState<"transition" | "active">("transition");
  const [command, setCommand] = useState("");

  useEffect(() => {
    setPhase("transition");
    const timer = setTimeout(() => {
      setPhase("active");
      playDisplayActivate();
    }, TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [display.view, display.title]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant")?.content;
  const showSensors = display.view === "sensors" || display.view === "custom";
  const showDevices = display.view === "devices" || display.view === "custom";
  const showAlerts = display.view === "alerts" || display.view === "custom";
  const showStatus = display.view === "status" || display.view === "custom";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!command.trim()) return;
    onSendMessage(command);
    setCommand("");
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-black text-white" style={HUD_SCOPE_STYLE}>
      <div className="hud-scanlines pointer-events-none absolute inset-0" aria-hidden="true" />

      {phase === "transition" && (
        <div className="flex h-full items-center justify-center">
          <KANAvatar size="lg" activity="listening" showLabel={false} />
        </div>
      )}

      {phase === "active" && (
        <div className="relative flex h-full flex-col gap-4 p-4 md:p-8">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <KANAvatar size="sm" activity={isSending ? "thinking" : "idle"} showLabel={false} />
              <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-accent">
                {display.title ?? VIEW_TITLES[display.view]}
              </h1>
            </div>
            <button
              type="button"
              aria-label="Cerrar modo presentación"
              onClick={onClose}
              className="press rounded-md p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="hud-scroll min-h-0 flex-1 overflow-y-auto pb-2">
            <div className="flex flex-col gap-4">
              {showStatus && <StatusPanel delayMs={0} />}
              {showSensors && <SensorsPanel />}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {showDevices && <DevicesPanel delayMs={100} />}
                {showAlerts && <AlertsPanel delayMs={150} />}
              </div>
            </div>
          </div>

          <footer className="flex flex-col gap-2">
            {(streamingStatus || lastAssistantMessage) && (
              <p className="truncate font-mono text-xs text-white/50">{streamingStatus ?? lastAssistantMessage}</p>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-accent/20 pt-3">
              <span className="font-mono text-accent">›</span>
              <input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder='Seguí hablándole a KAN, o escribí "volver" para cerrar…'
                disabled={isSending}
                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-white placeholder:text-white/30 outline-none disabled:opacity-50"
              />
            </form>
          </footer>
        </div>
      )}
    </div>
  );
}
