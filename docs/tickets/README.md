# Tickets de desarrollo

Trabajo futuro del proyecto unificado, escrito el 2026-10-09 al unir KAN con el prototipo de Jarvis. Son 50 tickets en 9 épicas (E19 a E27), que continúan la numeración de [`docs/10-backlog-y-tareas.md`](../10-backlog-y-tareas.md). El contexto está en [`KAN_ARCH.md`](../../KAN_ARCH.md).

Cada ticket es un archivo con la misma estructura que la plantilla de issues del repositorio (`.github/ISSUE_TEMPLATE/feature_request.md`): qué necesita el usuario, por qué, alcance y criterio de aceptación.

## Cómo usarlos

- **Prioridad.** P0: sin esto la visión no se sostiene o hay un riesgo abierto. P1: necesario para un primer uso real. P2: puede esperar.
- **Estado.** Todos empiezan en `Pendiente`. Al trabajarlos, cambiar el campo a `En curso` o `Hecho` en el propio archivo.
- **Decisiones primero.** Los tickets de tipo Decisión no llevan código: se cierran con un ADR en [`docs/00-analisis-y-decisiones.md`](../00-analisis-y-decisiones.md).
- **Pasarlos a issues de GitHub.** Con la CLI de GitHub, desde la raíz del repositorio:

  ```bash
  for f in docs/tickets/KAN-*.md; do
    gh issue create --title "$(head -n 1 "$f" | sed 's/^# //')" --body-file "$f"
  done
  ```

## Resumen

| Prioridad | Tickets |
|---|---|
| P0 | 14 |
| P1 | 17 |
| P2 | 19 |
| **Total** | **50** |

## Orden recomendado

**0. Decisiones y riesgos abiertos.** Antes de escribir código: tres decisiones tuyas, datos personales expuestos y un hueco de seguridad que ya existe.

- [KAN-102](KAN-102-nombre-e-identidad.md) — Decidir el nombre y la identidad del asistente (P0)
- [KAN-103](KAN-103-memoria-fuera-del-repo.md) — Sacar la memoria personal del repositorio público (P0)
- [KAN-104](KAN-104-ci-y-deploy-en-github.md) — Decidir qué ejecuta GitHub en este repositorio (pruebas y despliegue) (P0)
- [KAN-130](KAN-130-adr-sincronizacion.md) — Decidir cómo se sincronizan el nodo local y la versión en línea (P0)
- [KAN-146](KAN-146-autenticacion-firmware-wifi.md) — Autenticación del firmware WiFi del ESP32 (P0)

**1. Saber qué funciona de verdad.** Probar lo ya construido sobre placas y máquinas reales.

- [KAN-182](KAN-182-matriz-de-validacion-hardware.md) — Matriz de validación con hardware real (P0)
- [KAN-144](KAN-144-arduino-uno-en-placa-real.md) — Arduino UNO y Nano: verificar el puente serie en placa real (P1)
- [KAN-162](KAN-162-seguridad-del-laser.md) — Seguridad del láser: enclavamientos y reglas de operación (P0)

**2. El cerebro local entra a KAN.** Lo que el prototipo ya hace, como parte de la plataforma.

- [KAN-101](KAN-101-ordenar-prototipo-jarvis.md) — Ordenar el prototipo de Jarvis sin cambiar lo que hace (P1)
- [KAN-110](KAN-110-proveedor-ia-local-ollama.md) — Proveedor de IA local (Ollama) (P0)
- [KAN-111](KAN-111-enrutador-nube-local.md) — Enrutador de modelos que elige entre nube y local (P0)
- [KAN-180](KAN-180-herramientas-permitidas-sin-conexion.md) — Lista corta de herramientas permitidas en modo sin conexión (P0)
- [KAN-112](KAN-112-elegir-modelo-local.md) — Elegir y medir el modelo local según el hardware (P1)
- [KAN-113](KAN-113-voz-sin-internet.md) — Voz sin internet: reconocimiento con Vosk y sintetizador local (P1)

**3. El nodo local.** Una Raspberry Pi o PC que trabaja sin internet.

- [KAN-120](KAN-120-agente-sin-pantalla.md) — Agente local sin pantalla, para Raspberry Pi (P0)
- [KAN-121](KAN-121-gateway-modo-local.md) — Gateway en modo local, sin Supabase (P0)
- [KAN-122](KAN-122-conversacion-local-completa.md) — Conversación local de punta a punta (P0)
- [KAN-123](KAN-123-instalador-raspberry-pi.md) — Instalador del nodo local para Raspberry Pi (P1)

