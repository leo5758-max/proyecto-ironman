"use client";

import { useEffect, useRef, useState } from "react";

/** Cuenta de 0 al valor real vía `requestAnimationFrame` — sin librerías nuevas de animación (pedido explícito del Modo Presentación JARVIS). */
export function CountUpNumber({
  value,
  durationMs = 900,
  decimals,
  className = "",
}: {
  value: number;
  durationMs?: number;
  /** Por defecto: 0 decimales si `value` es entero, 1 si no. */
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number.isFinite(value) ? value : 0;

    function tick(now: number) {
      const t = Math.min((now - start) / durationMs, 1);
      // ease-out cúbico — arranca rápido, frena suave (mismo criterio "no linear" que el resto de las animaciones HUD).
      const eased = 1 - (1 - t) ** 3;
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  const resolvedDecimals = decimals ?? (Number.isInteger(value) ? 0 : 1);

  return <span className={className}>{display.toFixed(resolvedDecimals)}</span>;
}
