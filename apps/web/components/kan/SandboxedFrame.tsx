"use client";

/**
 * `<iframe sandbox="">` sin ningún permiso (ni scripts ni same-origin) —
 * el mecanismo de aislamiento para SVG/documentos HTML que KAN genera, ver
 * `lib/kan/sandboxedHtml.ts`.
 */
export function SandboxedFrame({ html, title, className }: { html: string; title: string; className?: string }) {
  return (
    <iframe
      sandbox=""
      srcDoc={html}
      title={title}
      className={className ?? "h-64 w-full rounded-lg border-0 bg-white"}
    />
  );
}
