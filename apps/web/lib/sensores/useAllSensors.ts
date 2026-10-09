"use client";

import { useEffect, useMemo, useState } from "react";
import type { AlertView, DeviceCapabilitiesView } from "@/lib/secuencias/types";
import type { SensorSummaryView, TelemetryPollResult } from "@/lib/sensores/types";

// Mismo intervalo pedido explícitamente para /sensores (polling, no
// WebSocket — ADR-009 ya descartó push real-time hacia el browser) — el
// Modo Presentación JARVIS (SensorsPanel) reusa el mismo hook, mismo criterio.
const POLL_INTERVAL_MS = 5_000;

function mergeSensors(
  devices: DeviceCapabilitiesView[],
  telemetryList: SensorSummaryView[],
  pollResults: TelemetryPollResult[],
): SensorSummaryView[] {
  const byRef = new Map<string, SensorSummaryView>();
  for (const sensor of telemetryList) byRef.set(sensor.ref, sensor);

  for (const device of devices) {
    for (const capability of device.capabilities) {
      if (capability.severity !== "read-only") continue;
      const existing = byRef.get(capability.ref);
      byRef.set(capability.ref, {
        ref: capability.ref,
        edgeAgentId: device.edgeAgentId,
        deviceName: device.deviceName,
        description: capability.description,
        connected: true,
        latest: existing?.latest,
      });
    }
  }

  const now = new Date().toISOString();
  for (const result of pollResults) {
    if (!result.success || result.value === undefined) continue;
    const existing = byRef.get(result.ref);
    if (existing) byRef.set(result.ref, { ...existing, connected: true, latest: { value: result.value, at: now } });
  }

  return Array.from(byRef.values());
}

/**
 * Valor actual de cada sensor (capability read-only) + alertas activas —
 * extraído de `SensoresClient.tsx` para que el Modo Presentación JARVIS
 * (`SensorsPanel`) lo reuse sin duplicar el fetch/merge de
 * `/api/capabilities` + `/api/telemetry` + `/api/telemetry/poll` +
 * `kan_list_alerts`. Comportamiento idéntico al que tenía `SensoresClient`
 * inline — solo cambió de lugar.
 */
export function useAllSensors(): { sensors: SensorSummaryView[]; alerts: AlertView[]; loading: boolean } {
  const [devices, setDevices] = useState<DeviceCapabilitiesView[]>([]);
  const [telemetryList, setTelemetryList] = useState<SensorSummaryView[]>([]);
  const [pollResults, setPollResults] = useState<TelemetryPollResult[]>([]);
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function tick(options: { skipIfHidden?: boolean } = {}) {
      if (options.skipIfHidden && typeof document !== "undefined" && document.hidden) return;
      try {
        const [capabilitiesRes, telemetryRes, alertsRes] = await Promise.all([
          fetch("/api/capabilities", { cache: "no-store" }),
          fetch("/api/telemetry", { cache: "no-store" }),
          fetch("/api/tools/kan_list_alerts/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ args: {} }),
            cache: "no-store",
          }),
        ]);
        const capabilitiesData = await capabilitiesRes.json();
        const telemetryData = await telemetryRes.json();
        const alertsData = await alertsRes.json();
        if (cancelled) return;

        const liveDevices: DeviceCapabilitiesView[] = capabilitiesData.devices ?? [];
        setDevices(liveDevices);
        setTelemetryList(telemetryData.sensors ?? []);
        setAlerts(alertsData?.data?.alerts ?? []);

        const readOnlyRefs = liveDevices.flatMap((device) =>
          device.capabilities.filter((c) => c.severity === "read-only").map((c) => c.ref),
        );
        if (readOnlyRefs.length > 0) {
          const pollRes = await fetch("/api/telemetry/poll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refs: readOnlyRefs }),
            cache: "no-store",
          });
          const pollData = await pollRes.json();
          if (!cancelled) setPollResults(pollData.readings ?? []);
        } else if (!cancelled) {
          setPollResults([]);
        }
      } catch {
        // Se sigue mostrando el último estado conocido aunque el Gateway esté caído.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    tick();
    const interval = setInterval(() => tick({ skipIfHidden: true }), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const sensors = useMemo(() => mergeSensors(devices, telemetryList, pollResults), [devices, telemetryList, pollResults]);

  return { sensors, alerts, loading };
}
