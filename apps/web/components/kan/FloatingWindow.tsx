"use client";

import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Minus, X } from "lucide-react";
import { HUD_SCOPE_STYLE } from "@/components/kan/hud/hudScope";
import type { FloatingWindowState } from "@/lib/kan/useFloatingWindows";

// Margen para no perder de vista el header al arrastrar hasta el borde.
const EDGE_MARGIN = 48;

/**
 * Chrome de una ventana flotante — arrastre 100% con Pointer Events
 * nativos (`setPointerCapture` en el header, sin librería). Cualquier
 * click dentro de la ventana la trae al frente (`onPointerDownCapture` en
 * el contenedor, antes de que el handler de arrastre del header procese
 * el mismo evento). Minimizar colapsa el body y deja solo el header.
 *
 * `zIndex` ya viene calculado por `FloatingWindowLayer` (banda propia +
 * posición de esta ventana en el array) — este componente no decide su
 * propio apilado.
 */
export function FloatingWindow({
  win,
  zIndex,
  onClose,
  onToggleMinimize,
  onFocus,
  onMove,
  children,
}: {
  win: FloatingWindowState;
  zIndex: number;
  onClose: () => void;
  onToggleMinimize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  children: ReactNode;
}) {
  const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);

  function handleHeaderPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    // Sin este chequeo, tocar minimizar/cerrar armaba el drag igual (el
    // pointerdown burbujea desde el botón hasta acá) — `setPointerCapture`
    // redirigía los eventos de puntero siguientes al header, y el click del
    // botón nunca llegaba a procesarse. Si el pointerdown empezó sobre un
    // botón, no es un arrastre.
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, offsetX: event.clientX - win.x, offsetY: event.clientY - win.y };
  }

  function handleHeaderPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const maxX = window.innerWidth - EDGE_MARGIN;
    const maxY = window.innerHeight - EDGE_MARGIN;
    const x = Math.min(Math.max(event.clientX - drag.offsetX, 0), maxX);
    const y = Math.min(Math.max(event.clientY - drag.offsetY, 0), maxY);
    onMove(x, y);
  }

  function handleHeaderPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  return (
    // Fondo opaco (`bg-zinc-900`), no `.glass`: `.glass` es translúcido,
    // tinta el fondo con `--color-surface-2` — con `HUD_SCOPE_STYLE` puesto
    // (más abajo, para el resto del contenido) ese token pasa a ser casi
    // negro, así que la ventana quedaba prácticamente invisible flotando
    // sobre el negro puro del fondo de /inicio (mismo negro semitransparente
    // sobre negro). `bg-zinc-900` es un gris opaco de verdad, con contraste
    // real contra el fondo; el borde usa el acento del usuario.
    <div
      className="hud-panel absolute flex flex-col overflow-hidden rounded-2xl border border-[var(--kan-accent)]/40 bg-zinc-900 text-white shadow-2xl"
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.minimized ? undefined : win.height,
        zIndex,
        ...HUD_SCOPE_STYLE,
      }}
      onPointerDownCapture={onFocus}
    >
      <div
        className="flex shrink-0 cursor-grab items-center justify-between gap-2 border-b border-line/60 bg-surface-2 px-3 py-2 select-none active:cursor-grabbing"
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={handleHeaderPointerUp}
        onPointerCancel={handleHeaderPointerUp}
      >
        <span className="truncate font-mono text-xs uppercase tracking-[0.15em] text-accent">{win.title}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={win.minimized ? "Restaurar ventana" : "Minimizar ventana"}
            onClick={onToggleMinimize}
            className="press rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Cerrar ventana"
            onClick={onClose}
            className="press rounded p-1 text-white/60 transition-colors hover:bg-danger/20 hover:text-danger"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {!win.minimized && <div className="hud-scroll min-h-0 flex-1 overflow-y-auto p-3">{children}</div>}
    </div>
  );
}
