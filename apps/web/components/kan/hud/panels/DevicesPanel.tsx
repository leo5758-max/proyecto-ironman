"use client";

import { HudPanel } from "@/components/kan/hud/HudPanel";
import { DeviceList } from "@/components/dispositivos/DeviceList";

/** Panel "dispositivos" del Modo Presentación JARVIS — `DeviceList` ya trae sus propios datos vía `useSystemStatusContext()`, se reusa tal cual. */
export function DevicesPanel({ delayMs = 0 }: { delayMs?: number }) {
  return (
    <HudPanel title="Dispositivos conectados" delayMs={delayMs}>
      <DeviceList />
    </HudPanel>
  );
}
