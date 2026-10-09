/**
 * Cuerpo del email de invitación (acceso multi-usuario a un Edge Agent
 * compartido — `POST /v1/agents/:edgeAgentId/grants` en `routes.ts`) —
 * mismo estilo que `welcomeEmail.ts`/`buildReportBody()`. El acceso ya está
 * concedido al momento de mandar este email (no hay nada que "aceptar"),
 * así que el único link es entrar a KAN.
 */
export function buildInviteEmailBody({ agentLabel, appUrl }: { agentLabel: string; appUrl: string }): { html: string; text: string } {
  const appLink = `${appUrl}/inicio`;

  const text = [
    `Te invitaron a acceder a ${agentLabel} en KAN.`,
    "Ya podés verlo y controlarlo — no hace falta aceptar nada, el acceso ya está concedido.",
    "",
    `Entrar a KAN: ${appLink}`,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; color: #111;">
      <h2>Te invitaron a acceder a ${escapeHtml(agentLabel)} en KAN</h2>
      <p>Ya podés verlo y controlarlo — no hace falta aceptar nada, el acceso ya está concedido.</p>
      <p><a href="${appLink}">Entrar a KAN</a></p>
    </div>
  `.trim();

  return { html, text };
}

export function inviteEmailSubject(agentLabel: string): string {
  return `Te invitaron a acceder a ${agentLabel} en KAN`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
