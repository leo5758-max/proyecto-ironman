"use client";

import { useState } from "react";
import { Plus, Cpu, Thermometer, Waypoints, Code2, type LucideIcon } from "lucide-react";
import type { ManualWindowKind } from "@/lib/kan/useFloatingWindows";
import { HUD_SCOPE_STYLE } from "@/components/kan/hud/hudScope";

const MANUAL_KINDS: Array<{ kind: ManualWindowKind; label: string; icon: LucideIcon }> = [
  { kind: "control", label: "Control", icon: Cpu },
  { kind: "sensor", label: "Sensor", icon: Thermometer },
  { kind: "diagram", label: "Diagrama", icon: Waypoints },
  { kind: "code", label: "Código", icon: Code2 },
];

/**
 * Botón "+" para abrir ventanas a mano — `search` queda afuera (no tiene
 * sentido sin una pregunta real que responder); `control`/`sensor` abren
 * sin filtro (grilla completa / selector de sensor); `diagram`/`code`
 * abren en modo "composer" editable (`DiagramRenderer`/`CodeWindowContent`
 * detectan `content` vacío y muestran un editor en vez del render de
 * solo-lectura que usan cuando KAN las abre con contenido ya generado).
 * Mismo estilo `press glass` que `HamburgerMenu`/`SoundToggle`.
 */
export function NewWindowButton({ onOpen }: { onOpen: (kind: ManualWindowKind) => void }) {
  const [open, setOpen] = useState(false);

  return (
    // HUD_SCOPE_STYLE: mismo motivo que HamburgerMenu.tsx — este botón
    // flota sobre negro puro, no sobre una superficie del tema normal.
    <div className="fixed right-4 bottom-14 z-[210]" style={HUD_SCOPE_STYLE}>
      {open && (
        <div className="absolute right-0 bottom-full mb-2 flex flex-col items-end gap-1.5">
          {MANUAL_KINDS.map(({ kind, label, icon: Icon }) => (
            <button
              key={kind}
              type="button"
              onClick={() => {
                onOpen(kind);
                setOpen(false);
              }}
              className="press glass flex items-center gap-2 rounded-full border border-line/80 px-3 py-2 text-xs text-ink transition-colors hover:bg-white/10"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        aria-label={open ? "Cerrar selector de ventana" : "Nueva ventana"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`press glass flex h-11 w-11 items-center justify-center rounded-full border border-line/80 text-ink transition-transform duration-fast hover:bg-white/10 ${
          open ? "rotate-45" : ""
        }`}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
