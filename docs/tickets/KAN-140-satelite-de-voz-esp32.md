# KAN-140 — Satélite de voz con ESP32-S3

| Campo | Valor |
|---|---|
| Épica | E23 — Satélites con microcontrolador (ESP32, Arduino) |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | [KAN-113](KAN-113-voz-sin-internet.md), [KAN-122](KAN-122-conversacion-local-completa.md), [KAN-146](KAN-146-autenticacion-firmware-wifi.md) |
| Desbloquea | [KAN-141](KAN-141-comandos-fijos-en-el-satelite.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Tener un aparato pequeño y barato en cada zona del taller para hablar con el asistente sin acercarme a la computadora.

## Por qué

Un ESP32 no puede correr el modelo de IA, pero sí puede ser micrófono y bocina del nodo local.

## Alcance

- Firmware para ESP32-S3 con micrófono I2S y amplificador I2S.
- Envío del audio al nodo por WiFi y reproducción de la respuesta.
- Luz de estado: en espera, escuchando, pensando, sin conexión.
- Botón para silenciar el micrófono, con corte real por hardware.
- Autenticación contra el nodo (ver [KAN-146](KAN-146-autenticacion-firmware-wifi.md)).
- Lista de materiales y diagrama de conexión.

## Criterio de aceptación

- [ ] Se le habla al satélite y la respuesta sale por su bocina.
- [ ] Con el micrófono silenciado no sale audio de la placa.
- [ ] Dos satélites funcionan a la vez sin mezclarse.

## Notas

Antes de diseñar un protocolo propio, evaluar los que ya existen para satélites de voz (por ejemplo Wyoming o ESPHome).
