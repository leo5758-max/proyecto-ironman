"use client";

import { useEffect, useState } from "react";
import { useSystemStatusContext } from "@/lib/status/SystemStatusProvider";
import { useIsClient } from "@/lib/useIsClient";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function formatDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/**
 * Barra de estado inferior (estética "JARVIS real") — hora/fecha + estado
 * del Gateway + dispositivos conectados, siempre visible en /inicio.
 * `useIsClient()` (mismo criterio que el saludo de `DashboardClient.tsx`)
 * evita el mismatch de hidratación de mostrar la hora del servidor: server
 * y primer render del cliente muestran "--:--:--", recién después se
 * reemplaza por la hora real — el estado ya arranca con un valor propio
 * (`useState(() => new Date())`) para no depender de un `setState`
 * sincrónico en el efecto (react-hooks/set-state-in-effect), el
 * `setInterval` de abajo solo actualiza dentro de su propio callback.
 */
export function StatusBar() {
  const isClient = useIsClient();
  const [now, setNow] = useState(() => new Date());
  const { status } = useSystemStatusContext();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const online = status?.gateway === "online";
  const onlineAgents = status?.edgeAgents.filter((agent) => agent.status === "online") ?? [];
  const deviceCount = onlineAgents.reduce((sum, agent) => sum + agent.devices.length, 0);

  return (
    <div className="kan-status-bar fixed inset-x-0 bottom-0 z-[150] flex h-9 items-center gap-4 border-t border-[color-mix(in_srgb,var(--kan-accent)_30%,transparent)] bg-black/70 px-4 backdrop-blur-md">
      <span className="font-mono text-xs tabular-nums text-white/80">{isClient ? formatTime(now) : "--:--:--"}</span>
      <span className="kan-hud-label text-white/40">{isClient ? formatDate(now) : ""}</span>

      <span className="ml-auto h-3 w-px bg-[color-mix(in_srgb,var(--kan-accent)_50%,transparent)]" aria-hidden="true" />

      <span className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-success" : "bg-danger"}`} aria-hidden="true" />
        <span className="kan-hud-label text-white/60">{online ? "Gateway online" : "Gateway offline"}</span>
      </span>

      <span className="h-3 w-px bg-[color-mix(in_srgb,var(--kan-accent)_50%,transparent)]" aria-hidden="true" />

      <span className="kan-hud-label text-white/60">
        <span className="font-mono text-white/80">{deviceCount}</span> dispositivos
      </span>
    </div>
  );
}
