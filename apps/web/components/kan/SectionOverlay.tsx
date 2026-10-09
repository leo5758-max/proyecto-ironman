"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { KANAvatar } from "@/components/kan/KANAvatar";
import { HUD_SCOPE_STYLE } from "@/components/kan/hud/hudScope";
import { playSectionOpen, playSectionClose } from "@/lib/kan/sound";

/**
 * Chrome genérico de los overlays de sección del menú hamburguesa
 * (Sensores/Dispositivos/Secuencias/Alertas/Respaldos/Logs/Configuración en
 * /inicio, rediseño JARVIS) — mismo patrón visual que `JARVISDisplay.tsx`
 * (header HUD + body scrolleable + `HUD_SCOPE_STYLE`), pero genérico: recibe
 * `children` en vez de decidir qué panel mostrar. `z-[190]`, por debajo del
 * botón/arco del hamburguesa (`z-[210]`, siempre alcanzable para cerrar) y
 * de `JARVISDisplay` (`z-[200]`) — ambos modos son mutuamente excluyentes en
 * la práctica (`ImmersiveHome` cierra uno al abrir el otro), este orden solo
 * evita que un cambio de estado a mitad de camino deje algo inalcanzable.
 */
export function SectionOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  // Cue de apertura — efecto imperativo puntual al montar, no un setState:
  // no dispara el warning de react-hooks/set-state-in-effect.
  useEffect(() => {
    playSectionOpen();
  }, []);

  const closeWithSound = useCallback(() => {
    playSectionClose();
    onClose();
  }, [onClose]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeWithSound();
    }
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeWithSound]);

  return (
    <div className="hud-panel fixed inset-0 z-[190] overflow-hidden bg-black text-white" style={HUD_SCOPE_STYLE}>
      <div className="hud-scanlines pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative flex h-full flex-col gap-4 p-4 md:p-8">
        <header className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Cerrar sección"
            onClick={closeWithSound}
            className="press rounded-md p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <KANAvatar size="sm" activity="idle" showLabel={false} />
          <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-accent">{title}</h1>
        </header>

        <div className="hud-scroll min-h-0 flex-1 overflow-y-auto pb-2">{children}</div>
      </div>
    </div>
  );
}
