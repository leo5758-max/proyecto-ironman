import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { buildMemoryUseCases } from "@/lib/memory/composition";

/**
 * Add/remove de memoria — mismos Use Cases que `addMemoryAction`/
 * `removeMemoryAction` (`lib/memory/actions.ts`), pero devuelve JSON en vez
 * de `redirect("/configuracion")`. La necesita `ConfiguracionPanel.tsx`
 * (overlay del hamburguesa en /inicio) para no navegar fuera del overlay.
 */
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as { category?: string; key?: string; value?: string };
  const category = String(body.category ?? "").trim();
  const key = String(body.key ?? "").trim();
  const value = String(body.value ?? "").trim();
  if (!category || !key || !value) return NextResponse.json({ error: "category, key y value son requeridos." }, { status: 400 });

  const { setMemory } = await buildMemoryUseCases();
  await setMemory.execute(auth.user.userId, category, key, value);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as { category?: string; key?: string };
  const category = String(body.category ?? "").trim();
  const key = String(body.key ?? "").trim();
  if (!category || !key) return NextResponse.json({ error: "category y key son requeridos." }, { status: 400 });

  const { removeMemory } = await buildMemoryUseCases();
  await removeMemory.execute(auth.user.userId, category, key);
  return NextResponse.json({ ok: true });
}
