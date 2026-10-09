# KAN-150 — «KAN, programa este ESP32»: del lenguaje natural al firmware

| Campo | Valor |
|---|---|
| Épica | E24 — Programar dispositivos hablando |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | [KAN-151](KAN-151-placas-y-librerias-arduino-cli.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | `irreversible-material` |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Describir con palabras lo que quiero que haga una placa y que el asistente escriba el programa, lo compile y lo cargue.

## Por qué

Las piezas existen por separado: `project_write_file` guarda un sketch y `compile_and_upload` lo compila y lo sube con `arduino-cli`. Falta el flujo que las une y lo hace seguro.

## Alcance

- Antes de escribir código, el asistente pregunta lo que falte: placa, pines, componentes conectados.
- Genera el sketch y lo muestra, con una explicación de lo que hace.
- Compila; si falla, corrige e intenta de nuevo un número limitado de veces.
- Respalda el programa anterior antes de cargar el nuevo.
- Confirmación antes de cargar.
- Verifica por el puerto serie que el programa arrancó.
- Probar el modelo local en esta tarea: es probable que la generación de código requiera un modelo de nube.

## Criterio de aceptación

- [ ] «Haz que el LED del pin 2 parpadee cada segundo» termina con el LED parpadeando.
- [ ] Un sketch que no compila nunca se carga.
- [ ] Se puede volver al programa anterior con una orden.

## Notas

Al cargar un programa propio, la placa deja de tener el firmware puente y KAN ya no puede leer sus pines. El flujo debe avisarlo y ofrecer la alternativa de reglas locales ([KAN-142](KAN-142-reglas-locales-y-estado-seguro.md)).
