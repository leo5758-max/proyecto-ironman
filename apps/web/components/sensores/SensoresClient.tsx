"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Bell, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/status/formatRelativeTime";
import { useAllSensors } from "@/lib/sensores/useAllSensors";
import type { TelemetryReadingView } from "@/lib/sensores/types";
import { SensorChart } from "@/components/sensores/SensorChart";

// Mismo intervalo que useAllSensors.ts (polling, no WebSocket — ADR-009 ya
// descartó push real-time hacia el browser) — usado acá solo para el
// refresco del historial del sensor seleccionado.
const POLL_INTERVAL_MS = 5_000;

/**
 * Dashboard de sensores en tiempo real: valor actual de cada capability
 * read-only, sin pasar por el chat. El fetch/merge de
 * `/api/capabilities` + `/api/telemetry` + `/api/telemetry/poll` +
 * `kan_list_alerts` vive en `useAllSensores` (compartido con el Modo
 * Presentación JARVIS, `SensorsPanel`) — acá solo queda la lógica propia de
 * esta pantalla: el detalle del sensor seleccionado (`GET
 * /api/telemetry/:ref/history`). kan_list_alerts se reusa para el badge de
 * alerta activa y para la única unidad "real" disponible en el sistema
 * (label/unit de la alerta, si existe una para ese capabilityRef) — nunca
 * se inventa una unidad para un sensor sin alerta configurada.
 */
export function SensoresClient() {
  const { sensors, alerts, loading } = useAllSensors();
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [history, setHistory] = useState<TelemetryReadingView[]>([]);

  useEffect(() => {
    // Sin selección, no hay nada que pedir — `history` simplemente queda
    // con su último valor (nunca se muestra: el panel de detalle solo se
    // monta con `selectedSensor` truthy, ver el render de abajo).
    if (!selectedRef) return;
    let cancelled = false;

    async function loadHistory() {
      try {
        const response = await fetch(`/api/telemetry/${encodeURIComponent(selectedRef!)}/history`, { cache: "no-store" });
        const data = await response.json();
        if (!cancelled) setHistory(data.readings ?? []);
      } catch {
        if (!cancelled) setHistory([]);
      }
    }

    loadHistory();
    const interval = setInterval(loadHistory, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedRef]);

  const alertByRef = useMemo(() => {
    const map = new Map<string, (typeof alerts)[number]>();
    for (const alert of alerts) map.set(alert.capabilityRef, alert);
    return map;
  }, [alerts]);

  const selectedSensor = sensors.find((s) => s.ref === selectedRef);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Sensores</h1>
        <p className="text-sm text-ink-faint">
          El valor actual de cada sensor conectado, actualizándose solo — sin preguntarle a KAN.
        </p>
      </div>

      {loading && sensors.length === 0 && (
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && sensors.length === 0 && (
        <EmptyState
          icon={Activity}
          title="Ningún sensor disponible todavía"
          description="Conectá un dispositivo con capabilities de lectura para verlo acá."
        />
      )}

      {sensors.length > 0 && (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sensors.map((sensor) => {
          const alert = alertByRef.get(sensor.ref);
          return (
            <button key={sensor.ref} type="button" onClick={() => setSelectedRef(sensor.ref)} className="text-left">
              <Card interactive padding="sm" className="flex h-full flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{sensor.description}</p>
                    <p className="truncate text-xs text-ink-faint">{sensor.deviceName}</p>
                  </div>
                  {alert && (
                    <span
                      title={`Alerta activa: ${alert.label} ${alert.comparator === "above" ? "supere" : "baje de"} ${alert.threshold}${alert.unit ? ` ${alert.unit}` : ""}`}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning"
                    >
                      <Bell className="h-3 w-3" aria-hidden="true" />
                      Alerta
                    </span>
                  )}
                </div>

                {sensor.latest ? (
                  <p className="text-2xl font-semibold tracking-tight text-ink">
                    {sensor.latest.value}
                    {alert?.unit ? <span className="ml-1 text-sm font-normal text-ink-faint">{alert.unit}</span> : null}
                  </p>
                ) : (
                  <p className="text-sm text-ink-faint">Esperando la primera lectura…</p>
                )}

                <p className="mt-auto text-xs text-ink-faint">
                  {sensor.connected
                    ? sensor.latest
                      ? `Actualizado ${formatRelativeTime(sensor.latest.at)}`
                      : "Conectado"
                    : sensor.latest
                      ? `Última lectura ${formatRelativeTime(sensor.latest.at)} — desconectado`
                      : "Desconectado"}
                </p>
              </Card>
            </button>
          );
        })}
      </div>
      )}

      {selectedSensor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card padding="lg" className="w-full max-w-lg">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{selectedSensor.description}</p>
                <p className="text-xs text-ink-faint">{selectedSensor.deviceName}</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setSelectedRef(null)}
                className="press rounded-md p-1.5 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <SensorChart readings={history} />
          </Card>
        </div>
      )}
    </div>
  );
}
