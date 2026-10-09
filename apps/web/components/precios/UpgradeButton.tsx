"use client";

import { useState } from "react";
import Link from "next/link";
import { PRIMARY_BUTTON_CLASSES } from "@/components/ui/formStyles";

/**
 * CTA del plan Profesional en `PricingPage.tsx` (Server Component) — solo
 * este botón puntual es cliente, mismo criterio que `PushNotificationToggle`/
 * `ThemeAccentPicker` dentro de páginas mayormente server. Sin sesión, sigue
 * siendo un link a `/signup` como antes (no puede haber checkout sin cuenta);
 * con sesión, llama `POST /api/billing/checkout` y redirige a Stripe.
 */
export function UpgradeButton({ signedIn, label }: { signedIn: boolean; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <Link href="/signup" className={`w-full text-center ${PRIMARY_BUTTON_CLASSES}`}>
        {label}
      </Link>
    );
  }

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.url) {
        setError(data.error ?? "No se pudo iniciar el checkout.");
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
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => void handleClick()} disabled={loading} className={`w-full ${PRIMARY_BUTTON_CLASSES}`}>
        {loading ? "Redirigiendo…" : label}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
