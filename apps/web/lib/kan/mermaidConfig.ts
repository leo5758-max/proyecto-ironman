import type { MermaidConfig } from "mermaid";

/**
 * Config de tema de Mermaid alineada al HUD — `securityLevel: "strict"`
 * (mermaid escapa HTML en las labels, así que el SVG que devuelve es
 * seguro para inyectar con `dangerouslySetInnerHTML`, mismo criterio que
 * cualquier integración estándar de mermaid + React).
 *
 * Los `themeVariables` de color necesitan un valor real resuelto (mermaid
 * usa una librería de color internamente para calcular tonos derivados —
 * no entiende `var(--color-accent)` como string), así que se leen recién
 * acá con `getComputedStyle`, cliente-only, para reflejar el acento que el
 * usuario haya elegido en /configuracion en vez de un color fijo.
 *
 * `theme: "base"` (no "dark") + `mainBkg`/`nodeBorder` explícitos: el
 * fondo de las cajas de un flowchart sale de `options.mainBkg`, no de
 * `primaryColor` (confirmado leyendo `node_modules/mermaid/dist/mermaid.js`
 * — el tema "dark" fija `mainBkg` a un valor propio codificado en su
 * constructor, `primaryColor` no se propaga ahí). `theme: "base"` es el
 * único tema pensado para reconfigurarse por completo (así lo documenta
 * mermaid); igual se fijan acá `mainBkg`/`nodeBorder`/`clusterBkg` a mano,
 * sin depender de cómo cada tema derive sus variables — mermaid siempre
 * respeta el valor que se pasa explícito en `themeVariables`.
 */
export function getMermaidConfig(): MermaidConfig {
  const accent = typeof window !== "undefined" ? resolveCssVar("--color-accent", "#8b5cf6") : "#8b5cf6";
  const boxBg = "#111111";
  const text = "#ffffff";

  return {
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      background: "transparent",
      textColor: text,
      lineColor: accent,
      primaryColor: boxBg,
      primaryTextColor: text,
      primaryBorderColor: accent,
      secondaryColor: boxBg,
      secondaryTextColor: text,
      secondaryBorderColor: accent,
      tertiaryColor: boxBg,
      tertiaryTextColor: text,
      tertiaryBorderColor: accent,
      mainBkg: boxBg,
      nodeBorder: accent,
      clusterBkg: boxBg,
      clusterBorder: accent,
      edgeLabelBackground: boxBg,
      titleColor: text,
      fontFamily: "var(--font-geist-sans, sans-serif)",
    },
  };
}

function resolveCssVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