**4. Siempre conectado.** El nodo y la versión en línea como un solo asistente.

- [KAN-131](KAN-131-vincular-nodo-con-cuenta.md) — Vincular el nodo local con la cuenta en línea (P0)
- [KAN-133](KAN-133-cola-persistente.md) — Cola sin conexión que sobreviva a un reinicio (P1)
- [KAN-135](KAN-135-deteccion-de-modo.md) — Detección de conexión y aviso del modo actual (P1)
- [KAN-132](KAN-132-memoria-unica.md) — Memoria única con copia local (P1)
- [KAN-136](KAN-136-prueba-nube-controla-nodo.md) — Prueba de punta a punta: la versión en línea controla un dispositivo del nodo (P1)

**5. Manos y oídos.** Satélites, programación de placas y máquinas.

- [KAN-142](KAN-142-reglas-locales-y-estado-seguro.md) — Reglas locales y estado seguro en el firmware puente (P1)
- [KAN-151](KAN-151-placas-y-librerias-arduino-cli.md) — Gestión de placas y librerías de `arduino-cli` (P1)
- [KAN-150](KAN-150-programa-este-esp32.md) — «KAN, programa este ESP32»: del lenguaje natural al firmware (P1)
- [KAN-140](KAN-140-satelite-de-voz-esp32.md) — Satélite de voz con ESP32-S3 (P1)
- [KAN-160](KAN-160-trabajos-de-laser.md) — Trabajos completos de láser (P1)
- [KAN-163](KAN-163-laminar-stl.md) — Laminar un modelo 3D para imprimirlo (P1)
- [KAN-170](KAN-170-control-de-la-pc.md) — Control de la computadora local (P1)
- [KAN-181](KAN-181-paro-de-emergencia-fisico.md) — Paro de emergencia físico y universal (P1)

**6. Después.** El resto, todos de prioridad P2:

- [KAN-105](KAN-105-documentacion-al-dia.md) — Poner al día la documentación desfasada (P2)
- [KAN-114](KAN-114-palabra-de-activacion-local.md) — Palabra de activación sin internet (P2)
- [KAN-124](KAN-124-interfaz-local.md) — Interfaz local en la red del taller (P2)
- [KAN-125](KAN-125-retirar-scripts-prototipo.md) — Retirar los scripts sueltos del prototipo (P2)
- [KAN-134](KAN-134-sincronizar-conversaciones-y-auditoria.md) — Sincronizar conversaciones y auditoría (P2)
- [KAN-141](KAN-141-comandos-fijos-en-el-satelite.md) — Comandos fijos reconocidos en el propio satélite (P2)
- [KAN-143](KAN-143-estado-por-mqtt.md) — Reconexión y estado de los satélites por MQTT (P2)
- [KAN-145](KAN-145-ota-esp32.md) — Actualizar el firmware del ESP32 por WiFi (P2)
- [KAN-152](KAN-152-micropython-escribir-y-ejecutar.md) — MicroPython: escribir y ejecutar código generado (P2)
- [KAN-153](KAN-153-raspberry-pi-perifericos-y-servicios.md) — Raspberry Pi: PWM, I2C, ADC y despliegue de servicios (P2)
- [KAN-154](KAN-154-plc-texto-estructurado.md) — PLC: generar lógica en Texto Estructurado (P2)
- [KAN-161](KAN-161-dibujo-a-gcode-laser.md) — De un dibujo a G-code para láser (P2)
- [KAN-164](KAN-164-octoprint-y-klipper.md) — Controladores para OctoPrint y Klipper (Moonraker) (P2)
- [KAN-165](KAN-165-vigilancia-de-impresion.md) — Vigilancia de la impresión con cámara (P2)
- [KAN-166](KAN-166-cnc-limites-y-sondeo.md) — CNC: límites de trabajo, cero de pieza y sondeo (P2)
- [KAN-167](KAN-167-fabrica-esta-pieza.md) — «Fabrica esta pieza»: plan de varios pasos (P2)
- [KAN-171](KAN-171-automatizacion-de-navegador.md) — Automatización de navegador (P2)
- [KAN-172](KAN-172-webhooks-y-n8n.md) — Webhooks y flujos de n8n (P2)
- [KAN-173](KAN-173-mensajeria-como-canal.md) — Mensajería como canal: Telegram o WhatsApp (P2)

## Todos los tickets, por épica

### E19 — Unificación y orden del repositorio

