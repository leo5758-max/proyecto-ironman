# KAN-172 — Webhooks y flujos de n8n

| Campo | Valor |
|---|---|
| Épica | E26 — Control del mundo digital |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | `reversible` por defecto, configurable por flujo |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Que el asistente dispare mis automatizaciones existentes y que ellas puedan avisarle de eventos.

## Por qué

Conectar con un orquestador de flujos da acceso a cientos de servicios sin escribir un plugin para cada uno.

## Alcance

- Disparar un flujo por webhook desde el asistente, con destinos configurados.
- Recibir eventos entrantes autenticados y convertirlos en notificaciones o tareas.
- Clasificar la severidad por flujo.

## Criterio de aceptación

- [ ] «Corre el flujo de respaldo» lo dispara y devuelve el resultado.
- [ ] Un evento entrante sin firma válida se rechaza.
