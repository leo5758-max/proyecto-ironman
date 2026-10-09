"use client";

import { X } from "lucide-react";
import { MessageBubble } from "@/components/dashboard/ConversationPanel";
import type { ChatMessage } from "@/lib/chat/useConversation";

/**
 * Hoja deslizable con el historial completo de la conversación (rediseño
 * JARVIS de /inicio) — se abre desde `FloatingResponse`/el botón "ver
 * historial"; reusa `MessageBubble` (mismo componente que ya usaba
 * `KANHome`), mismo patrón visual `.kan-sheet` que el panel "working" de
 * `KANLayout` tenía.
 */
export function HistorySheet({ messages, onClose }: { messages: ChatMessage[]; onClose: () => void }) {
  return (
    // z-[185]: por encima de StatusBar (150) y de las ventanas flotantes
    // (160+) — la hoja está anclada al borde inferior de la pantalla
    // (`justify-end`), con el z-index viejo (40) la barra de estado
    // quedaba pintada arriba de su borde inferior.
    <div className="fixed inset-0 z-[185] flex flex-col justify-end bg-black/60" onClick={onClose}>
      <div
        className="kan-sheet kan-scroll glass max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-line/80 p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-ink-muted">Historial</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial"
            className="press rounded-full p-1.5 text-ink-faint transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
        </div>
      </div>
    </div>
  );
}
