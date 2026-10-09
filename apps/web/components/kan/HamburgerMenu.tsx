"use client";

import { Menu, X } from "lucide-react";
import { SECTIONS, type SectionKey } from "@/lib/kan/sections";
import { playMenuOpen, playMenuClose, playSectionSelect } from "@/lib/kan/sound";
import { HUD_SCOPE_STYLE } from "@/components/kan/hud/hudScope";

// Radio del arco en rem — cabe cómodo incluso en una pantalla angosta
// (~320px): el botón vive en la esquina superior derecha y el arco barre
// hacia abajo-izquierda, así que el offset máximo hacia la izquierda
// (radio + mitad del ícono) nunca se acerca al borde opuesto.
const ARC_RADIUS_REM = 8.5;

/**
 * Botón hamburguesa + arco de accesos a las 7 secciones — reemplaza al
 * `Sidebar` fijo de siempre para la pantalla inmersiva de /inicio (rediseño
 * JARVIS): nada de navegación visible por defecto, todo aparece al tocar
 * este único botón. Los íconos entran en cuarto de círculo (de "abajo" a
 * "izquierda" del botón, 90°) con un stagger por `transition-delay` — CSS
 * puro, sin librería de animación. Tocar una sección la abre como overlay
 * (`ImmersiveHome` decide qué monta); tocar el hamburguesa de nuevo (ahora
 * una ✕) cierra el arco sin cambiar de sección activa.
 */
export function HamburgerMenu({
  open,
  onToggle,
  onSelect,
}: {
  open: boolean;
  onToggle: () => void;
  onSelect: (section: SectionKey) => void;
}) {
  const step = (Math.PI / 2) / (SECTIONS.length - 1);

  return (
    // HUD_SCOPE_STYLE: flota sobre el fondo negro puro de la grilla, no
    // sobre una superficie del tema normal — sin esto, `.glass` resolvía
    // `--color-surface-2` al gris-violeta oscuro del tema (no al negro
    // casi puro que usan SectionOverlay/JARVISDisplay/FloatingWindow),
    // se veía como un parche pegado encima en vez de parte del HUD.
    <div className="fixed top-4 right-4 z-[210]" style={HUD_SCOPE_STYLE}>
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => {
          (open ? playMenuClose : playMenuOpen)();
          onToggle();
        }}
        className="press glass flex h-11 w-11 items-center justify-center rounded-full border border-line/80 text-ink transition-colors duration-fast hover:bg-white/10"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      <nav aria-label="Secciones de KAN" aria-hidden={!open} className="pointer-events-none absolute top-0 right-0">
        {SECTIONS.map((section, index) => {
          const theta = index * step;
          const dx = -ARC_RADIUS_REM * Math.sin(theta);
          const dy = ARC_RADIUS_REM * Math.cos(theta);
          const Icon = section.icon;
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => {
                playSectionSelect();
                onSelect(section.key);
              }}
              title={section.label}
              tabIndex={open ? 0 : -1}
              style={{
                transform: open ? `translate(${dx}rem, ${dy}rem)` : "translate(0, 0) scale(0.4)",
                transitionDelay: open ? `${index * 35}ms` : "0ms",
              }}
              className={`press glass group pointer-events-auto absolute top-0 right-0 flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full border border-line/80 text-ink transition-all duration-base ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-white/10 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{section.label}</span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-ink-faint opacity-0 transition-opacity duration-fast group-hover:opacity-100"
              >
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
