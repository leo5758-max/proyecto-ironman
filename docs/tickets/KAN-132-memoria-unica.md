# KAN-132 — Memoria única con copia local

| Campo | Valor |
|---|---|
| Épica | E22 — Sincronización entre el nodo local y la versión en línea |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | [KAN-121](KAN-121-gateway-modo-local.md), [KAN-130](KAN-130-adr-sincronizacion.md) |
| Desbloquea | [KAN-125](KAN-125-retirar-scripts-prototipo.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Que el asistente recuerde lo mismo esté yo en línea o sin conexión.

## Por qué

Hoy hay dos memorias que no se conocen: la tabla `memories` de Supabase y el archivo `memoria_jarvis.json` del prototipo.

## Alcance

- Adaptador local de `MemoryStorePort`.
- Sincronización en ambos sentidos según las reglas de [KAN-130](KAN-130-adr-sincronizacion.md).
- Importador de un solo uso para `memoria_jarvis.json`.
- Las herramientas de memoria del asistente (`kan_set_memory`, `kan_remove_memory`) funcionan igual en ambos modos.

## Criterio de aceptación

- [ ] Un dato guardado sin conexión aparece en línea al reconectar.
- [ ] Un dato guardado en línea está disponible en el nodo en su siguiente sincronización.
- [ ] Los recuerdos del prototipo aparecen en la memoria unificada.
- [ ] Borrar un recuerdo en un lado lo borra en el otro.
