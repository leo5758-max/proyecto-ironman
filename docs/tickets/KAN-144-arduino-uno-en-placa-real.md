# KAN-144 — Arduino UNO y Nano: verificar el puente serie en placa real

| Campo | Valor |
|---|---|
| Épica | E23 — Satélites con microcontrolador (ESP32, Arduino) |
| Tipo | Tarea |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | Las del plugin |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Conectar un Arduino UNO por USB y que el asistente lea y escriba sus pines.

## Por qué

El README de `plugin-esp32-arduino` dice que el driver se probó contra un transporte simulado y que la validación con hardware real está pendiente.

## Alcance

- Cargar `kan_esp32_bridge.ino` en un UNO y en un Nano y recorrer todas las capacidades.
- Comprobar que el firmware cabe y es estable con 2 KB de memoria.
- Revisar el reinicio automático del UNO al abrir el puerto serie.
- Catálogo de placas con sus pines válidos.
- Corregir lo que falle.

## Criterio de aceptación

- [ ] Lectura digital, lectura analógica, escritura digital y PWM funcionan en un UNO real desde el chat.
- [ ] El resultado queda anotado en la matriz de [KAN-182](KAN-182-matriz-de-validacion-hardware.md).
