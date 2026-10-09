# KAN-171 — Automatización de navegador

| Campo | Valor |
|---|---|
| Épica | E26 — Control del mundo digital |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | Varía: leer es `read-only`; enviar formularios o comprar requiere confirmación |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Que el asistente haga por mí tareas en sitios web que no tienen API.

## Por qué

Los plugins HTTP y WebSocket cubren servicios con API. Muchos sitios solo se pueden usar a través de un navegador.

## Alcance

- Proceso auxiliar con un navegador automatizado.
- Lista de sitios permitidos.
- Las credenciales nunca pasan por el modelo.
- El contenido de las páginas se trata como texto no confiable.

## Criterio de aceptación

- [ ] El asistente abre un sitio permitido, extrae un dato y lo devuelve.
- [ ] Una página con instrucciones ocultas no consigue que el asistente ejecute otra herramienta.
