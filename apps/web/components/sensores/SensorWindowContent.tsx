"use client";

import { useEffect, useState } from "react";
import { useAllSensors } from "@/lib/sensores/useAllSensors";
import { SensorChart } from "@/components/sensores/SensorChart";
import type { TelemetryReadingView } from "@/lib/sensores/types";

/**
 * Contenido de la ventana `kind: "sensor"` — con `deviceId` (la referencia
 * del sensor, mismo campo que usa "control") pide directo el historial
 * (`GET /api/telemetry/:ref/history`, mismo endpoint que `SensorsPanel`) y
 * grafica con `SensorChart` reusado. Sin `deviceId` (abierta a mano desde
 * `NewWindowButton`), ofrece un selector simple con `useAllSensors()`
 * (mismo hook que `/sensores`).
 *
 * Widget compacto (estética "JARVIS real"): nombre + valor actual grande +
 * mini gráfica de 60px de alto (`SensorChart` reusado tal cual, solo
 * recortado por el contenedor — el componente no cambia).
 */
export function SensorWindowContent({ deviceId }: { deviceId?: string }) {
  const { sensors, loading } = useAllSensors();
  const [selectedRef, setSelectedRef] = useState<string | undefined>(deviceId);
  // Guarda el `ref` que produjo cada resultado — comparado contra
  // `selectedRef` para saber si todavía está cargando, en vez de un
  // `setHistoryLoading(true)` sincrónico al arrancar el efecto (eso
  // dispararía react-hooks/set-state-in-effect, mismo criterio que
  // `MermaidDiagram.tsx`).
  const [historyResult, setHistoryResult] = useState<{ ref: string; readings: TelemetryReadingView[] } | null>(null);

  useEffect(() => {
    if (!selectedRef) return;
    let cancelled = false;

    fetch(`/api/telemetry/${encodeURIComponent(selectedRef)}/history`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setHistoryResult({ ref: selectedRef, readings: data.readings ?? [] });
      })
      .catch(() => {
        if (!cancelled) setHistoryResult({ ref: selectedRef, readings: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRef]);

  const historyLoading = Boolean(selectedRef) && historyResult?.ref !== selectedRef;
  const readings = historyResult && historyResult.ref === selectedRef ? historyResult.readings : [];

  if (!selectedRef) {
    if (loading) return <p className="text-xs text-ink-faint">Cargando sensores…</p>;
    if (sensors.length === 0) return <p className="text-xs text-ink-faint">Ningún sensor disponible ahora mismo.</p>;
    return (
      <ul className="flex flex-col gap-1.5">
        {sensors.map((sensor) => (
          <li key={sensor.ref}>
            <button
              type="button"
              onClick={() => setSelectedRef(sensor.ref)}
              className="press w-full rounded-lg bg-surface-3/60 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface-3"
            >
              <span className="block truncate font-medium">{sensor.deviceName}</span>
              <span className="block truncate text-xs text-ink-faint">{sensor.description}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  const sensor = sensors.find((s) => s.ref === selectedRef);

  return (
    <div className="flex flex-col gap-2">
      {sensor && (
        <div>
          <p className="kan-hud-label truncate text-ink-faint">{sensor.deviceName}</p>
          <p className="font-mono text-2xl font-semibold text-accent">
            {sensor.latest ? sensor.latest.value.toFixed(1) : "—"}
          </p>
        </div>
      )}
      {historyLoading ? (
        <p className="text-xs text-ink-faint">Cargando historial…</p>
      ) : readings.length > 1 ? (
        <div className="h-[60px] overflow-hidden">
          <SensorChart readings={readings} />
        </div>
      ) : (
        <p className="text-xs text-ink-faint">Todavía no hay suficientes lecturas para graficar.</p>
      )}
    </div>
  );
}
