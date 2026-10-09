import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KAN_ACCENT_INLINE_SCRIPT, KAN_THEME_MODE_INLINE_SCRIPT } from "@/lib/kan/theme";
import { getSiteUrl } from "@/lib/seo/siteUrl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_TITLE = "KAN — Asistente Inteligente";
const DEFAULT_DESCRIPTION = "KAN: un compañero inteligente para tu mundo digital y físico.";

// Fallback genérico — cualquier página pública sin su propio `metadata`
// (o sin alguno de estos campos puntuales) hereda esto. `metadataBase`
// habilita URLs absolutas para `og:image`/`og:url` en toda la app (sin
// esto, Next.js avisa en build y algunos crawlers no resuelven bien rutas
// relativas).
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: "KAN",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Sin flash del acento/modo default al recargar con una preferencia guardada — ver lib/kan/theme.ts. */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: KAN_ACCENT_INLINE_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: KAN_THEME_MODE_INLINE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink">
        {children}
      </body>
    </html>
  );
}
