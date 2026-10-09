# KAN-104 — Decidir qué ejecuta GitHub en este repositorio (pruebas y despliegue)

| Campo | Valor |
|---|---|
| Épica | E19 — Unificación y orden del repositorio |
| Tipo | Decisión |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Que cada cambio se pruebe solo, y que nada se publique en internet sin que yo lo haya decidido.

## Por qué

Al unificar, `.github/workflows/` quedó en la raíz y GitHub lo activará. `ci.yml` corre lint, tipos, pruebas y build en cada cambio. `deploy.yml` intenta publicar `apps/web` en Vercel con cada cambio a `main` y necesita tres secretos; sin ellos falla en rojo, y con ellos despliega a producción.

## Alcance

- Decidir si este repositorio despliega o solo prueba.
- Si despliega: configurar `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`, y elegir dónde corre el Gateway (Fly.io, Render o Railway).
- Si no despliega todavía: cambiar `deploy.yml` a ejecución manual (`workflow_dispatch`).
- Activar la protección de rama descrita en `.github/branch-protection.md`.
- Añadir a la CI una comprobación de sintaxis de `apps/jarvis-local`.

## Criterio de aceptación

- [ ] Un pull request muestra las comprobaciones en verde.
- [ ] Un cambio a `main` no produce un despliegue fallido ni uno inesperado.

## Notas

Primera tarea tras subir la rama: mirar el resultado de la CI. La batería de pruebas no se pudo ejecutar durante la unificación.
