# KAN-125 — Retirar los scripts sueltos del prototipo

| Campo | Valor |
|---|---|
| Épica | E21 — Nodo local sin internet |
| Tipo | Tarea |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | [KAN-113](KAN-113-voz-sin-internet.md), [KAN-122](KAN-122-conversacion-local-completa.md), [KAN-132](KAN-132-memoria-unica.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Tener una sola forma de usar el asistente local, no dos.

## Por qué

Cuando el nodo local cubra IA, voz y memoria, los scripts de `apps/jarvis-local` quedan duplicados.

## Alcance

- Comprobar que todo lo que hacían los scripts lo hace el nodo.
- Migrar los recuerdos de `memoria_jarvis.json` ([KAN-132](KAN-132-memoria-unica.md)).
- Archivar o borrar `apps/jarvis-local`, dejando nota en el registro de cambios.

## Criterio de aceptación

- [ ] No queda código duplicado de memoria, voz ni IA local.
- [ ] Ningún recuerdo se perdió en la migración.
