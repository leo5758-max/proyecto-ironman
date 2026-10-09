import type { ToolDescriptor, ToolExecutionResult } from "@kan/plugin-contract";

export const OPEN_PANEL_TOOL_NAME = "kan_open_panel";

// "3d" no forma parte de VALID_TYPES de abajo — kan_open_panel sigue
// exponiendo solo sus 5 tipos originales; una ventana "3d" se alcanza
// únicamente vía la tool dedicada kan_show_3d (show3dTool.ts), mismo
// criterio que separa "diagram" (alcanzable por dos caminos) de "search"
// (uno solo). PanelType es el vocabulario compartido de "tipo de ventana
// flotante" para useFloatingWindows.ts/FloatingWindowLayer.tsx, no está
// atado 1:1 al enum de esta tool.
export type PanelType = "control" | "search" | "diagram" | "sensor" | "code" | "3d";

const VALID_TYPES: PanelType[] = ["control", "search", "diagram", "sensor", "code"];

export interface OpenPanelArgs {
  type: PanelType;
  title: string;
  deviceId?: string;
  query?: string;
  content?: string;
  language?: string;
}

/**
 * Tool local de `apps/web` (rediseño de ventanas flotantes) — mismo
 * criterio que `showDisplayTool.ts`/`createDiagramTool.ts`: pura señal de
 * UI, inyectada vía `DisplayAwareToolProvider`. Cubre los otros 4 tipos de
 * ventana además de diagrama (que también puede abrirse acá con
 * `type: "diagram"`, o con la tool dedicada `kan_create_diagram` cuando
 * conviene especificar el formato exacto — mermaid/svg/document).
 */
export const OPEN_PANEL_TOOL_DESCRIPTOR: ToolDescriptor = {
  name: OPEN_PANEL_TOOL_NAME,
  description:
    "Abre una ventana flotante de un tipo específico. USAR cuando el usuario pida ver algo puntual sin querer la " +
    "pantalla completa (eso es 'kan_show_display'). Elegí 'type': 'control' para los actuadores de un dispositivo " +
    "(pasá 'deviceId' si el usuario nombró uno puntual, si no se muestran todos), 'sensor' para la gráfica de un " +
    "sensor puntual ('deviceId' = referencia del sensor), 'code' para mostrar un fragmento de código con " +
    "'content' (con syntax highlighting), 'search' para mostrar el resultado de una búsqueda/pregunta con 'query' " +
    "= lo que se buscó y 'content' = tu respuesta ya elaborada (esto NO dispara una búsqueda real en internet, " +
    "solo presenta lo que vos ya sabés en una ventana aparte), 'diagram' para un diagrama/documento simple con " +
    "'content' (para más control de formato, mejor usar 'kan_create_diagram'). Para 'code', pasá también " +
    "'language' (ej. 'typescript', 'python', 'bash') para que el highlighting sea preciso. La ventana queda " +
    "flotando, movible y minimizable — podés seguir charlando normalmente después de invocarla.",
  inputSchema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: VALID_TYPES,
        description: "Qué tipo de ventana abrir — ver la descripción de la tool para el criterio de elección.",
      },
      title: {
        type: "string",
        description: "Título de la ventana (ej. 'Luces del living', 'Sensor de temperatura').",
      },
      deviceId: {
        type: "string",
        description: "Referencia del dispositivo/sensor — usado por 'control' y 'sensor'.",
      },
      query: {
        type: "string",
        description: "La pregunta/búsqueda del usuario — usado por 'search'.",
      },
      content: {
        type: "string",
        description: "El contenido a mostrar — usado por 'search', 'diagram' y 'code'.",
      },
      language: {
        type: "string",
        description: "Lenguaje del código (ej. 'typescript', 'python', 'bash') — usado por 'code' para el highlighting.",
      },
    },
    required: ["type", "title"],
  },
};

function isPanelType(value: unknown): value is PanelType {
  return typeof value === "string" && (VALID_TYPES as string[]).includes(value);
}

export function parseOpenPanelArgs(args: unknown): OpenPanelArgs | undefined {
  const raw = args as { type?: unknown; title?: unknown; deviceId?: unknown; query?: unknown; content?: unknown; language?: unknown } | null;
  if (!isPanelType(raw?.type)) return undefined;
  if (typeof raw?.title !== "string" || !raw.title.trim()) return undefined;

  return {
    type: raw.type,
    title: raw.title.trim(),
    deviceId: typeof raw.deviceId === "string" && raw.deviceId.trim() ? raw.deviceId.trim() : undefined,
    query: typeof raw.query === "string" && raw.query.trim() ? raw.query.trim() : undefined,
    content: typeof raw.content === "string" && raw.content.trim() ? raw.content.trim() : undefined,
    language: typeof raw.language === "string" && raw.language.trim() ? raw.language.trim() : undefined,
  };
}

/** Sin I/O — valida y devuelve los args tal cual, para que el modelo tenga un resultado de tool normal y pueda seguir la conversación. */
export async function executeOpenPanelTool(args: unknown): Promise<ToolExecutionResult> {
  const parsed = parseOpenPanelArgs(args);
  if (!parsed) {
    return { success: false, error: "'type' (control, search, diagram, sensor o code) y 'title' son requeridos." };
  }
  return { success: true, data: parsed };
}
