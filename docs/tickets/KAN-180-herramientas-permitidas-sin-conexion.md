# KAN-180 — Lista corta de herramientas permitidas en modo sin conexión

| Campo | Valor |
|---|---|
| Épica | E27 — Seguridad y validación con hardware real |
| Tipo | Feature |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | [KAN-111](KAN-111-enrutador-nube-local.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | Restringe `irreversible-material` y `safety-critical` |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Que el asistente, cuando trabaja con el modelo local, no pueda hacer nada peligroso por un malentendido.

## Por qué

Los modelos pequeños que caben en una Raspberry Pi eligen la herramienta equivocada o inventan argumentos con más frecuencia que los de la nube. Sin conexión, el asistente es menos fiable justo cuando hay menos supervisión.

## Alcance

- Lista de herramientas permitidas con el modelo local, vacía por defecto para lo físico salvo solo lectura.
- El usuario amplía la lista herramienta por herramienta, desde el equipo local.
- Las acciones `safety-critical` no se permiten con el modelo local.
- La confirmación muestra siempre la herramienta y los argumentos exactos, no el resumen del modelo.
- Decidir si la confirmación por voz (ADR-059) se acepta cuando quien escucha es el modelo local.
- Usar las mediciones de [KAN-112](KAN-112-elegir-modelo-local.md) para decidir qué se puede abrir.

## Criterio de aceptación

- [ ] En modo sin conexión, pedir una acción fuera de la lista produce una explicación, no una ejecución.
- [ ] Parar y pausar siguen disponibles siempre, en cualquier modo.
