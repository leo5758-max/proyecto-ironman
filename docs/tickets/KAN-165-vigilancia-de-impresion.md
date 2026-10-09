# KAN-165 — Vigilancia de la impresión con cámara

| Campo | Valor |
|---|---|
| Épica | E25 — Máquinas de fabricación (láser, impresión 3D, CNC) |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | [KAN-164](KAN-164-octoprint-y-klipper.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | Pausar es `reversible` |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Que el asistente me avise si una impresión salió mal, y la pause.

## Por qué

Las impresiones largas fallan sin que nadie las vea. `plugin-vision-py` ya existe como proceso auxiliar de visión.

## Alcance

- Tomar imágenes periódicas durante la impresión.
- Detectar fallos típicos: pieza despegada, maraña de filamento.
- Pausar y avisar; nunca reanudar solo.
- Las imágenes se procesan en el nodo y no salen de la red sin permiso.

## Criterio de aceptación

- [ ] Con un conjunto de imágenes de prueba, se detectan los fallos sin exceso de falsas alarmas.
- [ ] Ante un fallo simulado, la impresión se pausa y llega una notificación.
