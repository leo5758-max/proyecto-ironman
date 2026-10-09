import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PRIMARY_BUTTON_CLASSES } from "@/components/ui/formStyles";

export const metadata: Metadata = {
  title: "¡Listo! — KAN",
  robots: { index: false },
};

/**
 * Confirmación post-checkout de Stripe (`success_url` en
 * `/api/billing/checkout`) — pública (ver `PUBLIC_PAGE_PATHS` en
 * `proxy.ts`): alguien puede llegar acá recién saliendo de Stripe, antes de
 * que la sesión de KAN necesariamente esté fresca, no vale la pena arriesgar
 * un redirect a /login en medio del flujo de pago. El plan real ya está
 * confirmado por el webhook de `apps/gateway`, no por esta página — acá solo
 * se informa, no se verifica nada.
 */
export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card padding="lg" className="fade-in w-full max-w-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent text-white">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-ink">¡Listo!</h1>
        <p className="mt-2 text-sm text-ink-faint">
          Tu prueba de 14 días del plan Profesional ya arrancó. Podés gestionar tu suscripción cuando quieras desde
          Configuración.
        </p>
        <Link href="/inicio" className={`mt-7 block w-full ${PRIMARY_BUTTON_CLASSES}`}>
          Ir a KAN
        </Link>
      </Card>
    </div>
  );
}
