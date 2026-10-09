import type { KANActivity } from "@/lib/kan/useKANState";
import { OrbRings } from "@/components/kan/OrbRings";

const CORE_ANIMATION: Record<KANActivity, string> = {
  idle: "kan-core-idle",
  listening: "kan-core-listening",
  thinking: "kan-core-thinking",
  speaking: "kan-core-speaking",
};

const SIZE_CLASSES = {
  lg: "h-[120px] w-[120px]",
  sm: "h-16 w-16",
} as const;

const GLOW_OPACITY: Record<KANActivity, number> = {
  idle: 0.35,
  listening: 0.55,
  thinking: 0.4,
  speaking: 0.55,
};

/**
 * Avatar de KAN — círculo con gradiente + glow, sin ornamento adentro
 * ("KAN" va como label debajo, texto normal, no mono — apagado en el
 * avatar chico de header vía `showLabel`, a esa escala un label de texto
 * se ve amontonado). Estética "JARVIS real": el orb grande (`size="lg"`)
 * suma `OrbRings` — 3 anillos concéntricos rotando detrás, puramente
 * decorativos — el orb chico de header no los lleva, se verían amontonados
 * a 64px.
 *
 * `activity` sigue moviendo el mismo glow/pulso de siempre (`.kan-core-*`,
 * globals.css).
 */
export function KANAvatar({
  size = "lg",
  activity = "idle",
  className = "",
  showLabel = true,
  flare = false,
}: {
  size?: "lg" | "sm";
  activity?: KANActivity;
  className?: string;
  showLabel?: boolean;
  /** Anillo que se expande y desvanece una vez (reusa `.animate-glow-pulse`, ya existente) — para momentos puntuales como el wake word. Default `false` en todos los usos existentes, sin cambios visuales ahí. */
  flare?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        role="img"
        aria-label={`KAN — ${ACTIVITY_LABEL[activity]}`}
        className={`relative flex shrink-0 items-center justify-center ${SIZE_CLASSES[size]}`}
      >
        {/* Anillos concéntricos tipo radar — solo en el orb grande, a esta escala (64px) no entrarían sin verse amontonados. */}
        {size === "lg" && <OrbRings />}
        {/* Glow suave detrás del círculo — una sola capa, sin halos/nebulosa apiladas. */}
        <span
          aria-hidden="true"
          className="absolute -inset-6 rounded-full blur-2xl transition-opacity duration-base"
          style={{
            background: "radial-gradient(circle, var(--color-accent), transparent 70%)",
            opacity: GLOW_OPACITY[activity],
          }}
        />
        {/*
         * Respiración "viva" — solo en reposo: una segunda capa de glow con
         * un período distinto al de `kan-core-idle` (3.2s vs 7.4s acá) para
         * que la superposición de los dos ciclos casi nunca se sienta como
         * un loop perfecto y repetitivo. Puramente decorativa, no reemplaza
         * la animación del círculo — se apaga sola en cualquier otro estado.
         */}
        {activity === "idle" && (
          <span
            aria-hidden="true"
            className="kan-idle-shimmer absolute -inset-3 rounded-full blur-xl"
            style={{ background: "radial-gradient(circle, var(--color-accent), transparent 65%)" }}
          />
        )}
        {/* Círculo — gradiente sólido del acento, sin vidrio ni texto adentro. */}
        <span
          aria-hidden="true"
          className={`h-full w-full rounded-full ${CORE_ANIMATION[activity]}`}
          style={{
            background: "var(--gradient-accent)",
            boxShadow: "var(--glow-accent)",
          }}
        />
        {flare && <span aria-hidden="true" className="kan-wake-flare pointer-events-none absolute inset-0 rounded-full" />}
      </div>
      {showLabel && <span className="text-sm font-medium tracking-wide text-ink-muted">KAN</span>}
    </div>
  );
}

const ACTIVITY_LABEL: Record<KANActivity, string> = {
  idle: "en reposo",
  listening: "escuchando",
  thinking: "pensando",
  speaking: "hablando",
};
