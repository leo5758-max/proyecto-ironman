"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Modo pantalla completa de /inicio (kiosko) — envuelve la Fullscreen API
 * nativa sobre `document.documentElement` (toda la app, no un elemento
 * puntual). El estado real puede cambiar sin pasar por `toggle()` (Esc,
 * F11, el propio navegador) — por eso escucha `fullscreenchange` en vez de
 * solo trackear el click, mismo criterio que cualquier wrapper de una API
 * del browser con estado propio (`useWakeWord`, `useIsClient`).
 */
export function useFullscreen(): { isFullscreen: boolean; toggle: () => void } {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      // Sin soporte (ej. iOS Safari) o el usuario lo bloqueó — la app sigue
      // funcionando igual, solo no entra en pantalla completa.
      void document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  }, []);

  return { isFullscreen, toggle };
}
