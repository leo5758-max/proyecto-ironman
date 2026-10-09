import type { ToolDescriptor, ToolExecutionResult } from "@kan/plugin-contract";

export const CREATE_DIAGRAM_TOOL_NAME = "kan_create_diagram";

export type DiagramFormat = "mermaid" | "svg" | "document";

const VALID_FORMATS: DiagramFormat[] = ["mermaid", "svg", "document"];

export interface CreateDiagramArgs {
  format: DiagramFormat;
  content: string;
  title?: string;
}

/**
 * Tool local de `apps/web` (rediseño de ventanas flotantes) — mismo
 * criterio que `showDisplayTool.ts`: pura señal de UI, sin estado ni
 * efecto de backend, inyectada vía `DisplayAwareToolProvider`. Abre el
 * diagrama como ventana flotante (`kind: "diagram"`, ver
 * `useFloatingWindows.ts`), no como Modo Presentación de pantalla
 * completa — a diferencia de `kan_show_display`, que sí toma control de
 * toda la pantalla.
 */
export const CREATE_DIAGRAM_TOOL_DESCRIPTOR: ToolDescriptor = {
  name: CREATE_DIAGRAM_TOOL_NAME,
  description:
    "Abre una ventana flotante con un diagrama o documento visual. USAR cuando el usuario pida un diagrama de " +
    "flujo, de secuencia, de arquitectura, un Gantt, o cualquier otro diagrama, o un documento para leer. Elegí " +
    "'format' según el contenido que generes: 'mermaid' para diagramas (sintaxis Mermaid — flowchart, " +
    "sequenceDiagram, gantt, etc., el 'content' es el código Mermaid tal cual, SIN los backticks ```mermaid " +
    "de markdown), 'svg' cuando el contenido es markup SVG crudo, 'document' para un documento HTML para leer " +
    "(reporte, resumen, tabla armada). La ventana queda flotando y el usuario puede moverla/minimizarla/cerrarla " +
    "sin interrumpir la conversación — podés seguir charlando normalmente después de invocarla.",
  inputSchema: {
    type: "object",
    properties: {
      format: {
        type: "string",
        enum: VALID_FORMATS,
        description: "Formato del contenido — ver la descripción de la tool para el criterio de elección.",
      },
      content: {
        type: "string",
        description: "El código/markup del diagrama o documento, según 'format'.",
      },
      title: {
        type: "string",
        description: "Título de la ventana (ej. 'Flujo de autenticación'). Si se omite, se usa un título genérico.",
      },
    },
    required: ["format", "content"],
  },
};

function isDiagramFormat(value: unknown): value is DiagramFormat {
  return typeof value === "string" && (VALID_FORMATS as string[]).includes(value);
}

export function parseCreateDiagramArgs(args: unknown): CreateDiagramArgs | undefined {
  const raw = args as { format?: unknown; content?: unknown; title?: unknown } | null;
  if (!isDiagramFormat(raw?.format)) return undefined;
  if (typeof raw?.content !== "string" || !raw.content.trim()) return undefined;
  const title = typeof raw?.title === "string" && raw.title.trim() ? raw.title.trim() : undefined;
  return { format: raw.format, content: raw.content, title };
}

/** Sin I/O — valida y devuelve los args tal cual, para que el modelo tenga un resultado de tool normal y pueda seguir la conversación. */
export async function executeCreateDiagramTool(args: unknown): Promise<ToolExecutionResult> {
  const parsed = parseCreateDiagramArgs(args);
  if (!parsed) {
    return { success: false, error: "'format' (mermaid, svg o document) y 'content' son requeridos." };
  }
  return { success: true, data: parsed };
}
