"use client";

import { useSyncExternalStore } from "react";

// localStorage (no sessionStorage): "una vez en la vida", tiene que
// sobrevivir a cerrar la pestaña — mismo criterio que kan:accent en
// theme.ts y el kan:welcome-seen que reemplaza (ver OnboardingFlow.tsx).
// `useSyncExternalStore` (no useEffect+setState, mismo criterio que
// useIsClient/ThemeAccentPicker) — evita tanto el mismatch de hidratación
// de leer localStorage recién en un efecto como el re-render en cascada
// que dispara react-hooks/set-state-in-effect.
const ONBOARDING_COMPLETED_KEY = "kan:onboarding-completed";
let listeners: Array<() => void> = [];

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

// SSR y primer render del cliente: "ya completado" por defecto — evita
// mostrar el onboarding en el HTML inicial (mismatch imposible), se
// corrige solo apenas React confirma el snapshot real del cliente.
function getServerSnapshot(): boolean {
  return true;
}

function getClientSnapshot(): boolean {
  try {
    return Boolean(window.localStorage.getItem(ONBOARDING_COMPLETED_KEY));
  } catch {
    return true;
  }
}

export function markOnboardingCompleted(): void {
  try {
    window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, "1");
  } catch {
    // Sin storage no se puede recordar — se repetiría en la próxima carga, no es grave.
  }
  listeners.forEach((listener) => listener());
}

/** `true` una vez que el usuario terminó (o completó) el onboarding guiado — ver DashboardClient/OnboardingFlow. */
export function useOnboardingCompleted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
