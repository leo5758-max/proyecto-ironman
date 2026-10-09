# KAN-146 — Autenticación del firmware WiFi del ESP32

| Campo | Valor |
|---|---|
| Épica | E23 — Satélites con microcontrolador (ESP32, Arduino) |
| Tipo | Bug de seguridad |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-140](KAN-140-satelite-de-voz-esp32.md), [KAN-145](KAN-145-ota-esp32.md) |
| Severidad física (ADR-004) | Protege acciones `irreversible-material` |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Que solo mi asistente pueda dar órdenes a mis placas.

## Por qué

El propio firmware lo advierte en su cabecera: la versión WiFi no valida quién se conecta. Cualquier dispositivo en la misma red que conozca la dirección y el puerto puede escribir en pines conectados a hardware real.

## Alcance

- Autenticación mutua entre el plugin y la placa, con una clave por placa.
- Protección contra repetición de mensajes capturados.
- Cifrado del canal si la placa lo permite.
- Actualizar `PROTOCOL.md`, sección «Seguridad (pendiente)».

## Criterio de aceptación

- [ ] Una conexión sin la clave correcta no puede leer ni escribir ningún pin.
- [ ] Un mensaje capturado y reenviado se rechaza.

## Notas

Mientras no esté resuelto, usar el firmware WiFi solo en una red aislada y sin cargas peligrosas. Bloquea [KAN-140](KAN-140-satelite-de-voz-esp32.md) y [KAN-145](KAN-145-ota-esp32.md).
