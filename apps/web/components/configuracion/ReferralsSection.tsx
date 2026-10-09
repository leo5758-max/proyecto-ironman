"use client";

import { useState, useSyncExternalStore } from "react";
import { Copy, Check } from "lucide-react";
import { INPUT_CLASSES, SECONDARY_BUTTON_CLASSES } from "@/components/ui/formStyles";

// El origin no cambia durante la vida de la página — no hace falta
// suscribirse a nada real, solo darle a useSyncExternalStore una forma de
// leer "" en el servidor/primer render y el valor real recién en el
// navegador, sin el setState-en-efecto que dispara cascading renders (mismo
// criterio que ThemeAccentPicker/ThemeModeToggle con localStorage).
function subscribe() {
  return () => {};
}
function getServerOrigin() {
  return "";
}
function getClientOrigin() {
  return window.location.origin;
}

/**
 * Sección "Referidos" de /configuracion — el código y el conteo ya vienen
 * resueltos del servidor (getReferralSummary.ts, anon+RLS); acá solo arma el
 * link para compartir y el botón de copiar. `window.location.origin` en vez
 * de una env var de sitio: siempre correcto sin importar el deploy, y esto
 * es un componente cliente de todos modos (necesita el Clipboard API).
 */
export function ReferralsSection({ referralCode, invitedCount }: { referralCode: string | null; invitedCount: number }) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(subscribe, getClientOrigin, getServerOrigin);
  const shareLink = referralCode && origin ? `${origin}/signup?ref=${referralCode}` : "";

  async function handleCopy() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API no disponible (contexto no seguro, permisos, etc.) — el link sigue visible para copiar a mano.
    }
  }

  if (!referralCode) {
    return <p className="text-xs text-ink-faint">Tu código de referido todavía se está generando — recargá en un momento.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-ink-faint">
        Invitá amigos a KAN — cuando se registren con tu link, ambos reciben 1 mes gratis del plan Profesional.
      </p>
      <div className="flex gap-2">
        <input readOnly value={shareLink} className={`flex-1 ${INPUT_CLASSES}`} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" onClick={() => void handleCopy()} className={SECONDARY_BUTTON_CLASSES}>
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <p className="text-sm text-ink">
        Invitaste a <span className="font-medium text-accent">{invitedCount}</span>{" "}
        {invitedCount === 1 ? "amigo" : "amigos"}.
      </p>
    </div>
  );
}
