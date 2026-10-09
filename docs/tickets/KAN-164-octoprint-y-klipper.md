# KAN-164 — Controladores para OctoPrint y Klipper (Moonraker)

| Campo | Valor |
|---|---|
| Épica | E25 — Máquinas de fabricación (láser, impresión 3D, CNC) |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-165](KAN-165-vigilancia-de-impresion.md) |
| Severidad física (ADR-004) | Las mismas que `plugin-gcode` |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Usar el asistente con una impresora que ya tiene OctoPrint o Klipper, sin cambiar mi instalación.

## Por qué

Enviar G-code por cable es frágil en impresiones largas: si se interrumpe la conexión, la impresión se detiene. OctoPrint y Klipper ya resuelven eso y ofrecen cámara y control de archivos.

## Alcance

- Plugin cliente de la API de OctoPrint.
- Plugin cliente de la API de Moonraker.
- Mismas capacidades y severidades que `plugin-gcode`.
- Destinos configurados, sin escaneo de red, igual que el resto de los plugins.

## Criterio de aceptación

- [ ] Se sube un archivo, se inicia la impresión, se consulta el avance y se cancela, todo desde el chat.
