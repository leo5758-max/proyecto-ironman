# KAN-162 — Seguridad del láser: enclavamientos y reglas de operación

| Campo | Valor |
|---|---|
| Épica | E25 — Máquinas de fabricación (láser, impresión 3D, CNC) |
| Tipo | Feature |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-160](KAN-160-trabajos-de-laser.md) |
| Severidad física (ADR-004) | `safety-critical` |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Que ningún error del asistente, del modelo o de la red pueda encender el láser en una situación peligrosa.

## Por qué

Un láser de corte puede causar ceguera e incendios. La confirmación por software es necesaria pero no suficiente: el modelo puede equivocarse y el software puede fallar.

## Alcance

- Enclavamientos físicos que corten el láser sin pasar por el software: tapa abierta, paro de emergencia.
- KAN lee el estado de los enclavamientos y se niega a iniciar si alguno no está bien.
- Lista de comprobación antes de cada trabajo: extracción encendida, material adecuado, persona presente.
- Sin operación desatendida: el trabajo se pausa si no hay señal periódica de presencia.
- Lista de materiales prohibidos (por ejemplo PVC, que libera cloro).
- Todo queda en la auditoría.

## Criterio de aceptación

- [ ] Con la tapa abierta, el láser no enciende aunque se envíe la orden directa.
- [ ] El paro de emergencia corta la energía del láser con el nodo apagado.
- [ ] No se puede iniciar un trabajo sin completar la lista de comprobación.

## Notas

Requisito previo de cualquier uso real del láser desde KAN, incluida la validación de [KAN-182](KAN-182-matriz-de-validacion-hardware.md).
