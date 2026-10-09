# KAN-167 — «Fabrica esta pieza»: plan de varios pasos

| Campo | Valor |
|---|---|
| Épica | E25 — Máquinas de fabricación (láser, impresión 3D, CNC) |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | [KAN-160](KAN-160-trabajos-de-laser.md), [KAN-163](KAN-163-laminar-stl.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | Hereda la de cada paso |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Pedir una pieza y que el asistente planee todo: revisar el modelo, elegir máquina y material, estimar tiempo, programar el trabajo y avisar al terminar.

## Por qué

Es el ejemplo de referencia de la visión de producto (`VISION_PRODUCT_v0.2.md` §4.7) y el punto más ambicioso de la hoja de ruta. Hoy cada turno ejecuta herramientas sueltas, sin un plan con pasos y aprobaciones.

## Alcance

- Plan con pasos encadenados y puntos de aprobación.
- Cola de trabajos de fabricación.
- Uso de la memoria: materiales disponibles, preferencias, horarios.
- Notificación al terminar o al fallar.

## Criterio de aceptación

- [ ] De un STL a una pieza impresa con una sola petición y las confirmaciones necesarias.
- [ ] Si un paso falla, el plan se detiene y lo explica.
