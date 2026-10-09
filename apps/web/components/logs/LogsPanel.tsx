"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportLogsButton } from "@/components/logs/ExportLogsButton";
import { LogsExplorer } from "@/components/logs/LogsExplorer";
import type { RawAuditEntry } from "@/lib/status/translateAuditEntry";

type LoadState = "loading" | "ready";

/**
 * Overlay de Logs del menú hamburguesa en /inicio (rediseño JARVIS) — mismo
 * contenido que `(shell)/logs/page.tsx`, pero pedido vía `GET /api/logs`
 * (nuevo) en vez de `fetchAuditLog` server-side, porque este panel es un
 * client component (se monta bajo demanda dentro de `SectionOverlay`, no
 * puede ser un Server Component async).
 */
export function LogsPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [entries, setEntries] = useState<RawAuditEntry[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/logs", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { entries: undefined }))
      .then((data: { entries: RawAuditEntry[] | null }) => {
        if (!cancelled) {
          setEntries(data.entries ?? undefined);
          setState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEntries(undefined);
          setState("ready");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-faint">Historial de actividad y auditoría de KAN.</p>
        {entries && entries.length > 0 && <ExportLogsButton entries={entries} />}
      </div>

      {state === "loading" ? (
        <Card className="fade-in">
          <p className="text-sm text-ink-faint">Cargando…</p>
        </Card>
      ) : entries === undefined ? (
        <Card className="fade-in">
          <p className="text-sm text-ink-faint">No se pudo conectar con KAN — el historial no está disponible en este momento.</p>
        </Card>
      ) : entries.length === 0 ? (
        <Card className="fade-in">
          <EmptyState icon={Activity} title="Sin actividad todavía" description="Acá vas a ver el historial de lo que KAN hizo y por qué." />
        </Card>
      ) : (
        <LogsExplorer entries={entries} />
      )}
    </div>
  );
}
