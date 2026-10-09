import { SensorsPanel } from "@/components/kan/hud/panels/SensorsPanel";
import { DeviceList } from "@/components/dispositivos/DeviceList";

/**
 * Panel "vista general" del menú hamburguesa (modo pantalla completa /
 * kiosko) — compone, sin reimplementar fetching, los dos paneles que ya
 * existen por separado: `SensorsPanel` (grilla HUD de sensores, ya usada en
 * Modo Presentación JARVIS) y `DeviceList` (ya usado en `/dispositivos` y
 * en el overlay de `DispositivosPanel`). Siempre disponible desde el
 * hamburguesa, no solo en fullscreen — es útil con o sin pantalla completa.
 */
export function OverviewPanel() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs tracking-widest text-white/50 uppercase">Sensores</h2>
        <SensorsPanel />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs tracking-widest text-white/50 uppercase">Dispositivos</h2>
        <DeviceList />
      </section>
    </div>
  );
}
