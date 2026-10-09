import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PRIMARY_BUTTON_CLASSES, SECONDARY_BUTTON_CLASSES } from "@/components/ui/formStyles";
import { UpgradeButton } from "@/components/precios/UpgradeButton";

const CONTACT_EMAIL = "ventas@kan.dev";

interface Plan {
  id: string;
  name: string;
  price: string;
  priceNote?: string;
  features: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "maker",
    name: "Maker",
    price: "Gratis",
    features: [
      "1 dispositivo conectado",
      "Chat con KAN ilimitado",
      "Sensores en tiempo real",
      "Alertas básicas (máx. 5)",
      "Respaldos (máx. 3 snapshots)",
    ],
    cta: { label: "Empezar gratis", href: "/signup" },
  },
  {
    id: "profesional",
    name: "Profesional",
    price: "$19",
    priceNote: "/mes",
    features: [
      "Dispositivos ilimitados",
      "Multi-usuario (hasta 5 personas)",
      "Alertas ilimitadas + push al celular",
      "Respaldos ilimitados",
      "Reporte diario por email",
      "Soporte prioritario",
    ],
    cta: { label: "Empezar prueba gratis", href: "/signup" },
    highlighted: true,
  },
  {
    id: "industrial",
    name: "Industrial",
    price: "A consultar",
    features: [
      "Todo lo de Profesional",
      "Usuarios ilimitados",
      "API pública",
      "Soporte dedicado",
      "Instalación offline disponible",
    ],
    cta: { label: "Contactar", href: `mailto:${CONTACT_EMAIL}` },
  },
];

const COMPARISON_ROWS: Array<{ label: string; values: [string | boolean, string | boolean, string | boolean] }> = [
  { label: "Dispositivos conectados", values: ["1", "Ilimitados", "Ilimitados"] },
  { label: "Chat con KAN", values: ["Ilimitado", "Ilimitado", "Ilimitado"] },
  { label: "Sensores en tiempo real", values: [true, true, true] },
  { label: "Alertas", values: ["Máx. 5", "Ilimitadas + push", "Ilimitadas + push"] },
  { label: "Respaldos", values: ["Máx. 3 snapshots", "Ilimitados", "Ilimitados"] },
  { label: "Multi-usuario", values: [false, "Hasta 5 personas", "Ilimitados"] },
  { label: "Reporte diario por email", values: [false, true, true] },
  { label: "Soporte", values: ["Comunidad", "Prioritario", "Dedicado"] },
  { label: "API pública", values: [false, false, true] },
  { label: "Instalación offline", values: [false, false, true] },
];

function ComparisonCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-accent" aria-label="Incluido" />
    ) : (
      <Minus className="mx-auto h-4 w-4 text-ink-faint" aria-label="No incluido" />
    );
  }
  return <span className="text-sm text-ink">{value}</span>;
}

function PlanCard({ plan, signedIn }: { plan: Plan; signedIn: boolean }) {
  return (
    <Card
      padding="lg"
      className={`relative flex flex-col gap-6 ${
        plan.highlighted ? "glow-accent border-2 border-accent/60" : ""
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge>Más popular</Badge>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
        <p className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold text-ink">{plan.price}</span>
          {plan.priceNote && <span className="text-sm text-ink-faint">{plan.priceNote}</span>}
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-ink-muted">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      {plan.id === "profesional" ? (
        <UpgradeButton signedIn={signedIn} label={plan.cta.label} />
      ) : (
        <Link
          href={plan.cta.href}
          className={`${plan.highlighted ? PRIMARY_BUTTON_CLASSES : SECONDARY_BUTTON_CLASSES} w-full text-center`}
        >
          {plan.cta.label}
        </Link>
      )}
    </Card>
  );
}

/**
 * Precios público en /precios (sin sesión) — vive fuera de (shell), sin
 * ShellChrome, mismo patrón que LandingPage.tsx y DocsPage.tsx. `signedIn`
 * solo cambia el link del header ("Ir a KAN" vs "Iniciar sesión"), igual
 * que en DocsPage.
 */
export function PricingPage({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-4 sm:px-8">
        <Link href="/" className="text-lg font-medium tracking-tight text-accent">
          KAN
        </Link>
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/docs" className="text-sm text-ink-muted transition-colors hover:text-ink">
            Documentación
          </Link>
          <Link href={signedIn ? "/inicio" : "/login"} className={PRIMARY_BUTTON_CLASSES}>
            {signedIn ? "Ir a KAN" : "Iniciar sesión"}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12 sm:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="bg-gradient-accent bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
            Planes y precios
          </h1>
          <p className="max-w-xl text-sm text-ink-faint sm:text-base">
            Desde un primer Arduino en tu escritorio hasta una planta industrial completa — elegí el plan que
            acompaña tu crecimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} signedIn={signedIn} />
          ))}
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-center text-lg font-semibold text-ink">Comparación de funciones</h2>
          <Card padding="md" className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line/70">
                  <th className="py-3 pr-3 text-sm font-medium text-ink-muted">Función</th>
                  {PLANS.map((plan) => (
                    <th key={plan.id} className="px-3 py-3 text-center text-sm font-medium text-ink">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-line/40 last:border-0">
                    <td className="py-3 pr-3 text-sm text-ink-muted">{row.label}</td>
                    {row.values.map((value, i) => (
                      <td key={PLANS[i].id} className="px-3 py-3 text-center">
                        <ComparisonCell value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      </main>

      <footer className="border-t border-line/70 px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 text-sm text-ink-faint">
          <Link href="/docs" className="transition-colors hover:text-ink">
            Documentación
          </Link>
          <Link href="/precios" className="transition-colors hover:text-ink">
            Precios
          </Link>
        </div>
      </footer>
    </div>
  );
}
