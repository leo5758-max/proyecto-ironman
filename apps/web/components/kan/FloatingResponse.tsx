"use client";

import { Volume2 } from "lucide-react";
import { RichMessageContent } from "@/components/kan/RichMessageContent";
import type { ChatMessage } from "@/lib/chat/useConversation";

/**
 * Texto flotante de la respuesta actual sobre el orb (rediseño JARVIS de
 * /inicio) — reemplaza la lista de burbujas de siempre: solo el último
 * intercambio (mensaje del usuario tenue + respuesta de KAN prominente),
 * sin caja/burbuja. El historial completo vive en `HistorySheet`, que este
 * componente abre con `onOpenHistory`.
 */
export function FloatingResponse({
  messages,
  isSending,
  streamingStatus,
  isSpeaking,
  onOpenHistory,
}: {
  messages: ChatMessage[];
  isSending: boolean;
  streamingStatus: string | null;
  isSpeaking: boolean;
  onOpenHistory: () => void;
}) {
  if (messages.length === 0) return null;

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  return (
    <div className="fade-in flex w-full max-w-xl flex-col items-center gap-2 px-4 text-center">
      <button type="button" onClick={onOpenHistory} className="text-xs text-ink-faint underline underline-offset-2 hover:text-ink">
        Ver historial
      </button>

      {lastUser && <p className="line-clamp-1 text-xs text-ink-faint">{lastUser.content}</p>}

      {isSending ? (
        <p className="flex items-center gap-1.5 text-lg text-ink-muted">
          <span className="flex gap-0.5" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
          </span>
          {streamingStatus ?? "KAN está pensando"}
        </p>
      ) : (
        lastAssistant && <RichMessageContent content={lastAssistant.content} className="text-xl font-medium text-ink" />
      )}

      {!isSending && isSpeaking && (
        <p className="flex items-center gap-1.5 text-sm text-accent">
          <Volume2 className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
          KAN está hablando
        </p>
      )}
    </div>
  );
}
