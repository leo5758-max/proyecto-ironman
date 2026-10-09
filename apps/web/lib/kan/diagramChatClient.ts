"use client";

import type { ChatStreamEvent, Conversation } from "@kan/core";
import { readSseStream } from "@/lib/chat/parseSseStream";
import { parseFencedBlocks, type MessageSegment } from "@/lib/kan/parseFencedBlocks";

type ChatSseEvent = ChatStreamEvent | { type: "done"; conversation: Conversation } | { type: "done"; error: string };

export interface DiagramChatResult {
  conversationId: string;
  replyText: string;
  mermaidCode: string | null;
}

/**
 * Le pide algo a KAN desde el editor de diagramas — mismo endpoint
 * `/api/chat` que ya usa el chat principal (`useConversation.ts`), sin
 * tocar el backend: en vez de un "system prompt específico para
 * generación de diagramas" (que exigiría un endpoint/modo nuevo en
 * `packages/core`, fuera de "todo en apps/web"), el pedido va como
 * mensaje de usuario con instrucciones explícitas sobre el formato
 * esperado. Deliberadamente independiente de `useConversation` — no
 * comparte conversación con el chat principal, así que generar/revisar un
 * diagrama en una ventana flotante no dispara sonidos ni actualiza
 * `FloatingResponse` en la pantalla principal.
 *
 * No maneja `tool_call`/`pending_confirmation` (no se esperan tools acá,
 * es un pedido de texto) — solo consume el stream hasta el evento `done`
 * y devuelve el último mensaje del asistente.
 */
export async function askKanForDiagram(message: string, conversationId: string | undefined): Promise<DiagramChatResult> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "KAN no está disponible en este momento.");
  }

  let finalConversation: Conversation | undefined;
  let streamError: string | undefined;

  for await (const event of readSseStream<ChatSseEvent>(response)) {
    if (event.type === "done") {
      if ("error" in event) streamError = event.error;
      else finalConversation = event.conversation;
    }
  }

  if (streamError) throw new Error(streamError);
  if (!finalConversation) throw new Error("KAN no respondió.");

  const lastAssistant = [...finalConversation.messages].reverse().find((m) => m.role === "assistant");
  const replyText = lastAssistant?.content ?? "";
  const mermaidSegment = parseFencedBlocks(replyText).find(
    (segment): segment is Extract<MessageSegment, { type: "mermaid" }> => segment.type === "mermaid",
  );

  return {
    conversationId: finalConversation.id,
    replyText,
    mermaidCode: mermaidSegment?.content ?? null,
  };
}

const NO_ACCENTS_RULE =
  "No uses acentos, tildes ni ñ en los labels de los nodos (Mermaid no los parsea bien) — escribí esas palabras sin acento.";

/** Prompt para el modo "lenguaje natural" — generar un diagrama nuevo desde una descripción. */
export function buildGenerationPrompt(description: string): string {
  return (
    `Generá un diagrama Mermaid (flowchart, sequenceDiagram, o el tipo que mejor represente esto) para: "${description}". ` +
    `Respondé con el código Mermaid en un bloque \`\`\`mermaid, y como mucho una oración corta antes explicando qué hiciste. ${NO_ACCENTS_RULE}`
  );
}

/** Prompt para "Pedir revisión a KAN" — sugerir mejoras sobre un diagrama ya escrito. */
export function buildReviewPrompt(code: string): string {
  return (
    `Revisá este diagrama Mermaid y sugerí mejoras (claridad, estructura, nombres). Si proponés una versión mejorada, ` +
    `incluila en un bloque \`\`\`mermaid. ${NO_ACCENTS_RULE}\n\n\`\`\`mermaid\n${code}\n\`\`\``
  );
}
