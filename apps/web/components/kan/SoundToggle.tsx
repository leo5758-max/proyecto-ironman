"use client";

import { Volume2, VolumeX } from "lucide-react";
import { SECONDARY_BUTTON_CLASSES } from "@/components/ui/formStyles";
import { useSoundEnabled } from "@/lib/kan/sound";

/**
 * Mute/unmute de los cues de sonido del rediseño inmersivo — dos usos del
 * mismo estado (`useSoundEnabled`, `lib/kan/sound.ts`): el ícono compacto
 * en la esquina de /inicio (`variant="icon"`, default) y la fila con label
 * dentro de la card "Identidad visual" de `ConfiguracionPanel.tsx`
 * (`variant="row"`). Mismo patrón visual que `HamburgerMenu`'s botón
 * (ícono) y `PushNotificationToggle` (fila con botón), para no inventar un
 * tercer estilo de toggle.
 */
export function SoundToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const { enabled, toggle } = useSoundEnabled();

  if (variant === "row") {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-ink-muted">Sonido de KAN</span>
          <span className="text-xs text-ink-faint">Los cues del menú, las secciones y el modo presentación.</span>
        </div>
        <button type="button" onClick={toggle} className={SECONDARY_BUTTON_CLASSES}>
          <span className="flex items-center gap-1.5">
            {enabled ? <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> : <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />}
            {enabled ? "Activado" : "Desactivado"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? "Silenciar a KAN" : "Activar sonido de KAN"}
      aria-pressed={enabled}
      title={enabled ? "Silenciar a KAN" : "Activar sonido de KAN"}
      className="press glass flex h-11 w-11 items-center justify-center rounded-full border border-line/80 text-ink transition-colors duration-fast hover:bg-white/10"
    >
      {enabled ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
