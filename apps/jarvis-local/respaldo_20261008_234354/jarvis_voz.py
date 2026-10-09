
import json
import requests
import sounddevice as sd
import pyttsx3

from vosk import Model, KaldiRecognizer

RUTA_MODELO = (
    r"C:\Users\losro\OneDrive\Escritorio"
    r"\vosk-model-es-0.42\vosk-model-es-0.42"
)

URL_OLLAMA = "http://localhost:11434/api/generate"
MODELO_IA = "qwen2.5:3b"

print("JARVIS: Inicializando sistemas...")

voz = pyttsx3.init()
voz.setProperty("rate", 175)

def hablar(texto):
    print(f"JARVIS: {texto}")
    voz.say(texto)
    voz.runAndWait()

print("JARVIS: Cargando reconocimiento de voz...")
modelo_voz = Model(RUTA_MODELO)
reconocedor = KaldiRecognizer(modelo_voz, 16000)

def pensar(pregunta):
    try:
        respuesta = requests.post(
            URL_OLLAMA,
            json={
                "model": MODELO_IA,
                "prompt": (
                    "Eres JARVIS, un asistente de inteligencia artificial "
                    "para ayudar a construir y utilizar un traje de Iron Man. "
                    "Habla siempre en español latino, sé útil, claro y breve. "
                    "No afirmes que controlas dispositivos si no están conectados.\n\n"
                    f"Usuario: {pregunta}\nJARVIS:"
                ),
                "stream": False
            },
            timeout=180
        )
        respuesta.raise_for_status()
        return respuesta.json()["response"].strip()

    except requests.RequestException as error:
        print("Error al contactar con Ollama:", error)
        return "No pude contactar con mi cerebro local. Revisa que Ollama esté funcionando."

hablar("Sistemas en línea. Soy JARVIS. Te escucho.")

try:
    with sd.RawInputStream(
        samplerate=16000,
        blocksize=8000,
        dtype="int16",
        channels=1,
        device=1
    ) as microfono:
        while True:
            audio, _ = microfono.read(4000)

            if reconocedor.AcceptWaveform(bytes(audio)):
                resultado = json.loads(reconocedor.Result())
                pregunta = resultado.get("text", "").strip()

                if not pregunta:
                    continue

                print(f"Tú: {pregunta}")

                if pregunta in ("salir", "apagar jarvis", "terminar"):
                    hablar("Apagando sistemas. Hasta pronto.")
                    break

                respuesta = pensar(pregunta)
                hablar(respuesta)

except KeyboardInterrupt:
    print("\nJARVIS: Sesión terminada.")

except Exception as error:
    print(f"\nJARVIS: Se produjo un error: {error}")