# KAN-105 — Poner al día la documentación desfasada

| Campo | Valor |
|---|---|
| Épica | E19 — Unificación y orden del repositorio |
| Tipo | Tarea |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Leer la documentación y encontrar el estado real del proyecto.

## Por qué

Varios documentos describen como «planeado» lo que ya existe. `docs/01` dice que no hay app móvil, ni base de datos, ni dispositivos reales; `docs/02` lista como planeados plugins que ya están construidos; `docs/09` y `docs/10` reflejan el cierre de v0.1, anterior a casi todos los plugins.

## Alcance

- Actualizar `docs/01`, `docs/02`, `docs/05`, `docs/06`, `docs/09` y `docs/10` contra el código actual.
- Añadir `apps/jarvis-local` y el nodo local a `docs/02`.
- Marcar en `docs/10` qué tareas de las 50 originales están cerradas.

## Criterio de aceptación

- [ ] Ningún documento marca como planeado algo que existe en el repositorio.
