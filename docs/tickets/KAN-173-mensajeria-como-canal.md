# KAN-173 — Mensajería como canal: Telegram o WhatsApp

| Campo | Valor |
|---|---|
| Épica | E26 — Control del mundo digital |
| Tipo | Feature |
| Prioridad | P2 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | Sin confirmaciones físicas por este canal |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Escribirle al asistente desde una aplicación de mensajes que ya uso.

## Por qué

Está en la hoja de ruta original (Mes 6) y sigue sin construirse.

## Alcance

- Empezar por Telegram, que no requiere aprobación comercial.
- Vincular el chat con la cuenta del usuario.
- Las acciones físicas peligrosas no se confirman por este canal: siguen los caminos que ya existen (app de escritorio, chat web, voz).

## Criterio de aceptación

- [ ] Un mensaje de Telegram obtiene respuesta del asistente con la memoria del usuario.
- [ ] Un mensaje de un remitente no vinculado se ignora.
