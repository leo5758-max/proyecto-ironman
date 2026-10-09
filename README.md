# Proyecto Ironman — KAN

Un asistente de inteligencia artificial al estilo J.A.R.V.I.S. que actúa tanto en lo digital como en lo físico: conversa, recuerda, y controla máquinas y dispositivos (impresoras 3D, láser, CNC, ESP32, Arduino, Raspberry Pi, PLC, domótica).

Este repositorio une dos proyectos que antes vivían separados:

- **KAN**, la plataforma: chat web y móvil, plano de control, agente local y 18 controladores de dispositivo. Depende de la nube.
- **Jarvis**, el prototipo local: IA, voz y memoria funcionando sin internet en una sola máquina.

Cómo encajan, hacia dónde va el proyecto y qué decisiones siguen abiertas está en **[`KAN_ARCH.md`](KAN_ARCH.md)**. El trabajo futuro está en **[`docs/tickets/`](docs/tickets/README.md)**.

## Estructura

| Carpeta | Contenido |
|---|---|
| `apps/web` | Chat, voz y panel (Next.js) |
| `apps/gateway` | Plano de control: enruta las órdenes del asistente hacia los agentes locales |
| `apps/desktop` | Agente local con interfaz (Electron): habla con el hardware y aplica la capa de seguridad |
| `apps/mobile` | App móvil (Expo) |
| `apps/jarvis-local` | Prototipo 100 % local en Python: Ollama, Vosk, memoria en JSON |
| `packages/` | Núcleo de conversación, proveedores de IA y de voz, lógica del agente y del Gateway, contrato y SDK de plugins |
| `plugins/` | Controladores: G-code (impresoras 3D, láser, CNC), ESP32/Arduino, MicroPython, Raspberry Pi, Modbus, OPC-UA, MQTT, Home Assistant, Bluetooth, CAN, serial, SSH, HTTP, WebSocket, red, visión |
| `supabase/` | Migraciones de la base de datos |
| `docs/` | Arquitectura, decisiones (ADR), hoja de ruta, auditorías, tickets y los prompts maestros originales |

## Cómo arrancar

**La plataforma** (necesita Node 22 y pnpm 11):

```bash
pnpm install
pnpm dev          # levanta todas las aplicaciones (web, gateway, escritorio, móvil)
pnpm test         # pruebas
pnpm typecheck    # tipos
pnpm lint
```

Cada aplicación trae su `.env.example` con las variables que necesita. El Gateway no arranca sin un proyecto de Supabase.

**El prototipo local** (necesita Python y Ollama): ver [`apps/jarvis-local/README.md`](apps/jarvis-local/README.md).

## Reglas del proyecto

Vienen de los prompts maestros originales, que se conservan íntegros en [`docs/prompts/`](docs/prompts/):

- **Todo lo que pueda ser un plugin, es un plugin.** El núcleo solo entiende lenguaje, gestiona conversación, memoria, permisos, dispositivos y plugins, y coordina tareas.
- **Nunca depender de un solo proveedor de IA.**
- **Sin conexión cuando sea posible.**
- **El modelo propone, nunca autoriza.** Las acciones físicas peligrosas esperan la confirmación explícita de una persona (ADR-004, ADR-059). Parar nunca requiere confirmación.
- **Análisis antes que código.** Primero el problema, las alternativas y una recomendación; el código llega después de aprobarla.
- **No se sobrescribe código valioso** sin proponer antes cómo integrarlo.
- **Todo queda documentado**: cada decisión de arquitectura es un ADR en [`docs/00-analisis-y-decisiones.md`](docs/00-analisis-y-decisiones.md).

## Documentación

| Para | Leer |
|---|---|
| Entender el proyecto unificado | [`KAN_ARCH.md`](KAN_ARCH.md) |
| Ver qué falta por construir | [`docs/tickets/`](docs/tickets/README.md) |
| El detalle de la plataforma | [`docs/README.md`](docs/README.md) |
| La visión de producto | [`VISION_PRODUCT_v0.2.md`](VISION_PRODUCT_v0.2.md) |
| El mandato original de KAN | [`docs/prompts/prompt-maestro-kan.md`](docs/prompts/prompt-maestro-kan.md) |
| El prompt de orquestación | [`docs/prompts/prompt-maestro-orquestacion.md`](docs/prompts/prompt-maestro-orquestacion.md) |

## Deploy en producción

> Esta sección viene tal cual del README original de KAN.

