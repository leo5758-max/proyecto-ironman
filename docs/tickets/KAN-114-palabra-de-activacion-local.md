# KAN-114 — Palabra de activación sin internet

| Campo | Valor |
|---|---|
| Épica | E20 — Cerebro y voz locales |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | [KAN-102](KAN-102-nombre-e-identidad.md), [KAN-113](KAN-113-voz-sin-internet.md) |
| Desbloquea | — |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Decir el nombre del asistente en el taller y que me escuche, sin apretar nada y sin internet.

## Por qué

La palabra de activación actual vive en el navegador (`useWakeWord.ts`) y usa el reconocimiento de voz del propio navegador, que no existe en todos y que suele depender de la nube. El prototipo no tiene palabra de activación: escucha todo el tiempo.

## Alcance

- Detector de palabra de activación en el nodo local, siempre encendido y de bajo consumo.
- Solo después de detectarla se manda audio al reconocimiento completo.
- Señal clara de que está escuchando (sonido o luz).

## Criterio de aceptación

- [ ] En una hora de ruido normal de taller hay como mucho una activación falsa.
- [ ] A tres metros, la palabra se detecta al menos nueve de cada diez veces.

## Notas

Depende del nombre elegido en [KAN-102](KAN-102-nombre-e-identidad.md): una palabra de una sílaba como «KAN» se confunde más que una de dos o tres.
