"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// Deben coincidir con los delays/duraciones de `.kan-boot-*` en globals.css
// — el timing real vive en CSS (declarativo, sin drift entre renders), pero
// JS necesita los mismos números para avisarle a `ImmersiveChrome` cuándo
// revelar los paneles reales / cuándo desmontar este overlay.
const PANELS_REVEAL_MS = 2_600;
const DONE_MS = 3_000;

const INIT_LINES = ["Iniciando sistema…", "Conectando sensores…", "Cargando módulos…"];
const LINE_START_MS = 700;
const LINE_STEP_MS = 300;

/**
 * Boot sequence estilo JARVIS (~3s) — "KAN" con efecto de escritura, líneas
 * de terminal apareciendo debajo, fade out hacia la interfaz real. Se
 * muestra una sola vez por sesión de browser — ver `BOOT_SESSION_KEY` en
 * `ImmersiveChrome.tsx`, que decide si montar este componente o no; acá
 * adentro no se vuelve a chequear `sessionStorage`.
 *
 * Puramente cosmético sobre lo que ya está cargado: no bloquea ni retrasa
 * ningún fetch real, es un overlay encima de una UI que ya está montada y
 * lista debajo (ver el `entering`/`panelsRevealed` de `ImmersiveChrome`).
 */
export function BootSequence({ onPanelsReveal, onDone }: { onPanelsReveal: () => void; onDone: () => void }) {
  const timersRef = useRef<{ panels: number; done: number } | null>(null);

  useEffect(() => {
    const panelsTimer = window.setTimeout(onPanelsReveal, PANELS_REVEAL_MS);
    const doneTimer = window.setTimeout(onDone, DONE_MS);
    timersRef.current = { panels: panelsTimer, done: doneTimer };

    return () => {
      window.clearTimeout(panelsTimer);
      window.clearTimeout(doneTimer);
    };
    // Se ejecuta una única vez al montar — onPanelsReveal/onDone son
    // estables (useCallback sin deps en ImmersiveChrome), reiniciar el
    // timeline en cada re-render del padre reproduciría el boot de nuevo a
    // mitad de camino.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "Saltar" corta el timeline antes de tiempo por el mismo camino de
  // salida que el timeline natural (mismos dos callbacks), solo adelantado
  // — no hay un tercer estado "salteado" que sincronizar en ningún lado.
  function handleSkip() {
    if (timersRef.current) {
      window.clearTimeout(timersRef.current.panels);
      window.clearTimeout(timersRef.current.done);
    }
    onPanelsReveal();
    onDone();
  }

  return (
    <div className="kan-boot-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-black">
      <button
        type="button"
        onClick={handleSkip}
        className="press absolute top-4 right-4 text-xs text-ink-faint transition-colors hover:text-ink"
      >
        Saltar
      </button>

      {/* Puramente decorativo — el botón "Saltar" de arriba es el único control real del overlay. */}
      <div aria-hidden="true" className="flex flex-col items-center gap-5">
        <span className="kan-boot-typewriter text-gradient text-4xl font-semibold tracking-tight">KAN</span>
        <div className="flex flex-col items-center gap-1">
          {INIT_LINES.map((line, index) => {
            const style: CSSProperties & Record<"--kan-boot-line-delay", string> = {
              "--kan-boot-line-delay": `${LINE_START_MS + index * LINE_STEP_MS}ms`,
            };
            return (
              <p key={line} style={style} className="kan-boot-line font-mono text-xs tracking-widest text-ink-muted uppercase">
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
