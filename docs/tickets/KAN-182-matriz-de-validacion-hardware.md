# KAN-182 — Matriz de validación con hardware real

| Campo | Valor |
|---|---|
| Épica | E27 — Seguridad y validación con hardware real |
| Tipo | Tarea |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | Las de cada plugin |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Saber con certeza qué máquinas y placas funcionan de verdad con el asistente, y cuáles solo en teoría.

## Por qué

Los README de `plugin-gcode` y `plugin-esp32-arduino` dicen lo mismo: construidos y probados contra simuladores, con la validación en hardware real pendiente. Hasta hacerla, no se sabe cuánto de lo construido funciona sobre una máquina.

## Alcance

- Tabla por plugin y dispositivo: modelo exacto, firmware, qué capacidades se probaron, resultado, fecha.
- Empezar por lo que haya en el taller, en orden de riesgo: ESP32, Arduino UNO, Raspberry Pi, impresora 3D, y el láser al final (después de [KAN-162](KAN-162-seguridad-del-laser.md)).
- Registrar como bug cada diferencia entre el simulador y la máquina real.
- Guía de prueba repetible por plugin.

## Criterio de aceptación

- [ ] Existe `docs/validacion-hardware.md` con al menos ESP32 y una impresora 3D probados.
- [ ] Cada fallo encontrado tiene su ticket.

## Notas

Es el ticket que más reduce la incertidumbre del proyecto. Conviene hacerlo antes de construir encima.
