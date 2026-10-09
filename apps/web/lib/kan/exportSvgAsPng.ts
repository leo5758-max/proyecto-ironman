// Fondo sólido oscuro antes de dibujar el SVG — el tema de mermaid usa
// `background: "transparent"` con texto blanco (ver mermaidConfig.ts), así
// que sin esto el PNG exportado sería ilegible fuera de un visor oscuro.
const EXPORT_BACKGROUND = "#111111";
const EXPORT_SCALE = 2;

function readSvgSize(svg: SVGSVGElement): { width: number; height: number } {
  const viewBox = svg.viewBox.baseVal;
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return { width: viewBox.width, height: viewBox.height };
  }
  const rect = svg.getBoundingClientRect();
  return { width: rect.width || 800, height: rect.height || 600 };
}

/**
 * Convierte un `<svg>` (Mermaid o SVG crudo generado por KAN) a PNG y
 * dispara la descarga — mismo mecanismo que ya usan `MermaidEditor.tsx` y
 * `DiagramRenderer.tsx` (formato `svg`), unificado acá para no duplicar la
 * conversión canvas/serialize dos veces. Clona el nodo para fijar
 * `width`/`height` explícitos antes de serializar: el SVG de mermaid puede
 * no traer esos atributos si `useMaxWidth` está activo, y sin un tamaño
 * explícito la `Image` cargada desde el blob puede salir con tamaño 0.
 */
export function exportSvgAsPng(svg: SVGSVGElement, filename: string): void {
  const { width, height } = readSvgSize(svg);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * EXPORT_SCALE;
    canvas.height = height * EXPORT_SCALE;
    const ctx = canvas.getContext("2d");
    URL.revokeObjectURL(svgUrl);
    if (!ctx) return;

    ctx.fillStyle = EXPORT_BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
    ctx.drawImage(image, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const pngUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(pngUrl);
    }, "image/png");
  };
  image.onerror = () => URL.revokeObjectURL(svgUrl);
  image.src = svgUrl;
}

/** Variante para SVG que todavía no está en el DOM (`format: "svg"` en `DiagramRenderer.tsx` — el markup es un string crudo, no un nodo). */
export function exportSvgStringAsPng(svgString: string, filename: string): void {
  const parsed = new DOMParser().parseFromString(svgString, "image/svg+xml");
  const svg = parsed.documentElement;
  if (svg instanceof SVGSVGElement) exportSvgAsPng(svg, filename);
}
