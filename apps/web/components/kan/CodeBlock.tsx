"use client";

import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

// Solo los lenguajes de "prism/light" que hacen falta (no el paquete
// Prism completo) — mantiene el bundle chico. Quien importa este archivo
// ya lo hace vía `next/dynamic({ ssr: false })`, así que ni esto ni
// `react-syntax-highlighter` pesan en el bundle inicial de /inicio.
const LANGUAGE_ALIASES: Record<string, [string, unknown]> = {
  bash: ["bash", bash],
  sh: ["bash", bash],
  shell: ["bash", bash],
  css: ["css", css],
  javascript: ["javascript", javascript],
  js: ["javascript", javascript],
  json: ["json", json],
  jsx: ["jsx", jsx],
  html: ["markup", markup],
  xml: ["markup", markup],
  python: ["python", python],
  py: ["python", python],
  sql: ["sql", sql],
  tsx: ["tsx", tsx],
  typescript: ["typescript", typescript],
  ts: ["typescript", typescript],
  yaml: ["yaml", yaml],
  yml: ["yaml", yaml],
};

for (const [name, language] of Object.values(LANGUAGE_ALIASES)) {
  SyntaxHighlighter.registerLanguage(name, language);
}

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const registered = lang ? LANGUAGE_ALIASES[lang.toLowerCase()] : undefined;

  return (
    <SyntaxHighlighter
      language={registered?.[0]}
      style={vscDarkPlus}
      customStyle={{ margin: 0, background: "transparent", fontSize: "0.8rem", padding: "0.75rem" }}
      wrapLongLines
    >
      {code}
    </SyntaxHighlighter>
  );
}
