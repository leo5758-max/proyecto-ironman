import { ImageResponse } from "next/og";

export const alt = "KAN — Controlá tu hardware con inteligencia artificial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Hex reales, no `var(--color-accent)` — mismo problema ya resuelto en
// `lib/kan/mermaidConfig.ts#resolveCssVar`: `ImageResponse` renderiza fuera
// del DOM, no hay `getComputedStyle` ni CSS custom properties disponibles.
// Acento default de KAN (`--kan-accent` en `globals.css`) — la imagen es un
// asset estático generado una vez, no puede reflejar el acento personalizado
// de cada usuario.
const ACCENT = "#00ff9d";
const BACKGROUND = "#0a0a0a";

/**
 * `og:image`/`twitter:image` compartida por TODAS las páginas públicas —
 * convención de archivo de Next.js (`opengraph-image.tsx` en la raíz de
 * `app/`): el más cercano en el árbol de rutas gana, así que sin uno propio
 * por página, cualquier ruta pública cae acá. Un solo archivo, no uno por
 * página — no hay arte específico por sección pedido.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          backgroundColor: BACKGROUND,
        }}
      >
        <div style={{ display: "flex", fontSize: 180, fontWeight: 700, color: ACCENT, letterSpacing: -4 }}>KAN</div>
        <div style={{ display: "flex", fontSize: 36, color: "#e8e8f0" }}>
          Controlá tu hardware con inteligencia artificial
        </div>
      </div>
    ),
    { ...size },
  );
}
