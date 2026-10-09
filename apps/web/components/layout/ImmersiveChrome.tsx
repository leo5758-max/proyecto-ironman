"use client";

import { useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { BootSequence } from "@/components/kan/BootSequence";
import { useBrowserEdgeAgent } from "@/lib/edgeAgent/useBrowserEdgeAgent";
import { SystemStatusProvider } from "@/lib/status/SystemStatusProvider";
import { LiveModeProvider } from "@/lib/live/LiveModeContext";
import { OnboardingActiveProvider } from "@/lib/onboarding/OnboardingActiveContext";
import { DeviceDiscoveryModal } from "@/components/layout/DeviceDiscoveryModal";
import type { UserIdentity } from "@kan/core";

const BOOT_SESSION_KEY = "kan-boot-shown";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Chrome de la pantalla inmersiva de /inicio (rediseño JARVIS) — mismo rol
 * que `ShellChrome.tsx` (providers + boot sequence + descubrimiento de
 * dispositivos), pero sin `Sidebar`/`TopBar`/`InfoPanel`: acá la única
 * navegación es el `HamburgerMenu` que monta `ImmersiveHome` (dentro de
 * `children`), no un chrome fijo alrededor. Fondo negro total, pantalla
 * completa — nada de padding ni columna de contenido.
 */
export function ImmersiveChrome({ user, children }: { user: UserIdentity | undefined; children: ReactNode }) {
  const [booting, setBooting] = useState(false);
  const [panelsRevealed, setPanelsRevealed] = useState(true);
  useBrowserEdgeAgent(Boolean(user));

  useIsomorphicLayoutEffect(() => {
    try {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduceMotion && !window.sessionStorage.getItem(BOOT_SESSION_KEY)) {
        setBooting(true);
        setPanelsRevealed(false);
      }
    } catch {
      // sessionStorage inaccesible (modo privado estricto, etc.) — sin boot, la app funciona igual.
    }
  }, []);

  const handleBootPanelsReveal = useCallback(() => setPanelsRevealed(true), []);
  const handleBootDone = useCallback(() => {
    setBooting(false);
    try {
      window.sessionStorage.setItem(BOOT_SESSION_KEY, "1");
    } catch {
      // Sin storage no se puede recordar — se repetiría en la próxima carga, no es grave.
    }
  }, []);

  return (
    <SystemStatusProvider>
      <LiveModeProvider>
        <OnboardingActiveProvider>
          <div
            className={`kan-grid-bg h-screen w-screen bg-black transition-all duration-slow delay-150 ${
              panelsRevealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {children}
          </div>

          {booting && <BootSequence onPanelsReveal={handleBootPanelsReveal} onDone={handleBootDone} />}
          <DeviceDiscoveryModal />
        </OnboardingActiveProvider>
      </LiveModeProvider>
    </SystemStatusProvider>
  );
}
