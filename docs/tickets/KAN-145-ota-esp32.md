# KAN-145 — Actualizar el firmware del ESP32 por WiFi

| Campo | Valor |
|---|---|
| Épica | E23 — Satélites con microcontrolador (ESP32, Arduino) |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | [KAN-146](KAN-146-autenticacion-firmware-wifi.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | `irreversible-material` |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Actualizar las placas repartidas por el taller sin ir a conectarlas una por una por USB.

## Por qué

Hoy subir firmware requiere cable (`compile_and_upload` con `arduino-cli`).

## Alcance

- Actualización por WiFi con verificación de firma.
- Vuelta automática a la versión anterior si la nueva no arranca.
- Confirmación antes de actualizar.

## Criterio de aceptación

- [ ] Una placa se actualiza por WiFi y reporta la versión nueva.
- [ ] Un firmware dañado o sin firma se rechaza.
- [ ] Un firmware que no arranca no deja la placa inservible.
