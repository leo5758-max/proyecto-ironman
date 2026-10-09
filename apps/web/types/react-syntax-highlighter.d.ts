// `react-syntax-highlighter` no publica sus propios tipos ni tiene un
// paquete `@types/*` compatible con esta major (v16) — declaración mínima
// ambiental cubriendo solo los subpaths que `CodeBlock.tsx` importa
// (la variante "light", registrada a mano por lenguaje, para no tirar del
// bundle completo de Prism).
declare module "react-syntax-highlighter/dist/esm/prism-light" {
  import type { ComponentType, CSSProperties } from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: Record<string, unknown>;
    customStyle?: CSSProperties;
    wrapLongLines?: boolean;
    children?: string;
  }

  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps> & {
    registerLanguage: (name: string, language: unknown) => void;
  };

  export default SyntaxHighlighter;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism/*" {
  const style: Record<string, unknown>;
  export default style;
}

declare module "react-syntax-highlighter/dist/esm/languages/prism/*" {
  const language: unknown;
  export default language;
}
