"use client";

import { Maximize, Minimize } from "lucide-react";

/**
 * Botón de modo pantalla completa / kiosko — esquina inferior-izquierda,
 * única libre hoy (`SoundToggle` arriba-izquierda, `HamburgerMenu`
 * arriba-derecha, `NewWindowButton` abajo-derecha). Puramente
 * presentacional, mismo estilo que `SoundToggle.tsx` — el estado real
 * (Fullscreen API + `fullscreenchange`) vive en `useFullscreen`, montado en
 * `ImmersiveHome.tsx`.
 */
export function FullscreenToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={active ? "Salir de pantalla completa" : "Pantalla completa"}
      aria-pressed={active}
      title={active ? "Salir de pantalla completa" : "Pantalla completa"}
      className="press glass flex h-11 w-11 items-center justify-center rounded-full border border-line/80 text-ink transition-colors duration-fast hover:bg-white/10"
    >
      {active ? <Minimize className="h-5 w-5" aria-hidden="true" /> : <Maximize className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
