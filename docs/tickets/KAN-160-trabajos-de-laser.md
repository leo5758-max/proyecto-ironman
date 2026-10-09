# KAN-160 — Trabajos completos de láser

| Campo | Valor |
|---|---|
| Épica | E25 — Máquinas de fabricación (láser, impresión 3D, CNC) |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | [KAN-162](KAN-162-seguridad-del-laser.md) |
| Desbloquea | [KAN-161](KAN-161-dibujo-a-gcode-laser.md), [KAN-167](KAN-167-fabrica-esta-pieza.md) |
| Severidad física (ADR-004) | `safety-critical` |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Decirle al asistente «corta este archivo» y que la máquina láser haga el trabajo completo.

## Por qué

`plugin-gcode` puede encender y apagar el láser, mover ejes y mandar líneas sueltas, pero su envío de archivos (`print_file`) está pensado para impresión 3D. No hay un flujo de trabajo de láser.

## Alcance

- Enviar un G-code de láser a GRBL por streaming, con control de flujo propio de GRBL.
- Recorrer el contorno del trabajo con el láser apagado o a potencia mínima, para comprobar la posición.
- Vista previa del recorrido y tiempo estimado antes de confirmar.
- Límite de potencia máxima configurable por máquina.
- Pausar, reanudar y cancelar; al cancelar, el láser se apaga siempre.
- Detectar alarmas de GRBL y detener el trabajo.

## Criterio de aceptación

- [ ] Un archivo de prueba se graba completo en una máquina real.
- [ ] El recorrido de contorno no enciende el láser por encima de la potencia mínima.
- [ ] Al cancelar o al perder la conexión, el láser queda apagado.

## Notas

El modo láser de GRBL (`$32=1`) cambia el comportamiento de `M3`/`M4`; hay que detectarlo. No empezar antes de [KAN-162](KAN-162-seguridad-del-laser.md).
