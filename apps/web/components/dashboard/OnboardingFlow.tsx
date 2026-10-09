"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Cpu } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PRIMARY_BUTTON_CLASSES, SECONDARY_BUTTON_CLASSES } from "@/components/ui/formStyles";
import { useDeviceDisplayNames } from "@/lib/devices/useDeviceDisplayNames";
import { useOnboardingActiveContext } from "@/lib/onboarding/OnboardingActiveContext";
import { markOnboardingCompleted } from "@/lib/onboarding/useOnboardingCompleted";
import type { SystemStatusResponse } from "@/lib/status/types";

const STEP_COUNT = 4;
// Más agresivo que el polling ambiental de 15s (`useSystemStatus`, ver
// SystemStatusProvider): acá "¿ya se conectó?" importa segundo a segundo,
// y dura como mucho un par de minutos (mientras dura el paso 3), no toda
// la sesión — no vale la pena bajar el intervalo compartido por esto.
const STATUS_POLL_MS = 5_000;

interface PairingCode {
  code: string;
  expiresAt: string;
}

interface ConnectedDevice {
  name: string;
  kind: string;
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex w-full max-w-md gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={STEP_COUNT}>
      {Array.from({ length: STEP_COUNT }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className={`h-1 flex-1 rounded-full transition-colors duration-base ${n <= step ? "bg-accent" : "bg-line/50"}`}
        />
      ))}
    </div>
  );
}

function StepCard({ children }: { children: ReactNode }) {
  return (
    <Card padding="lg" className="fade-in w-full max-w-md text-center">
      {children}
    </Card>
  );
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <StepCard>
      <p className="text-xl font-medium tracking-tight text-ink">
        Hola, soy KAN. Tu asistente de hardware con inteligencia artificial.
      </p>
      <p className="mt-2 text-sm text-ink-faint">En 3 pasos tenés tu primer dispositivo conectado.</p>
      <button type="button" onClick={onNext} className={`mt-7 w-full ${PRIMARY_BUTTON_CLASSES}`}>
        Empezar
      </button>
    </StepCard>
  );
}

