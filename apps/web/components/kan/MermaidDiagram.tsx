"use client";

import { useEffect, useRef, useState } from "react";
import { getMermaidConfig } from "@/lib/kan/mermaidConfig";

let diagramCount = 0;

type RenderResult = { code: string; svg: string } | { code: string; error: string };

/**
 * Renderiza un bloque ```mermaid``` como diagrama real — usada tanto
 * inline en el texto del chat (`RichMessageContent.tsx`) como dentro de la
 * ventana de diagrama (`DiagramRenderer.tsx`), un solo lugar para no
 * duplicar la lógica de mermaid. Carga `mermaid` con `import()` dinámico
 * (no en el bundle inicial de /inicio) y llama `mermaid.render()` — si el
 * código mermaid tiene un error de sintaxis, se muestra el error en vez de
 * romper la pantalla.
 *
 * `result` guarda junto al SVG/error el `code` que lo produjo — comparado
 * contra el `code` actual para saber si todavía está renderizando, en vez
 * de "limpiar" el estado al arrancar el efecto (eso dispararía
 * react-hooks/set-state-in-effect: los únicos `setResult` viven dentro del
 * callback async, después de un `await`).
 */
export function MermaidDiagram({
  code,
  simplifiedError = false,
  onValidityChange,
}: {
  code: string;
  simplifiedError?: boolean;
  /** `MermaidEditor.tsx` la usa para mostrar "Pedir revisión a KAN" solo cuando el diagrama actual renderiza sin error. */
  onValidityChange?: (valid: boolean) => void;
}) {
  const [result, setResult] = useState<RenderResult | null>(null);
  const idRef = useRef(`kan-mermaid-${++diagramCount}`);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize(getMermaidConfig());
        const { svg } = await mermaid.render(idRef.current, code);
        if (!cancelled) setResult({ code, svg });
      } catch (err) {
        if (!cancelled) setResult({ code, error: err instanceof Error ? err.message : "Sintaxis mermaid inválida." });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const current = result?.code === code ? result : null;

  // `onValidityChange` es una función importada/pasada por props, no un
  // setState local de este componente — llamarla acá no dispara
  // react-hooks/set-state-in-effect (esa regla solo mira setters de
  // `useState` propios de este componente).
  useEffect(() => {
    onValidityChange?.(current !== null && !("error" in current));
  }, [current, onValidityChange]);

  if (current && "error" in current) {
    if (simplifiedError) {
      const lineMatch = current.error.match(/line (\d+)/i);
      return (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {lineMatch ? `Hay un error en la línea ${lineMatch[1]}, revisá la sintaxis.` : "Hay un error en el diagrama, revisá la sintaxis."}
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-xs text-danger">
        No se pudo renderizar el diagrama: {current.error}
      </div>
    );
  }

  if (!current) {
    return <p className="text-xs text-ink-faint">Renderizando diagrama…</p>;
  }

  return (
    <div
      className="kan-mermaid overflow-x-auto rounded-lg bg-black/20 p-3 [&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: current.svg }}
    />
  );
}
