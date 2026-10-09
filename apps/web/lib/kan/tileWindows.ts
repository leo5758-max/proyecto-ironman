// Espacio reservado arriba (SoundToggle/HamburgerMenu/NewWindowButton, todos
// h-11 + margen) y abajo (StatusBar, h-9 + margen) — la grilla nunca tapa el
// chrome fijo de ImmersiveHome.
const TOP_CLEARANCE = 72;
const BOTTOM_CLEARANCE = 56;
const SIDE_MARGIN = 16;
const GAP = 16;

export interface TiledRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Grilla cuadrada-ish para "reacomodar" ventanas flotantes al entrar en
 * modo pantalla completa (`useFullscreen`) — pura, sin estado: recibe
 * cuántas ventanas hay y el viewport, devuelve un rect por índice en el
 * mismo orden que la lista de ventanas. `useFloatingWindows.retileWindows()`
 * es quien la aplica.
 */
export function tileWindows(count: number, viewportWidth: number, viewportHeight: number): TiledRect[] {
  if (count === 0) return [];

  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const usableWidth = viewportWidth - SIDE_MARGIN * 2 - GAP * (cols - 1);
  const usableHeight = viewportHeight - TOP_CLEARANCE - BOTTOM_CLEARANCE - GAP * (rows - 1);
  const cellWidth = Math.max(usableWidth / cols, 240);
  const cellHeight = Math.max(usableHeight / rows, 180);

  return Array.from({ length: count }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      x: SIDE_MARGIN + col * (cellWidth + GAP),
      y: TOP_CLEARANCE + row * (cellHeight + GAP),
      width: cellWidth,
      height: cellHeight,
    };
  });
}
