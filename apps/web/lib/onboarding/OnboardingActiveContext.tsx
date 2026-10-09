"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type OnboardingActiveContextValue = { isOnboardingActive: boolean; setOnboardingActive: (value: boolean) => void };

const OnboardingActiveContext = createContext<OnboardingActiveContextValue | undefined>(undefined);

/**
 * Estado global mínimo de "¿se está mostrando el onboarding guiado ahora?"
 * — mismo criterio que `LiveModeContext`: `OnboardingFlow` solo se instancia
 * dentro de `DashboardClient`, así que el resto del shell (`DeviceDiscoveryModal`,
 * montado en `ImmersiveChrome`) no tiene forma de saberlo sin esto. Se usa
 * para no competir con el paso 4 del onboarding ("¡Tu dispositivo está
 * conectado!") — sin esto, el mismo dispositivo recién vinculado dispara
 * además el modal genérico de "Dispositivo nuevo detectado" encima.
 */
export function OnboardingActiveProvider({ children }: { children: ReactNode }) {
  const [isOnboardingActive, setOnboardingActive] = useState(false);
  return (
    <OnboardingActiveContext.Provider value={{ isOnboardingActive, setOnboardingActive }}>
      {children}
    </OnboardingActiveContext.Provider>
  );
}

export function useOnboardingActiveContext(): OnboardingActiveContextValue {
  const context = useContext(OnboardingActiveContext);
  if (!context) throw new Error("useOnboardingActiveContext() debe usarse dentro de <OnboardingActiveProvider>.");
  return context;
}
