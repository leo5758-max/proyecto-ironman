# KAN-103 — Sacar la memoria personal del repositorio público

| Campo | Valor |
|---|---|
| Épica | E19 — Unificación y orden del repositorio |
| Tipo | Tarea |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Que lo que el asistente recuerda de mí no quede publicado en internet.

## Por qué

`apps/jarvis-local/memoria_jarvis.json` contiene recuerdos reales y el repositorio es público. Hoy son dos datos inofensivos, pero el archivo crece con el uso y cada `git push` lo publicaría.

## Alcance

- Guardar la memoria en una carpeta de datos ignorada por git (por ejemplo `apps/jarvis-local/datos/`).
- Dejar en el repositorio solo un archivo de ejemplo.
- Dejar de versionar el archivo actual **sin borrarlo del disco** (`git rm --cached`), para no perder recuerdos.
- Decidir si además se quiere limpiar el historial, donde el archivo ya quedó.

## Criterio de aceptación

- [ ] `git status` no muestra cambios después de guardar un recuerdo nuevo.
- [ ] Los recuerdos existentes siguen disponibles en la máquina local.

## Notas

Hacerlo junto con [KAN-101](KAN-101-ordenar-prototipo-jarvis.md), que ya mueve la ruta del archivo a una variable de entorno.
