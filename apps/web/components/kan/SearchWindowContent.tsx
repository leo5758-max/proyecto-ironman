"use client";

import { Search } from "lucide-react";
import { RichMessageContent } from "@/components/kan/RichMessageContent";

/**
 * Contenido de la ventana `kind: "search"` (`kan_open_panel`,
 * `type: "search"`) — v1 solo presentacional (decisión tomada con el
 * usuario): no dispara ninguna búsqueda real, muestra la query + la
 * respuesta que KAN ya elaboró con su propio conocimiento, igual que haría
 * en el chat.
 */
export function SearchWindowContent({ query, content }: { query?: string; content?: string }) {
  return (
    <div className="flex flex-col gap-3">
      {query && (
        <div className="flex items-center gap-2 rounded-lg border border-line/60 bg-surface-3/60 px-3 py-2 text-sm text-ink-muted">
          <Search className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
          <span className="truncate">{query}</span>
        </div>
      )}
      {content ? (
        <RichMessageContent content={content} className="text-sm text-ink" />
      ) : (
        <p className="text-xs text-ink-faint">Sin resultado para mostrar.</p>
      )}
    </div>
  );
}
