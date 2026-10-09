# KAN-130 — Decidir cómo se sincronizan el nodo local y la versión en línea

| Campo | Valor |
|---|---|
| Épica | E22 — Sincronización entre el nodo local y la versión en línea |
| Tipo | Decisión |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-132](KAN-132-memoria-unica.md), [KAN-134](KAN-134-sincronizar-conversaciones-y-auditoria.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Que lo que haga sin internet aparezca en línea cuando vuelva la conexión, y al revés, sin perder ni duplicar nada.

## Por qué

Es la parte de la visión que no tiene nada construido: hoy la cola sin conexión reenvía mensajes pendientes, pero no existe sincronización de datos. Sin decidir las reglas primero, cada ticket inventaría las suyas.

## Alcance

- Qué se sincroniza y en qué sentido: memoria (ambos), conversaciones (ambos), auditoría (solo hacia la nube), configuración de dispositivos y política de seguridad (ver siguiente punto).
- **La política de seguridad nunca se relaja desde la nube sin una confirmación dada en el propio nodo.**
- Cómo se resuelven conflictos cuando un dato cambió en los dos lados.
- Identidad del nodo y de cada cambio, para no aplicar dos veces lo mismo.
- Qué pasa con las órdenes dadas en línea mientras el nodo estaba desconectado: caducan, no se ejecutan tarde.
- Qué datos no salen nunca del nodo, si el usuario así lo quiere.

## Criterio de aceptación

- [ ] Existe un ADR con las reglas y al menos dos alternativas descartadas con su motivo.
- [ ] Los tickets [KAN-132](KAN-132-memoria-unica.md), [KAN-133](KAN-133-cola-persistente.md) y [KAN-134](KAN-134-sincronizar-conversaciones-y-auditoria.md) pueden implementarse sin tomar decisiones nuevas.

## Notas

Una orden física que llega tarde es peligrosa: «enciende el láser» no debe ejecutarse dos horas después, cuando vuelve la conexión.
