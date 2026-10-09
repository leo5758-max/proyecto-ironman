import type { ToolProviderPort } from "@kan/core";
import type { ToolDescriptor, ToolExecutionResult } from "@kan/plugin-contract";
import { SHOW_DISPLAY_TOOL_DESCRIPTOR, executeShowDisplayTool } from "@/lib/kan/showDisplayTool";
import { CREATE_DIAGRAM_TOOL_DESCRIPTOR, executeCreateDiagramTool } from "@/lib/kan/createDiagramTool";
import { OPEN_PANEL_TOOL_DESCRIPTOR, executeOpenPanelTool } from "@/lib/kan/openPanelTool";
import { SHOW_3D_TOOL_DESCRIPTOR, executeShow3dTool } from "@/lib/kan/show3dTool";

/**
 * Registro de tools "puras de UI" — sin estado ni efecto de backend, nunca
 * pasan por `packages/gateway-core` (ver el comentario de cada
 * `*Tool.ts`). Empezó como un único `if` para `kan_show_display` (Modo
 * Presentación); con `kan_create_diagram`/`kan_open_panel` (ventanas
 * flotantes) sumándose, se generalizó a una lista para no triplicar la
 * misma rama.
 */
const UI_ONLY_TOOLS: Array<{ descriptor: ToolDescriptor; execute: (args: unknown) => Promise<ToolExecutionResult> }> = [
  { descriptor: SHOW_DISPLAY_TOOL_DESCRIPTOR, execute: executeShowDisplayTool },
  { descriptor: CREATE_DIAGRAM_TOOL_DESCRIPTOR, execute: executeCreateDiagramTool },
  { descriptor: OPEN_PANEL_TOOL_DESCRIPTOR, execute: executeOpenPanelTool },
  { descriptor: SHOW_3D_TOOL_DESCRIPTOR, execute: executeShow3dTool },
];

/**
 * Decorator sobre un `ToolProviderPort` real (`GatewayToolProvider`) que
 * agrega las tools de UI de `UI_ONLY_TOOLS` a la lista sin que el Gateway
 * sepa que existen. `resolveConfirmation()` pasa directo — ninguna de
 * estas tools pide confirmación.
 */
export class DisplayAwareToolProvider implements ToolProviderPort {
  constructor(private readonly inner: ToolProviderPort) {}

  async listTools(): Promise<ToolDescriptor[]> {
    const tools = await this.inner.listTools();
    return [...tools, ...UI_ONLY_TOOLS.map((tool) => tool.descriptor)];
  }

  async executeTool(name: string, args: unknown): Promise<ToolExecutionResult> {
    const uiTool = UI_ONLY_TOOLS.find((tool) => tool.descriptor.name === name);
    if (uiTool) return uiTool.execute(args);
    return this.inner.executeTool(name, args);
  }

  async resolveConfirmation(confirmationId: string, approved: boolean): Promise<ToolExecutionResult> {
    return this.inner.resolveConfirmation(confirmationId, approved);
  }
}
