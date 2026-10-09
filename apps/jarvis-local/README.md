# apps/jarvis-local — prototipo de asistente 100 % local

Prototipo en Python del asistente funcionando **sin internet**: el modelo de IA corre en la propia máquina con Ollama, la voz se reconoce con Vosk y se sintetiza con pyttsx3, y la memoria se guarda en un archivo JSON.

Es la semilla del **nodo local** de KAN (ver [`KAN_ARCH.md`](../../KAN_ARCH.md) §4). Llegó de la carpeta `jarvis prototipo/` y se movió aquí **sin cambiar una sola línea de código**: los scripts funcionan igual que antes.

## Qué hay

| Archivo | Qué hace | Necesita |
|---|---|---|
| `jarvis_memoria.py` | Chat por texto con IA local y memoria. Comandos: `recuerda <dato>`, `memoria`, `salir`. | Ollama |
| `jarvis_voz.py` | Conversación por voz: escucha, piensa y responde hablando. No usa la memoria. | Ollama, modelo Vosk, micrófono |
| `prueba_voz.py` | Prueba del micrófono y del reconocimiento de voz. | Modelo Vosk, micrófono |
| `main.py` | Primera versión (0.2): solo memoria, sin IA. Comandos: `recordar`, `memoria`, `salir`. | Nada |
| `memoria_jarvis.json` | Los recuerdos guardados. | — |
| `respaldo_20261008_234354/` | Copia de respaldo del 8 de octubre. Los tres `.py` son idénticos a los actuales. | — |

## Cómo correrlo

```bash
cd apps/jarvis-local
pip install -r requirements.txt

# 1. IA local
ollama pull qwen2.5:3b        # una sola vez; después funciona sin internet
ollama serve                  # si no está ya corriendo

# 2. Chat por texto con memoria
python jarvis_memoria.py

# 3. Chat por voz
python jarvis_voz.py
```

Hay que ejecutar los scripts **desde esta carpeta**: `main.py` busca `memoria_jarvis.json` en la carpeta actual.

## Limitaciones conocidas

Están registradas como tickets en [`docs/tickets/`](../../docs/tickets/README.md); no se corrigieron en la unificación para no tocar código que funciona.

- La ruta del modelo de voz está fija a una carpeta de Windows (`C:\Users\losro\OneDrive\Escritorio\vosk-model-es-0.42\...`) en `jarvis_voz.py` y `prueba_voz.py`. En otra máquina hay que editarla a mano → KAN-101.
- El micrófono está fijo en `device=1` → KAN-101.
- Hay tres puntos de entrada con lógica repetida, y la voz no comparte memoria ni personalidad con el chat por texto → KAN-101.
- `memoria_jarvis.json` contiene datos personales y está en un repositorio público → KAN-103.
- No controla ningún dispositivo: todavía no está conectado al resto de KAN → KAN-110, KAN-113, KAN-122, KAN-125.