function StepDownload({
  hasApp,
  onToggleHasApp,
  onNext,
}: {
  hasApp: boolean;
  onToggleHasApp: (value: boolean) => void;
  onNext: () => void;
}) {
  return (
    <StepCard>
      <p className="text-lg font-medium tracking-tight text-ink">
        Para conectar hardware real necesitás la app de escritorio de KAN.
      </p>
      <p className="mt-2 text-sm text-ink-faint">
        Se conecta a tus dispositivos por USB y le avisa al resto de KAN que están online.
      </p>

      {/* Todavía no hay un .exe publicado — apunta a la guía de /docs hasta que exista una descarga real. */}
      <a
        href="/docs#primeros-pasos"
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-6 block w-full ${SECONDARY_BUTTON_CLASSES}`}
      >
        Descargar app de escritorio
      </a>

      <label className="mt-5 flex items-center justify-center gap-2 text-sm text-ink-muted">
        <input type="checkbox" checked={hasApp} onChange={(event) => onToggleHasApp(event.target.checked)} />
        Ya tengo la app instalada
      </label>

      <button type="button" onClick={onNext} disabled={!hasApp} className={`mt-5 w-full ${PRIMARY_BUTTON_CLASSES}`}>
        Continuar
      </button>
    </StepCard>
  );
}

function StepPairing({
  pairing,
  pairingError,
  onSkip,
}: {
  pairing: PairingCode | null;
  pairingError: boolean;
  onSkip: () => void;
}) {
  return (
    <StepCard>
      <p className="text-lg font-medium tracking-tight text-ink">
        Abrí la app de escritorio y pegá este código para vincular tu dispositivo.
      </p>

      <div className="mt-6 flex flex-col items-center gap-1 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
        {pairing ? (
          <>
            <span className="font-mono text-2xl tracking-[0.3em] text-ink">{pairing.code}</span>
            <span className="text-xs text-ink-faint">Vence: {new Date(pairing.expiresAt).toLocaleTimeString()}</span>
          </>
        ) : pairingError ? (
          <span className="text-sm text-danger">No se pudo generar el código. Probá de nuevo más tarde.</span>
        ) : (
          <span className="text-sm text-ink-faint">Generando código…</span>
        )}
      </div>

      <p className="mt-4 animate-pulse text-sm text-ink-faint">Esperando conexión…</p>

      <button type="button" onClick={onSkip} className={`mt-6 w-full ${SECONDARY_BUTTON_CLASSES}`}>
        Omitir por ahora
      </button>
    </StepCard>
  );
}

function StepDone({
  connectedDevice,
  displayName,
  onFinish,
}: {
  connectedDevice: ConnectedDevice | null;
  displayName: (rawName: string) => string;
  onFinish: () => void;
}) {
  return (
    <StepCard>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent text-white">
        <Cpu className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="mt-4 text-xl font-medium tracking-tight text-ink">
        {connectedDevice ? "¡Tu dispositivo está conectado!" : "Todo listo, podés empezar."}
      </p>
      {connectedDevice && (
        <p className="mt-2 text-sm text-ink-faint">
          KAN encontró <span className="text-ink">{displayName(connectedDevice.name)}</span> ({connectedDevice.kind}).
        </p>
      )}
      <button type="button" onClick={onFinish} className={`mt-7 w-full ${PRIMARY_BUTTON_CLASSES}`}>
        Ir a KAN
      </button>
    </StepCard>
  );
}

/**
 * Onboarding guiado de 4 pasos (bienvenida → descargar app → vincular
 * dispositivo → listo) para un usuario que nunca completó el flujo — ver
 * `useOnboardingCompleted`. Reemplaza a `FirstRunWelcome` (pantalla de
 * bienvenida sola, sin guiar el pairing) como gate de `DashboardClient`;
 * `OnboardingWelcome` (tarjeta liviana embebida en el home del chat) sigue
 * existiendo sin cambios — sirve un propósito distinto (guía persistente
 * mientras el usuario siga sin memorias/dispositivos, no un flujo de una
 * sola vez).
 */
export function OnboardingFlow() {
  const { setOnboardingActive } = useOnboardingActiveContext();
  // Mientras este componente está montado, `DeviceDiscoveryModal` (montado
  // en `ImmersiveChrome`, fuera de este árbol) se suprime — sin esto, el
  // mismo dispositivo recién vinculado en el paso 3 dispara además el modal
  // genérico de "Dispositivo nuevo detectado" tapando el paso 4.
  useEffect(() => {
    setOnboardingActive(true);
    return () => setOnboardingActive(false);
  }, [setOnboardingActive]);

  const [step, setStep] = useState(1);
  const [hasApp, setHasApp] = useState(false);
  const [pairing, setPairing] = useState<PairingCode | null>(null);
  const [pairingError, setPairingError] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<ConnectedDevice | null>(null);
  const displayName = useDeviceDisplayNames();

  useEffect(() => {
    if (step !== 3 || pairing || pairingError) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/devices/pairing-code", { method: "POST" });
        if (!response.ok) throw new Error();
        const data = (await response.json()) as PairingCode;
        if (!cancelled) setPairing(data);
      } catch {
        if (!cancelled) setPairingError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, pairing, pairingError]);

  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch("/api/status", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as SystemStatusResponse;
        const device = data.edgeAgents.flatMap((agent) => agent.devices)[0];
        if (device && !cancelled) {
          setConnectedDevice({ name: device.name, kind: device.kind });
          setStep(4);
        }
      } catch {
        // Se reintenta en el próximo tick — sin bloquear la espera.
      }
    }

    poll();
    const interval = window.setInterval(poll, STATUS_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [step]);

  function handleFinish() {
    markOnboardingCompleted();
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
      <ProgressBar step={step} />
      {step === 1 && <StepWelcome onNext={() => setStep(2)} />}
      {step === 2 && <StepDownload hasApp={hasApp} onToggleHasApp={setHasApp} onNext={() => setStep(3)} />}
      {step === 3 && <StepPairing pairing={pairing} pairingError={pairingError} onSkip={() => setStep(4)} />}
      {step === 4 && <StepDone connectedDevice={connectedDevice} displayName={displayName} onFinish={handleFinish} />}
    </div>
  );
}
