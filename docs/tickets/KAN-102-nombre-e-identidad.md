# KAN-102 — Decidir el nombre y la identidad del asistente

| Campo | Valor |
|---|---|
| Épica | E19 — Unificación y orden del repositorio |
| Tipo | Decisión |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-114](KAN-114-palabra-de-activacion-local.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Hablarle a un solo asistente, con un solo nombre y una sola forma de ser, lo use desde el navegador, el teléfono o el taller sin internet.

## Por qué

Hoy hay dos identidades. La plataforma se presenta como KAN, con palabra de activación «KAN» y personalidad configurable por usuario. El prototipo se presenta como JARVIS, con un texto de personalidad fijo centrado en construir un traje de Iron Man.

## Alcance

- Elegir una opción: (a) KAN en todas partes; (b) JARVIS en todas partes; (c) KAN como plataforma con una personalidad «Jarvis» seleccionable.
- Decidir si el contexto del traje de Iron Man es parte de la personalidad base o un proyecto más guardado en memoria.
- Dejar la decisión escrita como ADR.

## Criterio de aceptación

- [ ] Existe un ADR con la opción elegida y su motivo.
- [ ] Quedan listados los lugares que hay que cambiar: palabra de activación (`apps/web/lib/kan/useWakeWord.ts`), personalidad (`PersonalityContextPort`), textos del prototipo.

## Notas

Considerar que «Jarvis» y «J.A.R.V.I.S.» son nombres de Marvel. Para uso personal no importa; si el proyecto se publica o se vende, conviene un nombre propio.
