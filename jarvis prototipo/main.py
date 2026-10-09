
import json
from pathlib import Path
from datetime import datetime

ARCHIVO_MEMORIA = Path("memoria_jarvis.json")

def cargar_memoria():
    if ARCHIVO_MEMORIA.exists():
        try:
            return json.loads(
                ARCHIVO_MEMORIA.read_text(encoding="utf-8")
            )
        except (json.JSONDecodeError, OSError):
            print("No pude leer la memoria anterior.")
    return []

def guardar_memoria(memoria):
    ARCHIVO_MEMORIA.write_text(
        json.dumps(memoria, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

def iniciar_jarvis():
    memoria = cargar_memoria()

    print("\nJ.A.R.V.I.S. - PROTOTIPO 0.2")
    print("Memoria local activada.")
    print(f"Recuerdos guardados: {len(memoria)}")
    print("Comandos: recordar, memoria, salir")

    while True:
        comando = input("\nTú: ").strip()

        if comando.lower() == "salir":
            print("JARVIS: Hasta pronto, creador.")
            break

        elif comando.lower() == "recordar":
            dato = input("JARVIS: ¿Qué debo recordar? ").strip()

            if dato:
                memoria.append({
                    "dato": dato,
                    "fecha": datetime.now().isoformat(
                        timespec="seconds"
                    )
                })
                guardar_memoria(memoria)
                print("JARVIS: Recuerdo guardado.")

        elif comando.lower() == "memoria":
            if not memoria:
                print("JARVIS: Todavía no tengo recuerdos.")
            else:
                for i, recuerdo in enumerate(memoria, start=1):
                    print(f"{i}. {recuerdo['dato']}")

        else:
            print(
                "JARVIS: Aún estoy aprendiendo. "
                "Usa recordar, memoria o salir."
            )

if __name__ == "__main__":
    iniciar_jarvis()