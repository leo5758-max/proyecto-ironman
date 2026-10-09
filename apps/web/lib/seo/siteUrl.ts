/**
 * URL pública canónica del sitio — necesaria para que `metadataBase`
 * (`app/layout.tsx`) resuelva `og:image`/`og:url` como URLs absolutas (los
 * crawlers de redes sociales no siguen bien URLs relativas). Mismo criterio
 * de fallback en cascada que `KAN_APP_URL` en `apps/gateway/src/server.ts`:
 * variable explícita primero, después el hostname que Vercel ya inyecta
 * solo en cada deploy, `localhost` como último recurso para dev.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
