import type { Metadata } from "next";
import { PricingPage } from "@/components/precios/PricingPage";
import { getCurrentUserCached } from "@/lib/auth/getCurrentUserCached";

const TITLE = "Precios — KAN";
const DESCRIPTION = "Planes de KAN: Maker gratis, Profesional y Industrial. Elegí el que acompaña tu crecimiento.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/precios", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/**
 * Precios pública en /precios — vive fuera de (shell) a propósito, sin
 * ShellChrome, mismo patrón que app/docs/page.tsx y app/page.tsx (landing).
 */
export default async function PreciosRoutePage() {
  const user = await getCurrentUserCached();
  return <PricingPage signedIn={Boolean(user)} />;
}
