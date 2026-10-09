# KAN-166 — CNC: límites de trabajo, cero de pieza y sondeo

| Campo | Valor |
|---|---|
| Épica | E25 — Máquinas de fabricación (láser, impresión 3D, CNC) |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | `safety-critical` con el husillo encendido |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Preparar y ejecutar un trabajo en la fresadora CNC con la ayuda del asistente.

## Por qué

Los movimientos actuales son relativos y sueltos. Una CNC necesita referencias: dónde está la pieza y hasta dónde puede moverse la herramienta.

## Alcance

- Límites de trabajo por software y aviso si un archivo los excede.
- Fijar el cero de pieza.
- Sondeo de altura de herramienta.
- Trabajo completo por streaming, igual que en [KAN-160](KAN-160-trabajos-de-laser.md).

## Criterio de aceptación

- [ ] Un archivo que excede los límites se rechaza antes de empezar.
- [ ] Un trabajo de prueba se completa en una máquina real.
