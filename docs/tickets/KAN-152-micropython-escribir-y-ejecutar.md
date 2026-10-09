# KAN-152 — MicroPython: escribir y ejecutar código generado

| Campo | Valor |
|---|---|
| Épica | E24 — Programar dispositivos hablando |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | `irreversible-material` |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Pedirle al asistente un programa para una Raspberry Pi Pico o un ESP32 con MicroPython y que lo deje corriendo.

## Por qué

`plugin-micropython` ya lee, escribe, respalda y restaura archivos de la placa (`project_write_file`), pero no puede ejecutar código ni reiniciarla, y mientras está conectado el programa del usuario queda en pausa. Falta el flujo completo de «escribe, prueba y deja corriendo».

## Alcance

- Ejecutar un fragmento y devolver su salida.
- Reiniciar la placa y soltar la conexión para que `main.py` arranque.
- Respaldo automático antes de sobrescribir `main.py`.
- Flujo guiado igual que en [KAN-150](KAN-150-programa-este-esp32.md): preguntar, generar, mostrar, confirmar, cargar, verificar.
- Actualizar el README del plugin, que no menciona `project_write_file`.

## Criterio de aceptación

- [ ] Un programa generado queda en la placa y corre al reiniciarla.
- [ ] Se puede restaurar el programa anterior.
