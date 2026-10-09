"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useAllSensors } from "@/lib/sensores/useAllSensors";
import { HudPanel } from "@/components/kan/hud/HudPanel";
import { CountUpNumber } from "@/components/kan/hud/CountUpNumber";
import { SensorChart } from "@/components/sensores/SensorChart";
import type { TelemetryReadingView } from "@/lib/sensores/types";

/**
 * Panel "sensores" del Modo Presentación JARVIS — reusa `useAllSensors()`
 * (mismo hook que `/sensores`) para el grid de valores actuales
 * (`CountUpNumber`), y además trae el historial de cada sensor
 * (`GET /api/telemetry/:ref/history`, en paralelo) para una mini
 * `SensorChart` por tarjeta, revelada de izquierda a derecha
 * (`.hud-chart-reveal`, sin tocar `SensorChart.tsx`).
 */
export function SensorsPanel() {
  const { sensors, alerts, loading } = useAllSensors();
  const [historyByRef, setHistoryByRef] = useState<Record<string, TelemetryReadingView[]>>({});
  const refsKey = sensors.map((s) => s.ref).join(",");

  useEffect(() => {
    if (sensors.length === 0) return;
    let cancelled = false;

    Promise.all(
      sensors.map(async (sensor) => {
        try {
          const res = await fetch(`/api/telemetry/${encodeURIComponent(sensor.ref)}/history`, { cache: "no-store" });
          const data = await res.json();
          return [sensor.ref, (data.readings ?? []) as TelemetryReadingView[]] as const;
        } catch {
          return [sensor.ref, [] as TelemetryReadingView[]] as const;
        }
      }),
    ).then((entries) => {
      if (!cancelled) setHistoryByRef(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
    // Depende del contenido de `refsKey` (no de la referencia de `sensors`,
    // que cambia en cada poll de useAllSensors cada 5s) — sin esto, este
    // efecto pediría el historial de todo de nuevo cada 5s en vez de solo
    // cuando cambia el conjunto de sensores conectados.
  }, [refsKey]);

  if (!loading && sensors.length === 0) {
    return <p className="font-mono text-sm text-white/50">Ningún sensor disponible ahora mismo.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sensors.map((sensor, index) => {
        const alert = alerts.find((a) => a.capabilityRef === sensor.ref);
        const history = historyByRef[sensor.ref] ?? [];
        const revealStyle: CSSProperties & Record<"--hud-delay", string> = { "--hud-delay": `${index * 80 + 350}ms` };

        return (
          <HudPanel key={sensor.ref} title={sensor.deviceName} delayMs={index * 80}>
            <p className="truncate text-sm text-white">{sensor.description}</p>
            <p className="font-mono text-3xl font-semibold text-accent">
              {sensor.latest ? <CountUpNumber value={sensor.latest.value} /> : "—"}
              {alert?.unit && <span className="ml-1 text-sm text-white/50">{alert.unit}</span>}
            </p>
            {history.length > 1 && (
              <div className="hud-chart-reveal" style={revealStyle}>
                <SensorChart readings={history} />
              </div>
            )}
          </HudPanel>
        );
      })}
    </div>
  );
}
