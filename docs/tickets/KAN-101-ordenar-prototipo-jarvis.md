# KAN-101 — Ordenar el prototipo de Jarvis sin cambiar lo que hace

| Campo | Valor |
|---|---|
| Épica | E19 — Unificación y orden del repositorio |
| Tipo | Tarea |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Poder correr el prototipo local en cualquier máquina con un solo comando, sin editar rutas dentro del código.

## Por qué

El prototipo entró a `apps/jarvis-local/` tal cual estaba. Tiene la ruta del modelo de voz fija a una carpeta de Windows, el micrófono fijo en `device=1`, tres puntos de entrada con lógica repetida y una carpeta de respaldo duplicada. Así solo corre en la PC donde se escribió.

## Alcance

- Leer la configuración de variables de entorno, con los valores actuales como predeterminados: dirección de Ollama, modelo, ruta del modelo Vosk, dispositivo de micrófono, archivo de memoria.
- Un solo punto de entrada con modos `texto`, `voz` y `prueba-voz`.
- Que la voz use la misma memoria y la misma personalidad que el chat por texto (hoy `jarvis_voz.py` tiene un prompt distinto y no recuerda nada).
- Fijar versiones en `requirements.txt`.
- Borrar `respaldo_20261008_234354/`: sus tres `.py` son idénticos a los actuales y el historial de git ya los conserva.
- No añadir funciones nuevas en este ticket.

## Criterio de aceptación

- [ ] En una máquina limpia, `pip install -r requirements.txt` y un comando bastan para chatear por texto.
- [ ] Cambiar de micrófono o de carpeta del modelo no requiere tocar código.
- [ ] Decir «recuerda que…» por voz guarda el dato y aparece después en el chat por texto.

## Notas

Archivos: `apps/jarvis-local/jarvis_memoria.py`, `jarvis_voz.py`, `prueba_voz.py`, `main.py`.
