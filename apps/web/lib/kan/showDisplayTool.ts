import type { ToolDescriptor, ToolExecutionResult } from "@kan/plugin-contract";

export const SHOW_DISPLAY_TOOL_NAME = "kan_show_display";

export type DisplayView = "sensors" | "devices" | "alerts" | "status" | "custom";

const VALID_VIEWS: DisplayView[] = ["sensors", "devices", "alerts", "status", "custom"];

export interface ShowDisplayArgs {
  view: DisplayView;
  title?: string;
}

/**
 * Tool local de `apps/web` (Modo Presentación JARVIS) — a propósito, NO una
 * capability del Gateway: no tiene ningún estado ni efecto de backend, es
 * una señal pura de UI. Se inyecta en la lista de tools vía
 * `DisplayAwareToolProvider`, nunca pasa por `packages/gateway-core`.
 *
 * La `description` de acá abajo hace las veces de guía de "cuándo usarla"
 * que normalmente iría en SYSTEM_PROMPT/VOICE_SYSTEM_PROMPT — esos dos
 * strings viven en `packages/core` (fuera de `apps/web`), así que en vez de
 * tocarlos, la guía completa vive en esta `description`: todo proveedor de
 * function-calling (Gemini/Anthropic/OpenAI) manda nombre+descripción+schema
 * de cada tool al modelo, y la usa para decidir cuándo llamarla — no es un
 * atajo, es el mecanismo real.
 */
export const SHOW_DISPLAY_TOOL_DESCRIPTOR: ToolDescriptor = {
  name: SHOW_DISPLAY_TOOL_NAME,
  description:
    "Activa el Modo Presentación de KAN: una interfaz visual de pantalla completa tipo HUD que muestra paneles de " +
    "información (sensores, dispositivos, alertas, o un resumen general). USAR SOLO cuando el usuario pida " +
    "explícitamente ver algo en pantalla — frases como 'muéstrame las gráficas/sensores', 'muéstrame los " +
    "dispositivos', 'muéstrame las alertas', 'muéstrame el estado', 'modo presentación', 'modo JARVIS', 'desplegá " +
    "el panel'. NUNCA la invoques espontáneamente ni para ilustrar una respuesta de texto normal — es una " +
    "transición visual disruptiva (pantalla completa), no una forma de decorar una respuesta. Elegí 'view' según " +
    "lo pedido: 'sensors' para gráficas/sensores/lecturas, 'devices' para dispositivos conectados, 'alerts' para " +
    "alertas activas, 'status' para un resumen general de todo, 'custom' para combinar varios paneles a la vez " +
    "(ej. 'muéstrame todo'). Podés seguir charlando normalmente con el usuario después de invocarla — la pantalla " +
    "queda abierta hasta que el usuario la cierre (Escape, botón X, o decir 'volver'/'cerrar'/'salir'); no hace " +
    "falta ni tiene sentido invocarla de nuevo para cerrarla.",
  inputSchema: {
    type: "object",
    properties: {
      view: {
        type: "string",
        enum: VALID_VIEWS,
        description: "Qué panel mostrar — ver la descripción de la tool para el criterio de elección.",
      },
      title: {
        type: "string",
        description: "Título opcional del panel (ej. 'Sensores del taller'). Si se omite, se usa un título genérico según 'view'.",
      },
    },
    required: ["view"],
  },
};

function isDisplayView(value: unknown): value is DisplayView {
  return typeof value === "string" && (VALID_VIEWS as string[]).includes(value);
}

export function parseShowDisplayArgs(args: unknown): ShowDisplayArgs | undefined {
  const raw = args as { view?: unknown; title?: unknown } | null;
  if (!isDisplayView(raw?.view)) return undefined;
  const title = typeof raw?.title === "string" && raw.title.trim() ? raw.title.trim() : undefined;
  return { view: raw.view, title };
}

/** Sin I/O — valida y devuelve los args tal cual, para que el modelo tenga un resultado de tool normal y pueda seguir la conversación. */
export async function executeShowDisplayTool(args: unknown): Promise<ToolExecutionResult> {
  const parsed = parseShowDisplayArgs(args);
  if (!parsed) {
    return { success: false, error: "'view' es requerido y debe ser uno de: sensors, devices, alerts, status, custom." };
  }
  return { success: true, data: parsed };
}
