# KAN-120 — Agente local sin pantalla, para Raspberry Pi

| Campo | Valor |
|---|---|
| Épica | E21 — Nodo local sin internet |
| Tipo | Feature |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-122](KAN-122-conversacion-local-completa.md), [KAN-131](KAN-131-vincular-nodo-con-cuenta.md), [KAN-136](KAN-136-prueba-nube-controla-nodo.md) |
| Severidad física (ADR-004) | Define cómo se confirman las acciones `irreversible-material` y `safety-critical` |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Dejar una Raspberry Pi conectada a mis máquinas, sin monitor ni teclado, y que el asistente las controle a través de ella.

## Por qué

El agente que habla con el hardware solo existe dentro de una aplicación con ventana (`apps/desktop`, Electron). La lógica ya está separada en `@kan/edge-agent-core`, así que falta un arranque sin interfaz.

## Alcance

- Nueva `apps/edge-headless`: proceso Node que arranca `@kan/edge-agent-core`, registra los plugins configurados y se conecta al Gateway.
- Configuración por archivo y variables de entorno: plugins activos, dirección del Gateway, credenciales.
- Ejecución como servicio de systemd, con reinicio automático.
- **Confirmación sin pantalla.** Hoy una acción peligrosa se confirma en la ventana de la app de escritorio o, desde ADR-059, con botones en el chat web y por voz en la sesión en vivo. Las dos últimas pasan por el Gateway en la nube. Un nodo sin pantalla y sin internet se queda sin ninguna: hay que decidir el sustituto (botón físico en la Pi, teléfono en la misma red, voz local) y dejarlo en un ADR. Mientras no exista, el agente sin pantalla rechaza sin conexión toda acción que requiera confirmación.
- Paro de emergencia accesible sin pantalla.

## Criterio de aceptación

- [ ] En una Raspberry Pi recién instalada, el servicio arranca solo al encender y aparece como agente conectado.
- [ ] Una acción de solo lectura se ejecuta desde el chat.
- [ ] Sin internet, una acción `irreversible-material` no se ejecuta sin la confirmación definida en el ADR.

## Notas

Revisar que nada en `packages/edge-agent-core` importe Electron. `apps/desktop/src/main/index.ts` es la referencia de arranque.
