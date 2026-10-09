
import json
import sounddevice as sd
from vosk import Model, KaldiRecognizer

RUTA_MODELO = (
    r"C:\Users\losro\OneDrive\Escritorio"
    r"\vosk-model-es-0.42\vosk-model-es-0.42"
)

print("JARVIS: Cargando el modelo de voz...")
modelo = Model(RUTA_MODELO)
reconocedor = KaldiRecognizer(modelo, 16000)

print("\nJARVIS: Te escucho. Habla ahora.")
print("Di una frase y después presiona Ctrl+C para terminar.\n")

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
                texto = resultado.get("text", "")

                if texto:
                    print("Tú:", texto)

except KeyboardInterrupt:
    print("\nJARVIS: Prueba de micrófono terminada.")