KAN se despliega como dos servicios separados, no uno solo: Vercel no puede hostear el WebSocket persistente que el Gateway necesita (`/edge`, `/live-voice`), así que `apps/web` (Next.js, serverless) y `apps/gateway` (Express + `ws`, proceso siempre corriendo) van a hosts distintos. Ver `apps/web/vercel.json`, `apps/gateway/Dockerfile`, y para el Gateway: `apps/gateway/fly.toml`, `render.yaml` o `railway.json` (los tres en la raíz del repo salvo `fly.toml`) — cualquiera de los tres apunta al mismo `Dockerfile`, elegí uno según el servicio que uses.

**Railway** (`railway.json`, raíz del repo): a diferencia de Fly.io/Render, Railway no tiene un campo de config-as-code para el build context — usa el "Root Directory" configurado en el dashboard del servicio. Dejalo en la raíz del repo (no lo cambies a `apps/gateway`) — el `Dockerfile` necesita ver todo el monorepo para que `turbo prune` funcione, mismo motivo que ya aplica a Fly.io/Render. `startCommand` está fijado explícitamente en `pnpm start` (igual al `CMD` del propio `Dockerfile`) porque Railway lo usa para *sobreescribir* el `CMD` de la imagen cuando está presente — un valor incorrecto ahí (ej. `node dist/server.js`, que no existe: este Gateway no tiene paso de compilación, corre con `tsx` tal cual) haría que el deploy build bien pero el contenedor crashee al arrancar.

Variables de entorno de `apps/web` (Vercel — Project Settings → Environment Variables, todas en el ambiente "Production"):

| Variable | Secreta | Notas |
|---|---|---|
| `GEMINI_API_KEY` | Sí | Chat + TTS por defecto (ADR-042). |
| `GEMINI_MODEL` | No | Opcional — default `gemini-2.5-flash`. |
| `GEMINI_LIVE_MODEL` | No | Opcional — solo se reenvía, la key real de Live vive en el Gateway. |
| `KAN_GATEWAY_URL` | No | URL HTTP del Gateway desplegado (ej. `https://kan-gateway.fly.dev`). |
| `KAN_GATEWAY_INTERNAL_TOKEN` | Sí | Debe ser idéntico al mismo nombre en el Gateway — nunca `dev-internal-token` en producción. |
| `NEXT_PUBLIC_KAN_GATEWAY_WS_URL` | No | `wss://` público del Gateway, ej. `wss://kan-gateway.fly.dev/edge`. Se hornea en el bundle del cliente en build time. |
| `NEXT_PUBLIC_KAN_GATEWAY_LIVE_VOICE_WS_URL` | No | Igual que arriba, para `/live-voice`. |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Settings → API en supabase.com. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Es pública a propósito (RLS la protege). |
| `GROQ_API_KEY` | Sí | Opcional — STT (ADR-014). |
| `ANTHROPIC_API_KEY` | Sí | Opcional — fallback de texto #1 si Gemini falla (ADR-054). |
| `OPENAI_API_KEY` | Sí | Opcional — alternativa de TTS (ADR-034) y fallback de texto #2 (ADR-054). |

Variables de entorno de `apps/gateway` (Fly.io con `fly secrets set`, Render/Railway con el dashboard del servicio — nunca en `render.yaml`/`fly.toml`/`railway.json`, son secretos):

| Variable | Secreta | Notas |
|---|---|---|
| `KAN_SUPABASE_URL` | No | Mismo proyecto de Supabase que `apps/web`. |
| `KAN_SUPABASE_SERVICE_ROLE_KEY` | Sí | **Nunca** la `anon key` — el Gateway no tiene sesión de usuario, ignora RLS a propósito. |
| `KAN_EDGE_TOKEN` | Sí | Debe coincidir con lo que usan los Edge Agents (`apps/desktop`) al conectar. |
| `KAN_GATEWAY_INTERNAL_TOKEN` | Sí | Debe coincidir con el mismo nombre en `apps/web`. |
| `KAN_WEB_ORIGIN` | No | Origin(es) real(es) del deploy de `apps/web` en Vercel, separados por coma — sin esto, el Simulador del navegador no puede conectar. |
| `GEMINI_API_KEY` | Sí | Opcional — habilita voz en tiempo real (ADR-044) y enriquecimiento automático de dispositivos (ADR-053). Sin ella el Gateway funciona igual, solo sin esas dos capacidades. |
| `PORT` | No | Fly.io: fijo en `fly.toml` (8787). Render/Railway: lo inyectan solos, `apps/gateway/src/server.ts` ya lo respeta (`process.env.PORT ?? 8787`) — no hace falta fijarlo a mano. |

Deploy automático de `apps/web` vía `.github/workflows/deploy.yml` (push a `main`) — requiere los secretos `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` en el repo de GitHub. El Gateway se redespliega con el auto-deploy nativo de Fly.io/Render al conectar el repo (ver instrucciones exactas más abajo, entregadas junto con este incremento).
