# KAN-143 — Reconexión y estado de los satélites por MQTT

| Campo | Valor |
|---|---|
| Épica | E23 — Satélites con microcontrolador (ESP32, Arduino) |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | [KAN-142](KAN-142-reglas-locales-y-estado-seguro.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Que el asistente sepa siempre qué placas están vivas y recupere lo que midieron mientras no había conexión.

## Por qué

Con varias placas por WiFi, una conexión directa a cada una escala mal. `plugin-mqtt` ya existe como cliente.

## Alcance

- Variante del firmware que publique estado y telemetría por MQTT.
- Mensaje de última voluntad para detectar una placa caída.
- Guardar en la placa las últimas lecturas mientras no hay conexión y enviarlas al volver.
- Broker MQTT en el nodo local, como parte del instalador ([KAN-123](KAN-123-instalador-raspberry-pi.md)).

## Criterio de aceptación

- [ ] Al desenchufar una placa, el asistente lo sabe en segundos.
- [ ] Las lecturas tomadas sin conexión llegan con su hora correcta.
