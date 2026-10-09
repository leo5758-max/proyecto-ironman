import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { resolveUserToken } from "@/lib/auth/resolveUserToken";
import { fetchAuditLog } from "@/lib/status/fetchAuditLog";

/**
 * Versión fetch-eable de `fetchAuditLog` (hoy solo se llamaba server-side
 * desde `(shell)/logs/page.tsx`) — la necesita `LogsPanel.tsx` (overlay de
 * Logs del hamburguesa en /inicio, rediseño JARVIS) para pedir el historial
 * sin ser un Server Component. Mismo contrato: `entries: undefined`
 * distingue "Gateway inalcanzable" de `[]` ("sin actividad todavía").
 */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const userToken = await resolveUserToken(request);
  const entries = await fetchAuditLog(userToken);
  return NextResponse.json({ entries: entries ?? null });
}
