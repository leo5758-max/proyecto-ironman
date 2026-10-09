# KAN-110 — Proveedor de IA local (Ollama)

| Campo | Valor |
|---|---|
| Épica | E20 — Cerebro y voz locales |
| Tipo | Feature |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | [KAN-111](KAN-111-enrutador-nube-local.md), [KAN-112](KAN-112-elegir-modelo-local.md), [KAN-122](KAN-122-conversacion-local-completa.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Que KAN pueda pensar con un modelo que corre en mi propia máquina, sin internet y sin pagar por uso.

## Por qué

Es la pieza central de la unificación: lo que el prototipo ya hace con Ollama pasa a ser un proveedor más de la plataforma. KAN ya tiene el puerto preparado (`AIProviderPort`) y tres proveedores, todos en la nube.

## Alcance

- Nuevo `OllamaProvider` en `packages/ai-abstraction/src/providers/ollama/` que implemente `AIProviderPort`.
- Usar el endpoint de chat de Ollama (`/api/chat`), no `/api/generate` como el prototipo, para tener historial y llamadas a herramientas.
- Traducir `ToolDescriptor` al formato de herramientas de Ollama y devolver `ToolCallProposal`.
- Configuración por `OLLAMA_BASE_URL` y `OLLAMA_MODEL`; sin ellas, el comportamiento actual no cambia.
- Pruebas con un servidor falso, igual que los demás proveedores.

## Criterio de aceptación

- [ ] Con Ollama corriendo y sin ninguna clave de nube, el chat responde.
- [ ] Con el simulador de dispositivos conectado, «lee el sensor» ejecuta la herramienta usando el modelo local.
- [ ] Si Ollama no está, el error es claro y no cuelga la petición.

## Notas

Referencia: `apps/jarvis-local/jarvis_memoria.py` (función `pensar`). No todos los modelos de Ollama aceptan herramientas; ver [KAN-112](KAN-112-elegir-modelo-local.md).
