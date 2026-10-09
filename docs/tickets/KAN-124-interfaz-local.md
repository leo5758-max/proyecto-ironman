# KAN-124 — Interfaz local en la red del taller

| Campo | Valor |
|---|---|
| Épica | E21 — Nodo local sin internet |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | [KAN-122](KAN-122-conversacion-local-completa.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Abrir el chat y el panel desde el teléfono o la laptop dentro del taller aunque no haya internet.

## Por qué

La interfaz web está pensada para Vercel. Sin internet, el nodo solo se puede usar por voz.

## Alcance

- Servir una versión de `apps/web` desde el propio nodo.
- Dirección fácil de recordar en la red local (mDNS, por ejemplo `kan.local`).
- Pantalla para dar las confirmaciones de [KAN-120](KAN-120-agente-sin-pantalla.md) desde el teléfono.

## Criterio de aceptación

- [ ] Con el router sin salida a internet, el teléfono abre el chat del nodo y puede mandar una orden.
