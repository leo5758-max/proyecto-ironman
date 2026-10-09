"use client";

import { Download } from "lucide-react";
import { MermaidEditor } from "@/components/kan/MermaidEditor";
import { SandboxedFrame } from "@/components/kan/SandboxedFrame";
import { wrapSvgDocument, wrapHtmlDocument } from "@/lib/kan/sandboxedHtml";
import { exportSvgStringAsPng } from "@/lib/kan/exportSvgAsPng";

/**
 * Contenido de la ventana `kind: "diagram"`. `format: "mermaid"` (`content`
 * ya generado por KAN, o vacío si se abrió a mano desde `NewWindowButton`)
 * usa `MermaidEditor` — el editor de dos modos (lenguaje natural/código),
 * siempre, tenga o no contenido inicial: aunque KAN haya generado el
 * diagrama, el usuario puede seguir editándolo a mano o pedirle una
 * revisión. `svg`/`document` son formatos que solo genera KAN (no tiene
 * sentido escribirlos a mano en este editor) — siguen de solo lectura vía
 * `SandboxedFrame`.
 */
export function DiagramRenderer({
  format,
  content,
  title,
}: {
  format: "mermaid" | "svg" | "document";
  content: string;
  title: string;
}) {
  if (format === "mermaid") return <MermaidEditor initialCode={content} />;

  const html = format === "svg" ? wrapSvgDocument(content) : wrapHtmlDocument(content);
  return (
    <div className="flex h-full flex-col gap-2">
      {/* `content` ya es el markup SVG completo — nunca hace falta ir a buscarlo
          dentro del iframe de `SandboxedFrame` (no accesible desde el padre). */}
      {format === "svg" && (
        <button
          type="button"
          onClick={() => exportSvgStringAsPng(content, "diagrama-kan.png")}
          className="press flex shrink-0 items-center gap-1.5 self-start rounded-full border border-line/60 px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface-3"
        >
          <Download className="h-3 w-3" aria-hidden="true" />
          Exportar PNG
        </button>
      )}
      <SandboxedFrame html={html} title={title} className="h-full min-h-[16rem] w-full flex-1 rounded-lg border-0 bg-white" />
    </div>
  );
}
