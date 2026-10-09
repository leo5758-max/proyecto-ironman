import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { getCurrentUserCached } from "@/lib/auth/getCurrentUserCached";

const TITLE = "KAN — Controlá tu hardware con inteligencia artificial";
const DESCRIPTION =
  "Conectá Arduino, ESP32 o Raspberry Pi Pico y controlalos por voz o chat con IA. Alertas, automatizaciones y respaldos, sin escribir código.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/**
 * Raíz pública — vive fuera de (shell) a propósito: ninguna ruta dentro de
 * un route group puede saltarse el layout de ese grupo (ShellChrome), así
 * que la landing sin sesión necesita vivir afuera. `getCurrentUserCached()`
 * (nunca `requireUser`, que es para Route Handlers y devuelve 401 — acá
 * "sin sesión" es el caso normal de un visitante nuevo, no un error).
 */
export default async function RootPage() {
  const user = await getCurrentUserCached();
  if (user) redirect("/inicio");
  return <LandingPage />;
}
