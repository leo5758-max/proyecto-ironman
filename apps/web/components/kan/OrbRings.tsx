const RING_CENTER = 110;
const TICK_COUNT = 36;
const TICKS = Array.from({ length: TICK_COUNT }, (_, i) => i * (360 / TICK_COUNT));

/**
 * Anillos concéntricos del orb (estética "JARVIS real") — puramente
 * decorativo, montado solo detrás del orb grande (`size="lg"` en
 * `KANAvatar.tsx`). Tres `<g>` independientes rotando a velocidades muy
 * distintas (10s/25s/40s, ver `.kan-orb-ring-*` en globals.css) vía CSS
 * `animation` — nada de JS por frame. Los arcos usan `stroke-dasharray`
 * con huecos para no leerse como círculos completos; el anillo exterior
 * suma marcas de graduación tipo radar (mayores cada 3 — 12 en total,
 * como las horas de un reloj).
 *
 * Tamaño responsive (180px bajo el breakpoint `sm`, 220px desde ahí) — en
 * pantallas angostas el hamburguesa/sonido (esquinas superiores) quedan
 * más cerca del centro; el viewBox no cambia, el navegador escala el
 * dibujo entero solo con el `<svg>` más chico.
 */
export function OrbRings() {
  return (
    <svg
      viewBox="0 0 220 220"
      className="pointer-events-none absolute top-1/2 left-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 sm:h-[220px] sm:w-[220px]"
      aria-hidden="true"
    >
      <g style={{ transformOrigin: `${RING_CENTER}px ${RING_CENTER}px`, transformBox: "view-box" }} className="kan-orb-ring-1">
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={68}
          fill="none"
          stroke="var(--kan-accent)"
          strokeOpacity={0.4}
          strokeWidth={1.5}
          strokeDasharray="60 18 30 24 45 15"
          strokeLinecap="round"
        />
      </g>

      <g style={{ transformOrigin: `${RING_CENTER}px ${RING_CENTER}px`, transformBox: "view-box" }} className="kan-orb-ring-2">
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={88}
          fill="none"
          stroke="var(--kan-accent)"
          strokeOpacity={0.25}
          strokeWidth={1.5}
          strokeDasharray="40 20 70 30 20 20"
          strokeLinecap="round"
        />
      </g>

      <g style={{ transformOrigin: `${RING_CENTER}px ${RING_CENTER}px`, transformBox: "view-box" }} className="kan-orb-ring-3">
        <circle cx={RING_CENTER} cy={RING_CENTER} r={104} fill="none" stroke="var(--kan-accent)" strokeOpacity={0.15} strokeWidth={1} />
        {TICKS.map((angle, i) => {
          const major = i % 3 === 0;
          return (
            <line
              key={angle}
              x1={RING_CENTER}
              y1={RING_CENTER - 98}
              x2={RING_CENTER}
              y2={RING_CENTER - (major ? 112 : 108)}
              stroke="var(--kan-accent)"
              strokeOpacity={major ? 0.35 : 0.15}
              strokeWidth={major ? 1.2 : 0.8}
              transform={`rotate(${angle} ${RING_CENTER} ${RING_CENTER})`}
            />
          );
        })}
      </g>
    </svg>
  );
}
