# KAN-136 — Prueba de punta a punta: la versión en línea controla un dispositivo del nodo

| Campo | Valor |
|---|---|
| Épica | E22 — Sincronización entre el nodo local y la versión en línea |
| Tipo | Tarea |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | [KAN-120](KAN-120-agente-sin-pantalla.md), [KAN-131](KAN-131-vincular-nodo-con-cuenta.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | Según el dispositivo de prueba |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Desde mi teléfono, fuera de casa, pedirle algo al asistente y que ocurra en el taller.

## Por qué

El canal ya existe (WebSocket saliente del agente al Gateway), pero solo se ha usado con la app de escritorio. Falta demostrarlo con el nodo en una Raspberry Pi y una red doméstica real.

## Alcance

- Nodo en Raspberry Pi vinculado a la cuenta, Gateway desplegado en la nube.
- Orden desde la web y desde la app móvil por datos celulares.
- Medir el tiempo entre la orden y la acción.
- Probar cortes: se cae el internet a mitad de una tarea, se reinicia el router.

## Criterio de aceptación

- [ ] Una orden de solo lectura dada desde fuera de casa devuelve el dato real.
- [ ] Tras un corte de internet, el nodo se reconecta solo.
- [ ] No hace falta abrir ningún puerto en el router.
