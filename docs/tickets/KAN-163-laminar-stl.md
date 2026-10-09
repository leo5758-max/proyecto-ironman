# KAN-163 — Laminar un modelo 3D para imprimirlo

| Campo | Valor |
|---|---|
| Épica | E25 — Máquinas de fabricación (láser, impresión 3D, CNC) |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-167](KAN-167-fabrica-esta-pieza.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Darle al asistente un archivo STL y decirle «imprime esta pieza».

## Por qué

`plugin-gcode` imprime un G-code ya preparado. El paso de convertir el modelo en G-code no existe.

## Alcance

- Proceso auxiliar que llame a un laminador por línea de comandos (PrusaSlicer o CuraEngine).
- Perfiles de impresora y de material.
- Devolver tiempo estimado y cantidad de material.
- Encadenar con `print_file`, con confirmación.

## Criterio de aceptación

- [ ] Un STL de prueba se lamina y el resultado se imprime correctamente en una impresora real.
- [ ] El asistente informa el tiempo y el material antes de pedir confirmación.
