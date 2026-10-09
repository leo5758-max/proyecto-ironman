# KAN-161 — De un dibujo a G-code para láser

| Campo | Valor |
|---|---|
| Épica | E25 — Máquinas de fabricación (láser, impresión 3D, CNC) |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | [KAN-160](KAN-160-trabajos-de-laser.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Darle al asistente un dibujo o una foto y que prepare el trabajo de corte o grabado.

## Por qué

Hoy hay que generar el G-code en otro programa.

## Alcance

- Convertir SVG y DXF a trayectorias de corte.
- Convertir imágenes a grabado por barrido.
- Perfiles de material: potencia, velocidad y número de pasadas.
- Proceso auxiliar en Python, bajo demanda.

## Criterio de aceptación

- [ ] Un SVG sencillo produce un G-code que la vista previa de [KAN-160](KAN-160-trabajos-de-laser.md) muestra correctamente.
- [ ] Las medidas del resultado coinciden con las del dibujo.
