# KAN-151 — Gestión de placas y librerías de `arduino-cli`

| Campo | Valor |
|---|---|
| Épica | E24 — Programar dispositivos hablando |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-150](KAN-150-programa-este-esp32.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Que el asistente instale lo que haga falta para compilar para mi placa, sin que yo abra el IDE de Arduino.

## Por qué

`compile_and_upload` supone que `arduino-cli`, el núcleo de la placa y las librerías ya están instalados.

## Alcance

- Detectar si `arduino-cli` está instalado y guiar la instalación.
- Instalar núcleos (AVR, ESP32) y librerías bajo demanda, con aviso de tamaño y tiempo.
- Detectar la placa conectada y proponer su identificador.
- Funcionar sin conexión con lo ya instalado.
- Evaluar PlatformIO como alternativa.

## Criterio de aceptación

- [ ] En una máquina sin el núcleo ESP32, pedir compilar para ESP32 lo instala y compila.
- [ ] Sin conexión, compilar para una placa ya instalada funciona.

## Notas

Archivo: `plugins/plugin-esp32-arduino/src/externalProcess.ts`.
