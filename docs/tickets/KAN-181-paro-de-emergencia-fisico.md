# KAN-181 — Paro de emergencia físico y universal

| Campo | Valor |
|---|---|
| Épica | E27 — Seguridad y validación con hardware real |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | `safety-critical` |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Tener un botón rojo que lo detenga todo, funcione o no el asistente.

## Por qué

Las capacidades de paro actuales dependen de que el software, la red y el firmware de cada máquina respondan.

## Alcance

- Botón físico que corte la energía de los actuadores, independiente de KAN.
- KAN detecta que se accionó, detiene todas las tareas y no reanuda sin rearme manual.
- Orden de voz «alto» que dispare todas las capacidades de paro por software, sin confirmación.
- Esquema eléctrico de referencia.

## Criterio de aceptación

- [ ] Con el nodo apagado, el botón detiene las máquinas.
- [ ] Tras accionarlo, ninguna tarea se reanuda sola.
