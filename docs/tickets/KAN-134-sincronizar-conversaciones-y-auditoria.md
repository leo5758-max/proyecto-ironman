# KAN-134 — Sincronizar conversaciones y auditoría

| Campo | Valor |
|---|---|
| Épica | E22 — Sincronización entre el nodo local y la versión en línea |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | [KAN-130](KAN-130-adr-sincronizacion.md), [KAN-121](KAN-121-gateway-modo-local.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Ver en línea lo que hablé con el asistente sin conexión, y tener un solo registro de todo lo que se hizo sobre mis máquinas.

## Por qué

Sin esto, las conversaciones y acciones hechas sin conexión solo existen en el nodo.

## Alcance

- Subir las conversaciones locales al reconectar, marcadas como hechas sin conexión.
- Subir la auditoría local; es un registro que solo crece y nunca se edita.
- Bajar al nodo las conversaciones recientes, para poder continuar una por voz.

## Criterio de aceptación

- [ ] Una conversación hecha sin conexión aparece en el historial web tras reconectar.
- [ ] La auditoría en línea incluye las acciones físicas ejecutadas sin conexión, con su hora real.
