# KAN-122 — Conversación local de punta a punta

| Campo | Valor |
|---|---|
| Épica | E21 — Nodo local sin internet |
| Tipo | Feature |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | [KAN-110](KAN-110-proveedor-ia-local-ollama.md), [KAN-120](KAN-120-agente-sin-pantalla.md), [KAN-121](KAN-121-gateway-modo-local.md) |
| Desbloquea | [KAN-123](KAN-123-instalador-raspberry-pi.md), [KAN-124](KAN-124-interfaz-local.md), [KAN-125](KAN-125-retirar-scripts-prototipo.md), [KAN-140](KAN-140-satelite-de-voz-esp32.md) |
| Severidad física (ADR-004) | Hereda la de cada herramienta |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Sin internet, pedirle algo al asistente y que lo haga sobre un dispositivo real del taller.

## Por qué

Es la prueba de que la unificación funciona: el cerebro local del prototipo usando las manos de KAN.

## Alcance

- Servicio en el nodo que ejecute `SendMessageUseCase` con el proveedor local, la memoria local y las herramientas del Gateway local.
- Entrada por texto y por voz.
- Las mismas reglas de seguridad que en línea, más las de [KAN-180](KAN-180-herramientas-permitidas-sin-conexion.md).

## Criterio de aceptación

- [ ] Sin conexión a internet: «enciende el LED» cambia el LED del simulador, y después el de un ESP32 real.
- [ ] La conversación queda guardada y aparece al reiniciar el nodo.
- [ ] Todo el recorrido queda en la auditoría local.

## Notas

Hito principal del proyecto unificado.
