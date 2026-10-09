# KAN-113 — Voz sin internet: reconocimiento con Vosk y sintetizador local

| Campo | Valor |
|---|---|
| Épica | E20 — Cerebro y voz locales |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-114](KAN-114-palabra-de-activacion-local.md), [KAN-125](KAN-125-retirar-scripts-prototipo.md), [KAN-140](KAN-140-satelite-de-voz-esp32.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Hablarle al asistente y que me conteste con voz aunque no haya internet.

## Por qué

La voz de KAN depende hoy de Groq, OpenAI y Gemini. El prototipo ya demostró que se puede oír con Vosk y hablar con pyttsx3 sin conexión.

## Alcance

- Proceso auxiliar en Python que reciba audio y devuelva texto con Vosk, y reciba texto y devuelva audio.
- Adaptador que implemente `VoiceProviderPort` (`transcribe` y `synthesize`) hablando con ese proceso.
- Evaluar Piper como sintetizador: suena mejor que pyttsx3 y corre en Raspberry Pi.
- Elegir el proveedor de voz con el mismo criterio de modos que [KAN-111](KAN-111-enrutador-nube-local.md).
- Documentar la descarga del modelo de voz en español.

## Criterio de aceptación

- [ ] Sin conexión: se graba una frase, se transcribe, el asistente responde y la respuesta se oye.
- [ ] Con conexión, el comportamiento actual no cambia.

## Notas

Referencia: `apps/jarvis-local/jarvis_voz.py`. Puerto: `packages/core/src/domain/ports/VoiceProviderPort.ts`. Patrón de proceso auxiliar: `plugins/plugin-vision-py`.
