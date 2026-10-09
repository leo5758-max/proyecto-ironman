# KAN-112 — Elegir y medir el modelo local según el hardware

| Campo | Valor |
|---|---|
| Épica | E20 — Cerebro y voz locales |
| Tipo | Investigación |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | [KAN-110](KAN-110-proveedor-ia-local-ollama.md) |
| Desbloquea | [KAN-123](KAN-123-instalador-raspberry-pi.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Saber qué modelo instalar en mi Raspberry Pi o en mi PC para que el asistente responda bien y en un tiempo razonable.

## Por qué

El prototipo usa `qwen2.5:3b` porque funcionó en una PC. En una Raspberry Pi 5 ese tamaño está en el límite, y no todos los modelos pequeños eligen bien las herramientas ni hablan bien español.

## Alcance

- Medir en el hardware elegido: segundos hasta la primera palabra, palabras por segundo y memoria usada.
- Medir la calidad con un conjunto fijo de 20 órdenes en español: cuántas veces elige la herramienta correcta con los argumentos correctos.
- Comparar al menos tres modelos pequeños con soporte de herramientas.
- Recomendar un modelo por tipo de máquina: Raspberry Pi 5 de 8 GB, PC sin GPU, PC con GPU.

## Criterio de aceptación

- [ ] Existe una tabla con los resultados y una recomendación por máquina.
- [ ] El conjunto de órdenes queda en el repositorio para repetir la medición con modelos futuros.

## Notas

El resultado decide el hardware del nodo local ([KAN-123](KAN-123-instalador-raspberry-pi.md)) y la lista de herramientas permitidas sin conexión ([KAN-180](KAN-180-herramientas-permitidas-sin-conexion.md)).
