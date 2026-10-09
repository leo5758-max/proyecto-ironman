/**
 * Envuelve SVG/HTML crudo en un documento mínimo para mostrarlo dentro de
 * un `<iframe sandbox="">` — sin atributos de sandbox (ni
 * `allow-scripts` ni `allow-same-origin`), el iframe no puede ejecutar
 * JS ni tocar nada del documento padre, así que no hace falta sanitizar
 * el HTML/SVG a mano (ni sumar una dependencia tipo DOMPurify). Usado por
 * `RichMessageContent.tsx` (bloques ```svg``` en el chat) y
 * `DiagramRenderer.tsx` (ventana de diagrama, `type: "svg" | "document"`).
 */
export function wrapSvgDocument(svg: string): string {
  return `<!doctype html><html><head><meta charset="utf-8" /><style>html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:#fff;}svg{max-width:100%;height:auto;}</style></head><body>${svg}</body></html>`;
}

export function wrapHtmlDocument(html: string): string {
  if (/<html[\s>]/i.test(html)) return html;
  return `<!doctype html><html><head><meta charset="utf-8" /><style>body{margin:16px;font-family:system-ui,sans-serif;}</style></head><body>${html}</body></html>`;
}
