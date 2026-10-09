"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SECONDARY_BUTTON_CLASSES } from "@/components/ui/formStyles";

interface BillingStatus {
  plan: "maker" | "pro";
  hasSubscription: boolean;
}

const PLAN_LABEL: Record<BillingStatus["plan"], string> = { maker: "Maker (gratis)", pro: "Profesional" };

/**
 * Sección "Tu plan" de Configuración — fetch a `/api/billing/status`
 * (lectura anon+RLS de `user_subscriptions`, sincronizada por el webhook de
 * Stripe en `apps/gateway`). "Gestionar suscripción" abre el Customer
 * Portal de Stripe (`/api/billing/portal`) — solo si ya existe una
 * suscripción real; sin una, ofrece ir a ver los planes en su lugar.
 */
export function PlanSection() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/billing/status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setStatus(data as BillingStatus);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleManage() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.url) {
        setError(data.error ?? "No se pudo abrir el portal.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("KAN no está disponible en este momento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="fade-in flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        Tu plan
      </h2>

      {!status ? (
        <p className="text-xs text-ink-faint">Cargando…</p>
      ) : (
        <>
          <p className="text-sm text-ink">
            Estás en el plan <span className="font-medium text-accent">{PLAN_LABEL[status.plan]}</span>.
          </p>

          {status.hasSubscription ? (
            <button
              type="button"
              onClick={() => void handleManage()}
              disabled={loading}
              className={`self-start ${SECONDARY_BUTTON_CLASSES}`}
            >
              {loading ? "Abriendo…" : "Gestionar suscripción"}
            </button>
          ) : (
            <Link href="/precios" className={`self-start ${SECONDARY_BUTTON_CLASSES}`}>
              Ver planes
            </Link>
          )}

          {error && <p className="text-xs text-danger">{error}</p>}
        </>
      )}
    </Card>
  );
}
