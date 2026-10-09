"use client";

import type { ReactNode } from "react";
import { useSystemStatusContext } from "@/lib/status/SystemStatusProvider";
import { formatRelativeTime } from "@/lib/status/formatRelativeTime";
import { HudPanel } from "@/components/kan/hud/HudPanel";
import { CountUpNumber } from "@/components/kan/hud/CountUpNumber";

/** Panel "estado" del Modo Presentación JARVIS — resumen general, sin fetch propio (`useSystemStatusContext()` ya está montado en `ShellChrome`). */
export function StatusPanel({ delayMs = 0 }: { delayMs?: number }) {
  const { status } = useSystemStatusContext();

  const onlineAgents = status?.edgeAgents.filter((a) => a.status === "online").length ?? 0;
  const totalDevices = status?.edgeAgents.reduce((sum, a) => sum + a.devices.length, 0) ?? 0;

  return (
    <HudPanel title="Estado general" delayMs={delayMs}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Gateway" value={status?.gateway === "online" ? "En línea" : "Sin conexión"} />
        <Stat label="Edge Agents" value={<CountUpNumber value={onlineAgents} />} />
        <Stat label="Dispositivos" value={<CountUpNumber value={totalDevices} />} />
        <Stat label="Recordatorios activos" value={<CountUpNumber value={status?.jobsCount ?? 0} />} />
      </div>

      {status?.recentActivity && status.recentActivity.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5 border-t border-accent/20 pt-3">
          {status.recentActivity.slice(0, 5).map((entry) => (
            <p key={entry.id} className="flex items-baseline justify-between gap-3 font-mono text-xs text-white/70">
              <span className="truncate">{entry.label}</span>
              <span className="shrink-0 text-white/40">{formatRelativeTime(entry.at)}</span>
            </p>
          ))}
        </div>
      )}
    </HudPanel>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="kan-hud-label text-white/50">{label}</p>
      <p className="font-mono text-2xl font-semibold text-accent">{value}</p>
    </div>
  );
}
