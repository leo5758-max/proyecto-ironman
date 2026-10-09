"use client";

import type { DashboardSummary } from "@kan/core";
import { useSystemStatusContext } from "@/lib/status/SystemStatusProvider";
import { buildGreeting, timeOfDayGreeting } from "@/lib/greeting";
import { useIsClient } from "@/lib/useIsClient";
import { useOnboardingCompleted } from "@/lib/onboarding/useOnboardingCompleted";
import { OnboardingWelcome } from "@/components/dashboard/OnboardingWelcome";
import { OnboardingFlow } from "@/components/dashboard/OnboardingFlow";
import { ImmersiveHome } from "@/components/kan/ImmersiveHome";

/**
 * Pantalla principal ("/inicio") — rediseño JARVIS: pantalla negra
 * inmersiva sin sidebar/topbar (`ImmersiveHome`, montada bajo
 * `(immersive)/layout.tsx`), no el shell de 3 columnas de antes. Esta
 * lógica de bienvenida/onboarding (`OnboardingFlow`/`OnboardingWelcome`/
 * saludo) no cambió — solo qué se renderiza una vez resuelta.
 */
export function DashboardClient({ summary }: { summary: DashboardSummary | undefined }) {
  const { status, loading } = useSystemStatusContext();

  // Se calcula recién después de hidratar (useIsClient) — evita un mismatch
  // entre la hora del servidor (Vercel, UTC) y la del navegador del
  // usuario. "Hola." es el saludo neutro hasta entonces (ver lib/greeting.ts).
  const isClient = useIsClient();
  const greeting = isClient ? timeOfDayGreeting() : null;

  const hasAnyDevice = (status?.edgeAgents ?? []).some((agent) => agent.devices.length > 0);
  const displayName = summary?.profile.displayName;
  // Recién cuando /api/status ya resolvió al menos una vez (no loading) —
  // sin esto, todo usuario vería la bienvenida guiada un instante mientras
  // sus dispositivos reales todavía están cargando (hasAnyDevice arranca en
  // false para cualquiera, no solo para quien es nuevo de verdad).
  const isNewUser = Boolean(summary) && !loading && summary?.memoriesCount === 0 && !hasAnyDevice;

  const onboardingCompleted = useOnboardingCompleted();

  if (isNewUser && !onboardingCompleted) {
    return <OnboardingFlow />;
  }

  return (
    <ImmersiveHome
      greeting={buildGreeting(greeting ?? "Hola", displayName)}
      homeContent={isNewUser && <OnboardingWelcome displayName={displayName} />}
    />
  );
}
