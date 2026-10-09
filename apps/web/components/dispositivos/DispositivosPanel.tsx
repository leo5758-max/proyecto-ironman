"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PRIMARY_BUTTON_CLASSES } from "@/components/ui/formStyles";
import { DeviceList } from "@/components/dispositivos/DeviceList";

interface PairingCode {
  code: string;
  expiresAt: string;
}

/**
 * Overlay de Dispositivos del menú hamburguesa en /inicio (rediseño JARVIS)
 * — mismo contenido que `(shell)/dispositivos/page.tsx` (`DeviceList`
 * reusado sin cambios + tarjeta de vinculación), pero como client component:
 * `generatePairingCodeAction` (el server action que usa esa página) hace
 * `redirect("/dispositivos?code=...")`, que rompería el overlay (navegaría
 * fuera de /inicio). Acá se pide el mismo código vía `POST
 * /api/devices/pairing-code`, que devuelve JSON, y se muestra inline.
 */
export function DispositivosPanel() {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [pairing, setPairing] = useState<PairingCode | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.user?.userId) setCurrentUserId(data.user.userId);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/devices/pairing-code", { method: "POST" });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as PairingCode;
      setPairing(data);
    } catch {
      setError("No se pudo generar el código. Probá de nuevo.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <DeviceList currentUserId={currentUserId} />

      <Card className="fade-in flex flex-col gap-4">
        <h2 className="text-sm font-medium text-ink-muted">Vincular un nuevo equipo</h2>
        <p className="text-xs text-ink-faint">
          Generá un código, abrí la app de escritorio de KAN y escribilo ahí — tenés 10 minutos antes de que venza.
        </p>

        {pairing && (
          <div className="flex flex-col gap-1 rounded-md border border-accent/40 bg-accent/10 px-3 py-2">
            <span className="font-mono text-lg tracking-widest text-ink">{pairing.code}</span>
            <span className="text-xs text-ink-faint">Vence: {new Date(pairing.expiresAt).toLocaleTimeString()}</span>
          </div>
        )}
        {error && <p className="text-xs text-danger">{error}</p>}

        <button type="button" onClick={handleGenerate} disabled={generating} className={`self-start ${PRIMARY_BUTTON_CLASSES}`}>
          {generating ? "Generando…" : "Generar código"}
        </button>
      </Card>
    </div>
  );
}
