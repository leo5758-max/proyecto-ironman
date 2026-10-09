/**
 * Parser chico (regex, sin librería de markdown) para detectar bloques
 * ```mermaid```/```svg```/``` ``` dentro del texto de un mensaje de chat
 * (Mejora "documentos y diagramas renderizados") — los mensajes en este
 * hook solo llegan completos (`useConversation` arma `messages` recién con
 * `finalConversation`, nunca token a token), así que no hace falta
 * manejar un fence sin cerrar a mitad de stream.
 */
export type MessageSegment =
  | { type: "text"; content: string }
  | { type: "mermaid"; content: string }
  | { type: "svg"; content: string }
  | { type: "code"; content: string; lang?: string };

const FENCE_PATTERN = /```(\w+)?\n([\s\S]*?)```/g;

export function parseFencedBlocks(source: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let lastIndex = 0;
  FENCE_PATTERN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = FENCE_PATTERN.exec(source)) !== null) {
    const [full, lang, body] = match;
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: source.slice(lastIndex, match.index) });
    }

    const content = body.replace(/\n$/, "");
    const normalizedLang = lang?.toLowerCase();
    if (normalizedLang === "mermaid") {
      segments.push({ type: "mermaid", content });
    } else if (normalizedLang === "svg") {
      segments.push({ type: "svg", content });
    } else {
      segments.push({ type: "code", content, lang: normalizedLang });
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < source.length) {
    segments.push({ type: "text", content: source.slice(lastIndex) });
  }
  if (segments.length === 0) segments.push({ type: "text", content: source });

  return segments;
}
