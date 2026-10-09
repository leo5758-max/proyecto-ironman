"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Code2, Download, MessageSquare } from "lucide-react";
import { MermaidDiagram } from "@/components/kan/MermaidDiagram";
import { RichMessageContent } from "@/components/kan/RichMessageContent";
import { askKanForDiagram, buildGenerationPrompt, buildReviewPrompt } from "@/lib/kan/diagramChatClient";
import { exportSvgAsPng } from "@/lib/kan/exportSvgAsPng";

type Mode = "natural" | "code";

const CODE_PLACEHOLDER = "flowchart LR\n  A[Start] --> B[Write your diagram]";
const DEBOUNCE_MS = 500;

/**
 * Editor de la ventana de diagrama — dos modos, toggle arriba de todo:
 *
 * - "Describir" (lenguaje natural, default si no hay código todavía): un
 *   textarea + botón "Generar" que le manda la descripción a KAN
 *   (`askKanForDiagram`, mismo `/api/chat` de siempre) y pasa a modo
 *   "Código" con lo que KAN devolvió.
 * - "Código": edición directa, preview en vivo con debounce de 500ms
 *   (`debouncedCode`, separado del valor del textarea para no
 *   re-renderizar el diagrama en cada tecla). Error de sintaxis → mensaje
 *   simple con línea (`MermaidDiagram simplifiedError`). Diagrama válido →
 *   aparece "Pedir revisión a KAN".
 *
 * Conversación propia (`conversationId` local), independiente de
 * `useConversation` — ver el comentario en `diagramChatClient.ts`.
 */
export function MermaidEditor({ initialCode }: { initialCode: string }) {
  const [mode, setMode] = useState<Mode>(initialCode ? "code" : "natural");
  const [code, setCode] = useState(initialCode || CODE_PLACEHOLDER);
  const [debouncedCode, setDebouncedCode] = useState(code);
  const [description, setDescription] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const diagramContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCode(code), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [code]);

  const handleValidityChange = useCallback((valid: boolean) => setIsValid(valid), []);

  async function handleGenerate() {
    if (!description.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await askKanForDiagram(buildGenerationPrompt(description), conversationId);
      setConversationId(result.conversationId);
      if (result.mermaidCode) {
        setCode(result.mermaidCode);
        setMode("code");
      } else {
        setError("KAN no devolvió un diagrama Mermaid — probá describirlo de otra forma.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el diagrama.");
    } finally {
      setBusy(false);
    }
  }

  function handleExportPng() {
    const svg = diagramContainerRef.current?.querySelector("svg");
    if (svg) exportSvgAsPng(svg, "diagrama-kan.png");
  }

  async function handleReview() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setReview(null);
    try {
      const result = await askKanForDiagram(buildReviewPrompt(code), conversationId);
      setConversationId(result.conversationId);
      setReview(result.replyText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo pedir la revisión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex shrink-0 items-center gap-1 self-start rounded-full bg-black/40 p-1">
        <button
          type="button"
          onClick={() => setMode("natural")}
          className={`press flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors ${
            mode === "natural" ? "bg-accent text-white" : "text-white/60 hover:text-white"
          }`}
        >
          <MessageSquare className="h-3 w-3" aria-hidden="true" />
          Describir
        </button>
        <button
          type="button"
          onClick={() => setMode("code")}
          className={`press flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors ${
            mode === "code" ? "bg-accent text-white" : "text-white/60 hover:text-white"
          }`}
        >
          <Code2 className="h-3 w-3" aria-hidden="true" />
          Código
        </button>
      </div>

      {mode === "natural" ? (
        <div className="flex shrink-0 flex-col gap-2">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder='Describí lo que querés diagramar — ej. "cuando el sensor detecta movimiento, enciende el LED"'
            spellCheck={false}
            className="min-h-[4.5rem] resize-none rounded-lg bg-black/40 p-2 text-xs text-white outline-none placeholder:text-white/30"
          />
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={busy || !description.trim()}
            className="press self-start rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-40"
          >
            {busy ? "Generando…" : "Generar"}
          </button>
        </div>
      ) : (
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          spellCheck={false}
          className="min-h-[4.5rem] shrink-0 resize-none rounded-lg bg-black/40 p-2 font-mono text-xs text-white outline-none"
        />
      )}

      {error && <p className="shrink-0 text-xs text-danger">{error}</p>}

      <div ref={diagramContainerRef} className="hud-scroll min-h-0 flex-1 overflow-y-auto rounded-lg bg-black/20 p-2">
        <MermaidDiagram code={debouncedCode} simplifiedError={mode === "code"} onValidityChange={handleValidityChange} />
      </div>

      {isValid && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {mode === "code" && (
            <button
              type="button"
              onClick={() => void handleReview()}
              disabled={busy}
              className="press rounded-full border border-[var(--kan-accent)]/40 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              {busy ? "Pidiendo revisión…" : "Pedir revisión a KAN"}
            </button>
          )}
          <button
            type="button"
            onClick={handleExportPng}
            className="press flex items-center gap-1.5 rounded-full border border-line/60 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10"
          >
            <Download className="h-3 w-3" aria-hidden="true" />
            Exportar PNG
          </button>
        </div>
      )}

      {review && (
        <div className="shrink-0 rounded-lg border border-line/60 bg-black/30 p-2">
          <RichMessageContent content={review} className="text-xs text-ink" />
        </div>
      )}
    </div>
  );
}
