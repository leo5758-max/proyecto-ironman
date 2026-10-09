import type { ToolDescriptor, ToolExecutionResult } from "@kan/plugin-contract";

export const SHOW_3D_TOOL_NAME = "kan_show_3d";

export type Shape3DType = "box" | "sphere" | "cylinder" | "cone";

const VALID_SHAPE_TYPES: Shape3DType[] = ["box", "sphere", "cylinder", "cone"];
// Techo generoso pero acotado — sin esto un payload del modelo con miles de
// formas podría trabar el render WebGL del lado del cliente.
const MAX_SHAPES = 24;

export interface Shape3D {
  type: Shape3DType;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
}

export interface Show3DArgs {
  title?: string;
  shapes: Shape3D[];
}

/**
 * Tool local de `apps/web` (mismo criterio que `createDiagramTool.ts`/
 * `openPanelTool.ts`): pura señal de UI, sin estado ni efecto de backend,
 * inyectada vía `DisplayAwareToolProvider`. Devuelve una lista DECLARATIVA
 * de formas geométricas — nunca código ejecutable: `Model3DWindowContent.tsx`
 * las renderiza mapeando `type` a una geometría de three.js, sin `eval` ni
 * `new Function` sobre nada que venga del modelo (riesgo de ejecución de
 * código arbitrario si el LLM es manipulado vía prompt injection).
 */
export const SHOW_3D_TOOL_DESCRIPTOR: ToolDescriptor = {
  name: SHOW_3D_TOOL_NAME,
  description:
    "Abre una ventana flotante con un visor 3D. USAR cuando el usuario pida ver algo en 3D, o cuando suba una " +
    "imagen de un objeto físico (una placa, un motor, una pieza mecánica) y pida verlo en 3D — la imagen ya está " +
    "en este mismo turno de conversación, analizala vos mismo. Descomponé el objeto en formas geométricas simples " +
    "('box', 'sphere', 'cylinder', 'cone') combinadas para aproximar su forma real, con posiciones/tamaños " +
    "relativos razonables entre sí (no hace falta escala real, solo que las proporciones entre formas tengan " +
    "sentido). Máximo 24 formas — priorizá las que definen la silueta general antes que el detalle fino.",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Título de la ventana (ej. 'Motor DC aproximado'). Si se omite, se usa un título genérico.",
      },
      shapes: {
        type: "array",
        maxItems: MAX_SHAPES,
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: VALID_SHAPE_TYPES, description: "Tipo de forma geométrica." },
            position: {
              type: "array",
              items: { type: "number" },
              minItems: 3,
              maxItems: 3,
              description: "Posición [x, y, z] del centro de la forma. Default [0, 0, 0].",
            },
            rotation: {
              type: "array",
              items: { type: "number" },
              minItems: 3,
              maxItems: 3,
              description: "Rotación [x, y, z] en radianes. Default [0, 0, 0].",
            },
            size: {
              type: "array",
              items: { type: "number" },
              minItems: 3,
              maxItems: 3,
              description:
                "Tamaño [x, y, z] — ancho/alto/profundidad para 'box', o [radio, alto, radio] para 'cylinder'/'cone' " +
                "(el tercer valor se ignora), o [radio, radio, radio] para 'sphere'. Default [1, 1, 1].",
            },
          },
          required: ["type"],
        },
        description: "Lista de formas que combinadas aproximan el objeto — ver la descripción de la tool.",
      },
    },
    required: ["shapes"],
  },
};

function isShapeType(value: unknown): value is Shape3DType {
  return typeof value === "string" && (VALID_SHAPE_TYPES as string[]).includes(value);
}

function parseVec3(value: unknown, fallback: [number, number, number]): [number, number, number] {
  if (!Array.isArray(value) || value.length !== 3 || !value.every((n) => typeof n === "number" && Number.isFinite(n))) {
    return fallback;
  }
  return [value[0], value[1], value[2]];
}

function parseShape(raw: unknown): Shape3D | undefined {
  const obj = raw as { type?: unknown; position?: unknown; rotation?: unknown; size?: unknown } | null;
  if (!isShapeType(obj?.type)) return undefined;
  return {
    type: obj.type,
    position: parseVec3(obj.position, [0, 0, 0]),
    rotation: parseVec3(obj.rotation, [0, 0, 0]),
    size: parseVec3(obj.size, [1, 1, 1]),
  };
}

export function parseShow3dArgs(args: unknown): Show3DArgs | undefined {
  const raw = args as { title?: unknown; shapes?: unknown } | null;
  if (!Array.isArray(raw?.shapes) || raw.shapes.length === 0) return undefined;

  const shapes = raw.shapes.slice(0, MAX_SHAPES).map(parseShape).filter((s): s is Shape3D => s !== undefined);
  if (shapes.length === 0) return undefined;

  const title = typeof raw?.title === "string" && raw.title.trim() ? raw.title.trim() : undefined;
  return { title, shapes };
}

/** Sin I/O — valida y devuelve los args tal cual, para que el modelo tenga un resultado de tool normal y pueda seguir la conversación. */
export async function executeShow3dTool(args: unknown): Promise<ToolExecutionResult> {
  const parsed = parseShow3dArgs(args);
  if (!parsed) {
    return { success: false, error: "'shapes' (lista no vacía de formas geométricas) es requerido." };
  }
  return { success: true, data: parsed };
}
