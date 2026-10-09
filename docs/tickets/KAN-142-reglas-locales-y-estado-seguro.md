# KAN-142 — Reglas locales y estado seguro en el firmware puente

| Campo | Valor |
|---|---|
| Épica | E23 — Satélites con microcontrolador (ESP32, Arduino) |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-143](KAN-143-estado-por-mqtt.md) |
| Severidad física (ADR-004) | El estado seguro es `safety-critical` |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Dejarle a una placa instrucciones sencillas que siga cumpliendo aunque se desconecte de todo, y que al perder conexión deje las salidas en una posición segura.

## Por qué

El firmware actual es un «puente tonto» a propósito: solo obedece órdenes una por una. Si pierde la conexión, las salidas se quedan como estaban; un relé encendido sigue encendido indefinidamente.

## Alcance

- Estado seguro configurable por pin, aplicado cuando no hay señal del nodo durante un tiempo definido.
- Tabla pequeña de reglas guardada en la memoria de la placa: «si la entrada X supera N, pon la salida Y en Z».
- Las reglas se crean desde KAN, se confirman como cualquier acción física y se envían a la placa.
- La placa informa al reconectar qué reglas se dispararon.
- Mantener el modo puente simple como opción.

## Criterio de aceptación

- [ ] Al desconectar el cable, las salidas marcadas pasan a su estado seguro en el tiempo configurado.
- [ ] Una regla de temperatura apaga un relé sin que el nodo esté presente.
- [ ] Las reglas sobreviven a un reinicio de la placa.

## Notas

Archivos: `plugins/plugin-esp32-arduino/firmware/`, `PROTOCOL.md`. En un Arduino UNO la memoria limita la tabla a muy pocas reglas.
