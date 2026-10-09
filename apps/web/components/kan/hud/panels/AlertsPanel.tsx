"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { HudPanel } from "@/components/kan/hud/HudPanel";
import type { AlertView } from "@/lib/secuencias/types";

/** Panel "alertas" del Modo Presentación JARVIS — mismo fetch que ya usa `SensoresClient`/`useAllSensors` (`kan_list_alerts`). */
export function AlertsPanel({ delayMs = 0 }: { delayMs?: number }) {
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tools/kan_list_alerts/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ args: {} }),
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAlerts(data?.data?.alerts ?? []);
      })
      .catch(() => {
        if (!cancelled) setAlerts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <HudPanel title="Alertas activas" delayMs={delayMs}>
      {!loading && alerts.length === 0 && <p className="font-mono text-sm text-white/50">Ninguna alerta activa ahora mismo.</p>}
      {alerts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <li key={alert.alertId} className="flex items-center gap-2 border-l-2 border-accent/60 pl-2 text-sm text-white">
              <Bell className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span>
                {alert.label} {alert.comparator === "above" ? "supera" : "baja de"} {alert.threshold}
                {alert.unit ? ` ${alert.unit}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </HudPanel>
  );
}
