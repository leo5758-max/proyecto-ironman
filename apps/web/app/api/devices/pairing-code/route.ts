import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { buildDeviceUseCases } from "@/lib/devices/composition";

/**
 * Genera un código de pairing — mismo Use Case que `generatePairingCodeAction`
 * (`lib/devices/actions.ts`), pero devuelve `{code, expiresAt}` como JSON en
 * vez de `redirect("/dispositivos?code=...")`. La necesita
 * `DispositivosPanel.tsx` (overlay del hamburguesa en /inicio) para mostrar
 * el código inline sin navegar fuera del overlay.
 */
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { generatePairingCode } = await buildDeviceUseCases();
  const { code, expiresAt } = await generatePairingCode.execute(auth.user.userId);
  return NextResponse.json({ code, expiresAt });
}
