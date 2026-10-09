# KAN-121 — Gateway en modo local, sin Supabase

| Campo | Valor |
|---|---|
| Épica | E21 — Nodo local sin internet |
| Tipo | Feature |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-122](KAN-122-conversacion-local-completa.md), [KAN-132](KAN-132-memoria-unica.md), [KAN-134](KAN-134-sincronizar-conversaciones-y-auditoria.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Que el plano de control funcione dentro de mi taller aunque no haya internet ni cuenta en la nube.

## Por qué

`apps/gateway/src/server.ts` exige `KAN_SUPABASE_URL` y la clave de servicio para arrancar. Sin internet, hoy no hay Gateway, y sin Gateway el chat no puede usar ningún dispositivo.

## Alcance

- Adaptadores locales (SQLite o archivos JSON) para los puertos que hoy solo tienen versión Supabase: memoria, conversaciones, auditoría, emparejamiento, preferencias.
- Modo `KAN_MODE=local` que arranque con esos adaptadores y sin servicios de nube (pagos, correo, notificaciones push).
- Autenticación local sencilla para un solo usuario en la red del taller.
- No duplicar lógica: los mismos casos de uso, con otros adaptadores.

## Criterio de aceptación

- [ ] Con el cable de red desconectado, el Gateway arranca y acepta la conexión de un agente.
- [ ] Las pruebas existentes del Gateway siguen pasando en modo nube.
- [ ] Los datos escritos en modo local sobreviven a un reinicio.

## Notas

Es el ticket más grande de la épica. Conviene empezar por un inventario de todo lo que `server.ts` construye a partir del cliente de Supabase.
