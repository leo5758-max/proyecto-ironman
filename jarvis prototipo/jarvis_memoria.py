
import json
from pathlib import Path
from datetime import datetime

import requests

CARPETA = Path(__file__).resolve().parent
ARCHIVO_MEMORIA = CARPETA / "memoria_jarvis.json"

URL_OLLAMA = "http://localhost:11434/api/generate"
MODELO_IA = "qwen2.5:3b"

PERSONALIDAD = """
Eres JARVIS, un asistente personal de inteligencia artificial inspirado
en el asistente de Iron Man.

Tu misión es ayudar a diseñar, programar y construir un traje tecnológico
realista, empezando por prototipos seguros y asequibles.

PERSONALIDAD:
- Habla siempre en español latino natural.
- Sé inteligente, educado, directo y ligeramente ingenioso.
- Explica la ingeniería paso a paso y adapta las explicaciones al usuario.
- Distingue las ideas de ciencia ficción de las tecnologías que existen.
- Nunca afirmes haber realizado acciones físicas que no puedes ejecutar.
- Prioriza la seguridad al trabajar con baterías, motores y mecanismos.

CONTEXTO:
El usuario está desarrollando un proyecto personal de traje de Iron Man
con un asistente de IA local llamado JARVIS.
El modelo de IA funciona localmente mediante Ollama.
"""

def cargar_memoria():
    if not ARCHIVO_MEMORIA.exists():
        return []

    try:
        contenido = ARCHIVO_MEMORIA.read_text(encoding="utf-8")
        datos = json.loads(contenido)
        return datos if isinstance(datos, list) else []
    except (json.JSONDecodeError, OSError):
        print("JARVIS: No pude leer la memoria. No la modificaré.")
        return []

def guardar_memoria(memoria):
    temporal = ARCHIVO_MEMORIA.with_suffix(".tmp")
    temporal.write_text(
        json.dumps(memoria, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    temporal.replace(ARCHIVO_MEMORIA)

def recordar(texto):
    memoria = cargar_memoria()
    memoria.append({
        "dato": texto,
        "fecha": datetime.now().isoformat(timespec="seconds")
    })
    guardar_memoria(memoria)
    return "Entendido. He guardado ese dato en mi memoria local."

def consultar_memoria():
    memoria = cargar_memoria()

    if not memoria:
        return "Mi memoria está vacía por ahora."

    lineas = ["Estos son los datos guardados:"]
    for i, elemento in enumerate(memoria, start=1):
        lineas.append(f"{i}. {elemento.get('dato', '')}")

    return "\n".join(lineas)

def pensar(pregunta):
    memoria = cargar_memoria()

    contexto_memoria = "\n".join(
        f"- {elemento.get('dato', '')}"
        for elemento in memoria[-20:]
    )

    prompt = f"""{PERSONALIDAD}

DATOS GUARDADOS EN TU MEMORIA:
{contexto_memoria or "Todavía no hay datos guardados."}

CONVERSACIÓN:
Usuario: {pregunta}
JARVIS:"""

    try:
        respuesta = requests.post(
            URL_OLLAMA,
            json={
                "model": MODELO_IA,
                "prompt": prompt,
                "stream": False
            },
            timeout=180
        )
        respuesta.raise_for_status()
        return respuesta.json()["response"].strip()

    except requests.RequestException as error:
        return f"No pude contactar con Ollama. Detalle: {error}"

def ejecutar():
    print("JARVIS: Sistema de memoria iniciado.")
    print("Comandos: recuerda ..., memoria, salir")
    print("Escribe tus mensajes. Esta versión aún no usa el micrófono.")

    while True:
        try:
            pregunta = input("\nTú: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nJARVIS: Sesión terminada.")
            break

        if not pregunta:
            continue

        comando = pregunta.lower()

        if comando in ("salir", "apagar jarvis", "terminar"):
            print("JARVIS: Hasta pronto.")
            break

        if comando == "memoria":
            print("JARVIS:", consultar_memoria())
            continue

        if comando.startswith("recuerda "):
            dato = pregunta[len("recuerda "):].strip()
            if dato:
                print("JARVIS:", recordar(dato))
            else:
                print("JARVIS: Dime qué dato debo recordar.")
            continue

        print("JARVIS:", pensar(pregunta))

if __name__ == "__main__":
    ejecutar()