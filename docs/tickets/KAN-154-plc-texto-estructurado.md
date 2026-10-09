# KAN-154 — PLC: generar lógica en Texto Estructurado

| Campo | Valor |
|---|---|
| Épica | E24 — Programar dispositivos hablando |
| Tipo | Investigación |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | `safety-critical` |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Describir una secuencia de automatización y que el asistente escriba el programa del PLC.

## Por qué

Hoy KAN solo intercambia datos con un PLC (Modbus y OPC-UA). Programarlo es otro problema: cada fabricante tiene su propio entorno y formato, y casi ninguno permite cargar un programa desde fuera de su software.

## Alcance

- Investigar qué plataformas permiten cargar programas de forma abierta (por ejemplo OpenPLC y CODESYS).
- Primer alcance realista: generar Texto Estructurado (IEC 61131-3) como archivo, para que una persona lo revise e importe en el entorno del fabricante.
- Simular la lógica antes de entregarla.
- Decidir si la carga directa entra en el alcance, y para qué plataformas.

## Criterio de aceptación

- [ ] Existe un informe con las plataformas viables y una recomendación.
- [ ] Para una secuencia sencilla, el archivo generado se importa sin errores en al menos un entorno.

## Notas

Un error en un PLC puede mover maquinaria industrial. El asistente no debe cargar lógica en un PLC en producción sin revisión humana.
