# KAN-111 — Enrutador de modelos que elige entre nube y local

| Campo | Valor |
|---|---|
| Épica | E20 — Cerebro y voz locales |
| Tipo | Feature |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | [KAN-110](KAN-110-proveedor-ia-local-ollama.md) |
| Desbloquea | [KAN-135](KAN-135-deteccion-de-modo.md), [KAN-180](KAN-180-herramientas-permitidas-sin-conexion.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Que el asistente use el mejor modelo cuando hay internet y siga respondiendo con el local cuando no lo hay, sin que yo tenga que cambiar nada.

## Por qué

`ModelRouter` ya prueba proveedores en orden cuando uno falla (ADR-054), pero solo conoce proveedores de nube y descubre la falta de conexión esperando a que venza un tiempo límite.

## Alcance

- Añadir el proveedor local a la cadena de respaldo.
- Tres modos configurables: `nube-primero` (predeterminado), `local-primero` y `solo-local`.
- No esperar al tiempo límite completo en cada mensaje cuando ya se sabe que no hay conexión.
- Exponer qué proveedor respondió, para que la interfaz pueda avisar (ver [KAN-135](KAN-135-deteccion-de-modo.md)).

## Criterio de aceptación

- [ ] Con el cable de red desconectado, el segundo mensaje responde tan rápido como si solo existiera el modelo local.
- [ ] Al volver la conexión, se regresa al proveedor de nube sin reiniciar.
- [ ] En `solo-local` no sale ninguna petición hacia internet.

## Notas

Archivos: `packages/ai-abstraction/src/router.ts`, `apps/web/app/api/chat/route.ts`.