| Ticket | Título | Tipo | Prioridad | Depende de |
|---|---|---|---|---|
| [KAN-101](KAN-101-ordenar-prototipo-jarvis.md) | Ordenar el prototipo de Jarvis sin cambiar lo que hace | Tarea | P1 | — |
| [KAN-102](KAN-102-nombre-e-identidad.md) | Decidir el nombre y la identidad del asistente | Decisión | P0 | — |
| [KAN-103](KAN-103-memoria-fuera-del-repo.md) | Sacar la memoria personal del repositorio público | Tarea | P0 | — |
| [KAN-104](KAN-104-ci-y-deploy-en-github.md) | Decidir qué ejecuta GitHub en este repositorio (pruebas y despliegue) | Decisión | P0 | — |
| [KAN-105](KAN-105-documentacion-al-dia.md) | Poner al día la documentación desfasada | Tarea | P2 | — |

### E20 — Cerebro y voz locales

| Ticket | Título | Tipo | Prioridad | Depende de |
|---|---|---|---|---|
| [KAN-110](KAN-110-proveedor-ia-local-ollama.md) | Proveedor de IA local (Ollama) | Feature | P0 | — |
| [KAN-111](KAN-111-enrutador-nube-local.md) | Enrutador de modelos que elige entre nube y local | Feature | P0 | KAN-110 |
| [KAN-112](KAN-112-elegir-modelo-local.md) | Elegir y medir el modelo local según el hardware | Investigación | P1 | KAN-110 |
| [KAN-113](KAN-113-voz-sin-internet.md) | Voz sin internet: reconocimiento con Vosk y sintetizador local | Feature | P1 | — |
| [KAN-114](KAN-114-palabra-de-activacion-local.md) | Palabra de activación sin internet | Feature | P2 | KAN-102, KAN-113 |

### E21 — Nodo local sin internet

| Ticket | Título | Tipo | Prioridad | Depende de |
|---|---|---|---|---|
| [KAN-120](KAN-120-agente-sin-pantalla.md) | Agente local sin pantalla, para Raspberry Pi | Feature | P0 | — |
| [KAN-121](KAN-121-gateway-modo-local.md) | Gateway en modo local, sin Supabase | Feature | P0 | — |
| [KAN-122](KAN-122-conversacion-local-completa.md) | Conversación local de punta a punta | Feature | P0 | KAN-110, KAN-120, KAN-121 |
| [KAN-123](KAN-123-instalador-raspberry-pi.md) | Instalador del nodo local para Raspberry Pi | Tarea | P1 | KAN-112, KAN-122 |
| [KAN-124](KAN-124-interfaz-local.md) | Interfaz local en la red del taller | Feature | P2 | KAN-122 |
| [KAN-125](KAN-125-retirar-scripts-prototipo.md) | Retirar los scripts sueltos del prototipo | Tarea | P2 | KAN-113, KAN-122, KAN-132 |

### E22 — Sincronización entre el nodo local y la versión en línea

| Ticket | Título | Tipo | Prioridad | Depende de |
|---|---|---|---|---|
| [KAN-130](KAN-130-adr-sincronizacion.md) | Decidir cómo se sincronizan el nodo local y la versión en línea | Decisión | P0 | — |
| [KAN-131](KAN-131-vincular-nodo-con-cuenta.md) | Vincular el nodo local con la cuenta en línea | Feature | P0 | KAN-120 |
| [KAN-132](KAN-132-memoria-unica.md) | Memoria única con copia local | Feature | P1 | KAN-121, KAN-130 |
| [KAN-133](KAN-133-cola-persistente.md) | Cola sin conexión que sobreviva a un reinicio | Feature | P1 | — |
| [KAN-134](KAN-134-sincronizar-conversaciones-y-auditoria.md) | Sincronizar conversaciones y auditoría | Feature | P2 | KAN-130, KAN-121 |
| [KAN-135](KAN-135-deteccion-de-modo.md) | Detección de conexión y aviso del modo actual | Feature | P1 | KAN-111 |
| [KAN-136](KAN-136-prueba-nube-controla-nodo.md) | Prueba de punta a punta: la versión en línea controla un dispositivo del nodo | Tarea | P1 | KAN-120, KAN-131 |

### E23 — Satélites con microcontrolador (ESP32, Arduino)

