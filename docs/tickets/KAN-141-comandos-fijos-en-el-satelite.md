# KAN-141 — Comandos fijos reconocidos en el propio satélite

| Campo | Valor |
|---|---|
| Épica | E23 — Satélites con microcontrolador (ESP32, Arduino) |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | [KAN-140](KAN-140-satelite-de-voz-esp32.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | Solo acciones clasificadas como `reversible` |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Que unas pocas órdenes básicas sigan funcionando aunque se caiga el nodo local.

## Por qué

Es lo más cerca que un ESP32 puede estar de «funcionar solo»: no entiende lenguaje libre, pero sí puede reconocer una lista corta de frases.

## Alcance

- Reconocimiento en el chip de una lista de hasta unas 20 frases (por ejemplo con ESP-SR).
- Cada frase se liga a una acción local: pin, relé o mensaje MQTT.
- La lista se edita desde KAN y se envía al satélite.
- Solo acciones clasificadas como reversibles.

## Criterio de aceptación

- [ ] Con el nodo apagado, «enciende la luz» sigue funcionando.
- [ ] Una frase fuera de la lista no dispara nada.

## Notas

ESP-SR ofrece modelos de comandos en inglés y chino; el soporte de español hay que verificarlo antes de comprometerse.
