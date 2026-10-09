# KAN-135 — Detección de conexión y aviso del modo actual

| Campo | Valor |
|---|---|
| Épica | E22 — Sincronización entre el nodo local y la versión en línea |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | [KAN-111](KAN-111-enrutador-nube-local.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Saber en todo momento si el asistente está trabajando en línea o por su cuenta, porque sin conexión sabe menos y puede hacer menos.

## Por qué

El cambio de modo altera la calidad de las respuestas y qué herramientas están permitidas. Si ocurre en silencio, el usuario no entiende por qué el asistente se comporta distinto.

## Alcance

- Detección de conexión en el nodo, sin depender de que falle un mensaje.
- Aviso al cambiar de modo, por voz y en la interfaz.
- Indicador permanente del modo actual.
- El asistente explica, cuando se le pide algo no disponible sin conexión, que es por eso.

## Criterio de aceptación

- [ ] Al desconectar el router, en menos de 30 segundos el nodo anuncia que pasó a modo sin conexión.
- [ ] Al reconectar, lo anuncia y sincroniza.
