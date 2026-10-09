import type { CSSProperties } from "react";

/**
 * Sobrescribe la paleta de superficies del sistema de diseño a valores casi
 * negros SOLO dentro de la HUD (cascada CSS, sin tocar ningún componente
 * reusado — SensorChart/DeviceList ya leen var(--color-*) sin nada
 * hardcodeado). `--color-accent` NUNCA se sobrescribe acá: sigue siendo el
 * que el usuario configuró en /configuracion. Extraído de `JARVISDisplay.tsx`
 * (Modo Presentación) para que `SectionOverlay.tsx` (overlays de sección del
 * hamburguesa en /inicio, rediseño JARVIS) reuse exactamente la misma paleta
 * sin duplicarla.
 */
export const HUD_SCOPE_STYLE: CSSProperties = {
  "--color-surface": "#000000",
  "--color-surface-2": "#050505",
  "--color-surface-3": "#0a0a0a",
  "--color-line": "color-mix(in srgb, var(--color-accent) 25%, black)",
  "--color-line-strong": "color-mix(in srgb, var(--color-accent) 40%, black)",
  "--color-ink": "#ffffff",
  "--color-ink-muted": "rgba(255, 255, 255, 0.7)",
  "--color-ink-faint": "rgba(255, 255, 255, 0.45)",
} as CSSProperties;
