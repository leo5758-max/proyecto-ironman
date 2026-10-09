import type { Metadata } from "next";
import { DocsPage } from "@/components/docs/DocsPage";
import { getCurrentUserCached } from "@/lib/auth/getCurrentUserCached";

const TITLE = "Documentación — KAN";
const DESCRIPTION = "Guía para usar KAN: primeros pasos, qué podés hacer y preguntas frecuentes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/docs", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/**
 * Documentación pública en /docs — vive fuera de (shell) a propósito, sin
 * ShellChrome, misma idea que app/page.tsx (landing). A diferencia de la
 * landing, acá no se redirige a un usuario con sesión: la página tiene que
 * quedar accesible siempre, solo cambia el link "Ir a KAN" del header.
 */
export default async function DocsRoutePage() {
  const user = await getCurrentUserCached();
  return <DocsPage signedIn={Boolean(user)} />;
}
