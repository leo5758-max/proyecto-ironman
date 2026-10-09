/**
 * Cuerpo del email de bienvenida (Database Webhook de Supabase sobre
 * `auth.users`, ver `apps/gateway/src/http/authWebhookRoutes.ts`) — mismo
 * estilo que `buildReportBody()` en `DailyReportService.ts` (HTML inline,
 * sin CSS complejo, `escapeHtml()` sobre cualquier texto que no controlamos
 * nosotros, ej. el nombre del usuario).
 */
export function buildWelcomeEmailBody({ name, appUrl }: { name: string; appUrl: string }): { html: string; text: string } {
  const docsLink = `${appUrl}/docs`;
  const appLink = `${appUrl}/inicio`;

  const text = [
    `¡Bienvenido a KAN, ${name}!`,
    "",
    "KAN es tu asistente de hardware con inteligencia artificial — conectá un Arduino, ESP32 o Raspberry Pi Pico y controlalo por voz o chat, sin escribir código.",
    "",
    `Primeros pasos: ${docsLink}`,
    `Entrar a KAN: ${appLink}`,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; color: #111;">
      <h2>¡Bienvenido a KAN, ${escapeHtml(name)}!</h2>
      <p>KAN es tu asistente de hardware con inteligencia artificial — conectá un Arduino, ESP32 o Raspberry Pi Pico
      y controlalo por voz o chat, sin escribir código.</p>
      <p><a href="${docsLink}">Ver primeros pasos</a></p>
      <p><a href="${appLink}">Entrar a KAN</a></p>
    </div>
  `.trim();

  return { html, text };
}

export function welcomeEmailSubject(name: string): string {
  return `Bienvenido a KAN, ${name}`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
