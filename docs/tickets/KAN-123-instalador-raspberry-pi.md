# KAN-123 — Instalador del nodo local para Raspberry Pi

| Campo | Valor |
|---|---|
| Épica | E21 — Nodo local sin internet |
| Tipo | Tarea |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | [KAN-112](KAN-112-elegir-modelo-local.md), [KAN-122](KAN-122-conversacion-local-completa.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Convertir una Raspberry Pi nueva en un nodo de KAN siguiendo pocos pasos.

## Por qué

El nodo junta muchas piezas: Node, Python, Ollama, modelo de IA, modelos de voz, servicios y permisos de puertos serie y pines. Instalarlas a mano es largo y fácil de hacer mal.

## Alcance

- Script de instalación para Raspberry Pi OS de 64 bits.
- Descarga de los modelos con conexión, una sola vez; después todo funciona sin ella.
- Servicios de systemd para el agente, el Gateway local, la voz y Ollama.
- Permisos de grupo para puertos serie y GPIO.
- Guía con el hardware recomendado: modelo de Pi, memoria, almacenamiento, micrófono, bocina, fuente y enfriamiento.

## Criterio de aceptación

- [ ] De una tarjeta recién grabada a un nodo que responde, siguiendo solo la guía.
- [ ] Tras un corte de luz, el nodo vuelve a estar disponible sin intervención.
