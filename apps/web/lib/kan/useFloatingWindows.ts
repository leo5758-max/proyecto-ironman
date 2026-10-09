"use client";

import { useCallback, useState } from "react";
import type { PanelType } from "@/lib/kan/openPanelTool";
import { tileWindows } from "@/lib/kan/tileWindows";

/** Los tipos de ventana que el usuario puede abrir a mano desde `NewWindowButton` — `search`/`3d` quedan afuera, no tienen sentido sin una pregunta real / un objeto que aproximar. */
export type ManualWindowKind = Exclude<PanelType, "search" | "3d">;

export interface FloatingWindowState {
  id: string;
  kind: PanelType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  props: Record<string, unknown>;
}

const DEFAULT_SIZE: Record<PanelType, { width: number; height: number }> = {
  control: { width: 420, height: 480 },
  // Widget compacto (estética "JARVIS real") — nombre + valor + mini
  // gráfica de 60px, no necesita la altura de una ventana normal.
  sensor: { width: 260, height: 190 },
  diagram: { width: 520, height: 440 },
  code: { width: 520, height: 420 },
  search: { width: 420, height: 360 },
  "3d": { width: 420, height: 420 },
};

const CASCADE_ORIGIN = { x: 96, y: 96 };
const CASCADE_STEP = 32;
const CASCADE_WRAP = 6;

let windowCounter = 0;

/**
 * Manager de estado de las ventanas flotantes de /inicio (sistema tipo
 * escritorio) — sin persistencia, se resetea al recargar, igual que el
 * resto de la sesión inmersiva. `ImmersiveHome` es el único consumidor.
 *
 * El orden de apilado ("traer al frente") es el orden del array, no un
 * campo `zIndex` con un contador que solo crece — `FloatingWindowLayer`
 * deriva el z-index real de cada ventana de su posición acá (`WINDOW_Z_BASE
 * + índice`). Con un contador creciente, después de suficientes clicks de
 * foco a lo largo de una sesión larga el número terminaba superando al
 * chrome fijo (hamburguesa/sonido, z-[210]) o a `SectionOverlay`/
 * `JARVISDisplay` — con el orden del array el rango queda siempre acotado
 * por la cantidad de ventanas abiertas, nunca crece sin límite.
 */
export function useFloatingWindows() {
  const [windows, setWindows] = useState<FloatingWindowState[]>([]);

  const openWindow = useCallback((spec: { kind: PanelType; title: string; props: Record<string, unknown> }): string => {
    const size = DEFAULT_SIZE[spec.kind];
    const id = `win-${windowCounter++}`;

    setWindows((prev) => {
      const step = prev.length % CASCADE_WRAP;
      return [
        ...prev,
        {
          id,
          kind: spec.kind,
          title: spec.title,
          x: CASCADE_ORIGIN.x + step * CASCADE_STEP,
          y: CASCADE_ORIGIN.y + step * CASCADE_STEP,
          width: size.width,
          height: size.height,
          minimized: false,
          props: spec.props,
        },
      ];
    });

    return id;
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
  }, []);

  /** Mueve la ventana al final del array (= al frente) — no-op si ya está ahí. */
  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const index = prev.findIndex((w) => w.id === id);
      if (index === -1 || index === prev.length - 1) return prev;
      const next = prev.slice();
      const [win] = next.splice(index, 1);
      next.push(win);
      return next;
    });
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  /**
   * Reacomoda las ventanas NO minimizadas en una grilla que aprovecha todo
   * el viewport (modo pantalla completa, ver `useFullscreen`/`FullscreenToggle`)
   * — las minimizadas quedan tal cual (solo muestran el header, tilearlas no
   * tiene sentido visual, ver `FloatingWindow.tsx`). No es exclusivo ni
   * bloqueante: después de retilear, el usuario puede seguir arrastrando
   * cualquier ventana a mano, igual que siempre.
   */
  const retileWindows = useCallback((viewportWidth: number, viewportHeight: number) => {
    setWindows((prev) => {
      const visible = prev.filter((w) => !w.minimized);
      if (visible.length === 0) return prev;
      const rects = tileWindows(visible.length, viewportWidth, viewportHeight);
      let visibleIndex = 0;
      return prev.map((w) => {
        if (w.minimized) return w;
        const rect = rects[visibleIndex++];
        return { ...w, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      });
    });
  }, []);

  return { windows, openWindow, closeWindow, toggleMinimize, focusWindow, moveWindow, retileWindows };
}
