# KAN-133 — Cola sin conexión que sobreviva a un reinicio

| Campo | Valor |
|---|---|
| Épica | E22 — Sincronización entre el nodo local y la versión en línea |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Que nada de lo ocurrido sin internet se pierda, aunque se vaya la luz antes de que vuelva la conexión.

## Por qué

`CoreWebSocketClient` guarda hasta 200 mensajes pendientes, pero en memoria: si el proceso se reinicia, se pierden. Al llenarse descarta los más viejos.

## Alcance

- Guardar la cola en disco.
- Entrega sin duplicados al reconectar, con identificador por mensaje.
- Política explícita cuando la cola se llena: qué se conserva y qué se resume.
- Avisar al usuario si se descartó algo.

## Criterio de aceptación

- [ ] Con el nodo desconectado: se generan eventos, se reinicia el nodo, se reconecta, y todos los eventos llegan una sola vez.

## Notas

Archivo: `packages/edge-agent-core/src/infra/CoreWebSocketClient.ts`.
