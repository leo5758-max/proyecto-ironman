# proyecto-ironman
# PROMPT MAESTRO PARA CLAUDE CODE: Inicialización y Orquestación del Proyecto "KAN"

## 1. Contexto y Visión General
Estás operando en mi repositorio de código local. El objetivo es diseñar, unificar y construir **KAN**, un asistente virtual inteligente inspirado en J.A.R.V.I.S., capaz de controlar de forma autónoma y fluida tanto **entornos físicos** (hardware, microcontroladores, sensores, actuadores, motores, automatización de talleres/casas) como **entornos digitales** (interfaces web, scripts de visión por computador, APIs, bases de datos y aplicaciones de software).

Quiero que KAN sea un sistema centralizado, modular, extensible y de baja latencia que actúe como el cerebro omnipotente de todo mi ecosistema técnico.

## 2. Instrucciones para la Ejecución Inicial en el Repo
Antes de escribir o modificar cualquier línea de código, realiza las siguientes tareas de inspección:
1. **Auditoría del Repositorio:** Escanea recursivamente el directorio actual para identificar todos los proyectos existentes (códigos en C++/Arduino para ESP32, RP2040, scripts de Python con OpenCV/MediaPipe, interfaces web, etc.).
2. **Mapeo de Módulos:** Clasifica el código encontrado en dos grandes categorías:
   - `core/`: El núcleo lógico de KAN (procesamiento de lenguaje, toma de decisiones, router de comandos).
   - `hardware_bridges/`: Conexiones físicas (firmware, protocolos seriales, MQTT, ESP32, drivers A4988/BTS7960, sensores MPU6050, TCS3200, etc.).
   - `digital_services/`: Automatizaciones de software, APIs, visión artificial y paneles de control web/móvil.
3. **Propuesta de Arquitectura:** Genera un archivo `KAN_ARCH.md` en la raíz explicando cómo piensas fusionar los proyectos detectados en una arquitectura unificada (ej. un backend central en Python usando WebSockets/MQTT que comunique la capa digital con los nodos físicos ESP32).

## 3. Requisitos Técnicos del Sistema KAN
- **Core Central (Python):** Debe manejar la lógica principal, procesamiento de comandos y un sistema de plugins/módulos.
- **Comunicación Híbrida:** 
  - Para hardware: Soporte robusto de comunicación serial (UART/USB) y protocolos inalámbricos (MQTT / WebSockets) hacia microcontroladores.
  - Para software/digital: Endpoints limpios y control de procesos del sistema operativo.
- **Extensibilidad:** Añadir un nuevo dispositivo físico o una nueva habilidad digital debe ser tan simple como añadir un módulo/driver con una interfaz estándar.
- **Robustez y Seguridad:** Manejo de excepciones ante desconexión de hardware, reconexión automática y logs detallados de cada acción ejecutada (tanto digital como física).

## 4. Siguientes Pasos Inmediatos
1. Ejecuta la auditoría del repo y muéstrame un resumen de los proyectos que encontraste y cómo se relacionan.
2. Crea la estructura de directorios base para KAN.
3. Escribe el archivo `KAN_ARCH.md` con el plan de integración.
4. No sobrescribas código existente valioso sin antes proponer una estrategia de refactorización o integración en los módulos correspondientes.

¡Manos a la obra! Analiza el repositorio ahora.
