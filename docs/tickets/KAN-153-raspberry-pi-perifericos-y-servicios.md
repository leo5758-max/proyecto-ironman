# KAN-153 — Raspberry Pi: PWM, I2C, ADC y despliegue de servicios

| Campo | Valor |
|---|---|
| Épica | E24 — Programar dispositivos hablando |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | `irreversible-material` por defecto |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Usar la Raspberry Pi para algo más que encender y apagar pines, y pedirle al asistente que deje un programa corriendo en ella.

## Por qué

`plugin-raspberry-pi` solo lee y escribe pines digitales. `plugin-ssh` ejecuta comandos y escribe archivos, pero no hay un flujo para instalar un programa como servicio.

## Alcance

- PWM por hardware.
- Bus I2C: detectar dispositivos, leer y escribir.
- Lectura analógica mediante un convertidor externo.
- Desplegar un script como servicio de systemd, con registros y vuelta atrás.

## Criterio de aceptación

- [ ] Un servomotor se mueve por PWM desde el chat.
- [ ] Un sensor I2C se detecta y se lee.
- [ ] Un script generado queda como servicio y sobrevive a un reinicio.
