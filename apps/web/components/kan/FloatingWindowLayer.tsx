"use client";

import { ControlClient } from "@/components/control/ControlClient";
import { SensorWindowContent } from "@/components/sensores/SensorWindowContent";
import { DiagramRenderer } from "@/components/kan/DiagramRenderer";
import { CodeWindowContent } from "@/components/kan/CodeWindowContent";
import { SearchWindowContent } from "@/components/kan/SearchWindowContent";
import { Model3DWindowContent } from "@/components/kan/Model3DWindowContent";
import { FloatingWindow } from "@/components/kan/FloatingWindow";
import type { FloatingWindowState } from "@/lib/kan/useFloatingWindows";
import type { Shape3D } from "@/lib/kan/show3dTool";

// Banda de z-index de las ventanas flotantes — por encima de StatusBar
// (150, "ventanas flotantes → encima de todo... StatusBar debajo de
// ventanas") y por debajo de HistorySheet (185), SectionOverlay (190),
// JARVISDisplay (200) y el chrome fijo (210). El índice de cada ventana en
// el array (no un contador que solo crece) acota el rango real siempre a
// [160, 160 + windows.length - 1] — nunca puede superar esos techos.
const WINDOW_Z_BASE = 160;

function renderWindowContent(win: FloatingWindowState) {
  switch (win.kind) {
    case "control":
      return <ControlClient edgeAgentId={win.props.deviceId as string | undefined} />;
    case "sensor":
      return <SensorWindowContent deviceId={win.props.deviceId as string | undefined} />;
    case "diagram":
      return (
        <DiagramRenderer
          format={(win.props.format as "mermaid" | "svg" | "document" | undefined) ?? "mermaid"}
          content={(win.props.content as string | undefined) ?? ""}
          title={win.title}
        />
      );
    case "code":
      return <CodeWindowContent content={(win.props.content as string | undefined) ?? ""} language={win.props.language as string | undefined} />;
    case "search":
      return <SearchWindowContent query={win.props.query as string | undefined} content={win.props.content as string | undefined} />;
    case "3d":
      return <Model3DWindowContent shapes={win.props.shapes as Shape3D[] | undefined} />;
    default:
      return null;
  }
}

/** Monta todas las ventanas flotantes abiertas — un solo lugar en `ImmersiveHome.tsx`. */
export function FloatingWindowLayer({
  windows,
  onClose,
  onToggleMinimize,
  onFocus,
  onMove,
}: {
  windows: FloatingWindowState[];
  onClose: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}) {
  return (
    <>
      {windows.map((win, index) => (
        <FloatingWindow
          key={win.id}
          win={win}
          zIndex={WINDOW_Z_BASE + index}
          onClose={() => onClose(win.id)}
          onToggleMinimize={() => onToggleMinimize(win.id)}
          onFocus={() => onFocus(win.id)}
          onMove={(x, y) => onMove(win.id, x, y)}
        >
          {renderWindowContent(win)}
        </FloatingWindow>
      ))}
    </>
  );
}
