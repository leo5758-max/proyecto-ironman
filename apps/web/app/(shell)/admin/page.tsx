import { redirect } from "next/navigation";
import { getCurrentUserCached } from "@/lib/auth/getCurrentUserCached";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin/isAdmin";
import { AdminClient } from "@/components/admin/AdminClient";

/**
 * Defensa en profundidad — proxy.ts ya redirige a quien no tenga fila en
 * `admin_users` antes de que este Server Component llegue a renderizar, pero
 * repetimos el chequeo acá (mismo criterio que el resto de las páginas del
 * shell con `getCurrentUserCached`).
 */
export default async function AdminPage() {
  const user = await getCurrentUserCached();
  if (!user || !(await isAdmin(await createSupabaseServerClient(), user.userId))) {
    redirect("/inicio");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Administración</h1>
        <p className="text-sm text-ink-faint">Usuarios, suscripciones y métricas — solo lectura.</p>
      </div>
      <AdminClient />
    </div>
  );
}
