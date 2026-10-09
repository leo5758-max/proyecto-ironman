"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Shell reusable de un panel del Modo Presentación JARVIS: esquinas
 * "cortadas" tipo HUD militar (`clip-path`, en píxeles — bisel consistente
 * sin importar el tamaño del panel), borde SVG que se dibuja solo
 * (`stroke-dasharray`/`stroke-dashoffset`, ver `.hud-panel-border-path` en
 * globals.css) y entrada "materializa" (`.hud-panel`, escala desde 0.85 +
 * fade). `delayMs` escalona la aparición de varios paneles a la vez (vía
 * `--hud-delay`, una custom property CSS — sí hereda por cascada, a
 * diferencia de `animation-delay`).
 */
export function HudPanel({
  title,
  delayMs = 0,
  className = "",
  children,
}: {
  title?: string;
  delayMs?: number;
  className?: string;
  children: ReactNode;
}) {
  const style: CSSProperties & Record<"--hud-delay", string> = {
    "--hud-delay": `${delayMs}ms`,
    clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
    background: "color-mix(in srgb, black 82%, var(--color-accent) 5%)",
  };

  return (
    <div className={`hud-panel relative overflow-hidden border border-accent/20 ${className}`} style={style}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
        <polygon
          points="4,0.5 99.5,0.5 99.5,96 96,99.5 0.5,99.5 0.5,4"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
          className="hud-panel-border-path"
        />
      </svg>
      <div className="relative z-10 flex h-full flex-col gap-2 p-4">
        {title && <p className="font-mono text-[11px] uppercase tracking-widest text-accent/80">{title}</p>}
        {children}
      </div>
    </div>
  );
}
