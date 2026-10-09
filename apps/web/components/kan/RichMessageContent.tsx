"use client";

import dynamic from "next/dynamic";
import { parseFencedBlocks } from "@/lib/kan/parseFencedBlocks";
import { wrapSvgDocument } from "@/lib/kan/sandboxedHtml";
import { SandboxedFrame } from "@/components/kan/SandboxedFrame";

// `next/dynamic({ ssr: false })`: ni `mermaid` ni `react-syntax-highlighter`
// (con sus ~11 gramáticas registradas) entran al bundle inicial de
// /inicio — recién se cargan si un mensaje realmente trae un bloque
// ```mermaid```/``` ``` para mostrar.
const MermaidDiagram = dynamic(() => import("@/components/kan/MermaidDiagram").then((m) => m.MermaidDiagram), {
  ssr: false,
  loading: () => <p className="text-xs text-ink-faint">Renderizando diagrama…</p>,
});

const CodeBlock = dynamic(() => import("@/components/kan/CodeBlock").then((m) => m.CodeBlock), {
  ssr: false,
  loading: () => <p className="text-xs text-ink-faint">Cargando código…</p>,
});

/**
 * Reemplaza el `{message.content}` crudo en `MessageBubble`
 * (`components/dashboard/ConversationPanel.tsx`, compartido por
 * `/conversacion` y `HistorySheet`) y `FloatingResponse.tsx` — detecta
 * bloques ```mermaid```/```svg```/``` ``` (`parseFencedBlocks`) y los
 * renderiza como diagrama/SVG/código real en vez de texto con backticks.
 */
export function RichMessageContent({ content, className }: { content: string; className?: string }) {
  const segments = parseFencedBlocks(content);

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          if (!segment.content.trim()) return null;
          return (
            <p key={index} className="whitespace-pre-wrap">
              {segment.content}
            </p>
          );
        }
        if (segment.type === "mermaid") {
          return (
            <div key={index} className="my-2">
              <MermaidDiagram code={segment.content} />
            </div>
          );
        }
        if (segment.type === "svg") {
          return (
            <div key={index} className="my-2 overflow-hidden rounded-lg">
              <SandboxedFrame html={wrapSvgDocument(segment.content)} title="Diagrama SVG" />
            </div>
          );
        }
        return (
          <div key={index} className="my-2 overflow-hidden rounded-lg bg-black/40">
            <CodeBlock code={segment.content} lang={segment.lang} />
          </div>
        );
      })}
    </div>
  );
}
