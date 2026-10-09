import { Thermometer, Cpu, Workflow, Bell, Save, Activity, Settings, LayoutGrid, type LucideIcon } from "lucide-react";

/** Las 8 secciones que el menú hamburguesa de /inicio despliega como overlay (rediseño JARVIS). */
export type SectionKey =
  | "sensores"
  | "dispositivos"
  | "secuencias"
  | "alertas"
  | "respaldos"
  | "logs"
  | "configuracion"
  | "vista-general";

export interface SectionDescriptor {
  key: SectionKey;
  label: string;
  icon: LucideIcon;
}

export const SECTIONS: SectionDescriptor[] = [
  { key: "sensores", label: "Sensores", icon: Thermometer },
  { key: "dispositivos", label: "Dispositivos", icon: Cpu },
  { key: "secuencias", label: "Secuencias", icon: Workflow },
  { key: "alertas", label: "Alertas", icon: Bell },
  { key: "respaldos", label: "Respaldos", icon: Save },
  { key: "logs", label: "Logs", icon: Activity },
  { key: "configuracion", label: "Configuración", icon: Settings },
  // Modo pantalla completa / kiosko — sensores + dispositivos en una sola
  // grilla, útil con o sin fullscreen (no se oculta condicionalmente).
  { key: "vista-general", label: "Vista general", icon: LayoutGrid },
];