| Ticket | Título | Tipo | Prioridad | Depende de |
|---|---|---|---|---|
| [KAN-140](KAN-140-satelite-de-voz-esp32.md) | Satélite de voz con ESP32-S3 | Feature | P1 | KAN-113, KAN-122, KAN-146 |
| [KAN-141](KAN-141-comandos-fijos-en-el-satelite.md) | Comandos fijos reconocidos en el propio satélite | Feature | P2 | KAN-140 |
| [KAN-142](KAN-142-reglas-locales-y-estado-seguro.md) | Reglas locales y estado seguro en el firmware puente | Feature | P1 | — |
| [KAN-143](KAN-143-estado-por-mqtt.md) | Reconexión y estado de los satélites por MQTT | Feature | P2 | KAN-142 |
| [KAN-144](KAN-144-arduino-uno-en-placa-real.md) | Arduino UNO y Nano: verificar el puente serie en placa real | Tarea | P1 | — |
| [KAN-145](KAN-145-ota-esp32.md) | Actualizar el firmware del ESP32 por WiFi | Feature | P2 | KAN-146 |
| [KAN-146](KAN-146-autenticacion-firmware-wifi.md) | Autenticación del firmware WiFi del ESP32 | Bug de seguridad | P0 | — |

### E24 — Programar dispositivos hablando

| Ticket | Título | Tipo | Prioridad | Depende de |
|---|---|---|---|---|
| [KAN-150](KAN-150-programa-este-esp32.md) | «KAN, programa este ESP32»: del lenguaje natural al firmware | Feature | P1 | KAN-151 |
| [KAN-151](KAN-151-placas-y-librerias-arduino-cli.md) | Gestión de placas y librerías de `arduino-cli` | Feature | P1 | — |
| [KAN-152](KAN-152-micropython-escribir-y-ejecutar.md) | MicroPython: escribir y ejecutar código generado | Feature | P2 | — |
| [KAN-153](KAN-153-raspberry-pi-perifericos-y-servicios.md) | Raspberry Pi: PWM, I2C, ADC y despliegue de servicios | Feature | P2 | — |
| [KAN-154](KAN-154-plc-texto-estructurado.md) | PLC: generar lógica en Texto Estructurado | Investigación | P2 | — |

### E25 — Máquinas de fabricación (láser, impresión 3D, CNC)

| Ticket | Título | Tipo | Prioridad | Depende de |
|---|---|---|---|---|
| [KAN-160](KAN-160-trabajos-de-laser.md) | Trabajos completos de láser | Feature | P1 | KAN-162 |
| [KAN-161](KAN-161-dibujo-a-gcode-laser.md) | De un dibujo a G-code para láser | Feature | P2 | KAN-160 |
| [KAN-162](KAN-162-seguridad-del-laser.md) | Seguridad del láser: enclavamientos y reglas de operación | Feature | P0 | — |
| [KAN-163](KAN-163-laminar-stl.md) | Laminar un modelo 3D para imprimirlo | Feature | P1 | — |
| [KAN-164](KAN-164-octoprint-y-klipper.md) | Controladores para OctoPrint y Klipper (Moonraker) | Feature | P2 | — |
| [KAN-165](KAN-165-vigilancia-de-impresion.md) | Vigilancia de la impresión con cámara | Feature | P2 | KAN-164 |
| [KAN-166](KAN-166-cnc-limites-y-sondeo.md) | CNC: límites de trabajo, cero de pieza y sondeo | Feature | P2 | — |
| [KAN-167](KAN-167-fabrica-esta-pieza.md) | «Fabrica esta pieza»: plan de varios pasos | Feature | P2 | KAN-160, KAN-163 |

### E26 — Control del mundo digital

| Ticket | Título | Tipo | Prioridad | Depende de |
|---|---|---|---|---|
| [KAN-170](KAN-170-control-de-la-pc.md) | Control de la computadora local | Feature | P1 | — |
| [KAN-171](KAN-171-automatizacion-de-navegador.md) | Automatización de navegador | Feature | P2 | — |
| [KAN-172](KAN-172-webhooks-y-n8n.md) | Webhooks y flujos de n8n | Feature | P2 | — |
| [KAN-173](KAN-173-mensajeria-como-canal.md) | Mensajería como canal: Telegram o WhatsApp | Feature | P2 | — |

### E27 — Seguridad y validación con hardware real

| Ticket | Título | Tipo | Prioridad | Depende de |
|---|---|---|---|---|
| [KAN-180](KAN-180-herramientas-permitidas-sin-conexion.md) | Lista corta de herramientas permitidas en modo sin conexión | Feature | P0 | KAN-111 |
| [KAN-181](KAN-181-paro-de-emergencia-fisico.md) | Paro de emergencia físico y universal | Feature | P1 | — |
| [KAN-182](KAN-182-matriz-de-validacion-hardware.md) | Matriz de validación con hardware real | Tarea | P0 | — |
