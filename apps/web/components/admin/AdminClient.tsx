"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface AdminUserRow {
  userId: string;
  email: string;
  displayName: string | null;
  plan: "maker" | "pro";
  createdAt: string;
  lastSignInAt: string | null;
}

interface AdminSubscriptionRow {
  userId: string;
  email: string;
  status: string | null;
  currentPeriodEnd: string | null;
}

interface AdminOverview {
  users: AdminUserRow[];
  subscriptions: AdminSubscriptionRow[];
  metrics: { totalUsers: number; activeLast30Days: number; makerToProConversionRate: number };
}

const TABS = [
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "suscripciones", label: "Suscripciones", icon: CreditCard },
  { id: "metricas", label: "Métricas", icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]["id"];

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
}

export function AdminClient() {
  const [tab, setTab] = useState<TabId>("usuarios");
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/overview", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => undefined))?.error ?? "No se pudo cargar.");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json as AdminOverview);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "No se pudo cargar.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2" role="tablist" aria-label="Secciones de administración">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`hud-button flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-fast ${
              tab === id ? "bg-surface-3 text-ink" : "text-ink-muted hover:bg-surface-3 hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <Card className="text-sm text-danger">
          {error}
        </Card>
      )}

      {!data && !error && <Card className="text-sm text-ink-faint">Cargando…</Card>}

      {data && tab === "usuarios" && <UsersTable rows={data.users} />}
      {data && tab === "suscripciones" && <SubscriptionsTable rows={data.subscriptions} />}
      {data && tab === "metricas" && <MetricsCards metrics={data.metrics} />}
    </div>
  );
}

function UsersTable({ rows }: { rows: AdminUserRow[] }) {
  if (rows.length === 0) return <Card className="text-sm text-ink-faint">Sin usuarios todavía.</Card>;
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">Usuario</th>
            <th className="px-4 py-3 font-medium">Plan</th>
            <th className="px-4 py-3 font-medium">Registro</th>
            <th className="px-4 py-3 font-medium">Último acceso</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.userId} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <div className="text-ink">{row.displayName || row.email}</div>
                {row.displayName && <div className="text-xs text-ink-faint">{row.email}</div>}
              </td>
              <td className="px-4 py-3">
                <span className={row.plan === "pro" ? "text-accent" : "text-ink-muted"}>
                  {row.plan === "pro" ? "Profesional" : "Maker"}
                </span>
              </td>
              <td className="px-4 py-3 text-ink-muted">{formatDate(row.createdAt)}</td>
              <td className="px-4 py-3 text-ink-muted">{formatDate(row.lastSignInAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function SubscriptionsTable({ rows }: { rows: AdminSubscriptionRow[] }) {
  if (rows.length === 0) return <Card className="text-sm text-ink-faint">Sin suscripciones Pro todavía.</Card>;
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">Usuario</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Renovación</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.userId} className="border-b border-line last:border-0">
              <td className="px-4 py-3 text-ink">{row.email}</td>
              <td className="px-4 py-3 text-ink-muted">{row.status ?? "—"}</td>
              <td className="px-4 py-3 text-ink-muted">{formatDate(row.currentPeriodEnd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function MetricsCards({ metrics }: { metrics: AdminOverview["metrics"] }) {
  const items = [
    { label: "Usuarios totales", value: String(metrics.totalUsers) },
    { label: "Activos (últimos 30 días)", value: String(metrics.activeLast30Days) },
    { label: "Conversión Maker → Pro", value: `${(metrics.makerToProConversionRate * 100).toFixed(1)}%` },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="flex flex-col gap-1">
          <span className="text-xs text-ink-faint">{item.label}</span>
          <span className="text-2xl font-semibold text-ink">{item.value}</span>
        </Card>
      ))}
    </div>
  );
}
