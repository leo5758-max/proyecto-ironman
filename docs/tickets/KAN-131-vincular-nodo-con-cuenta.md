# KAN-131 — Vincular el nodo local con la cuenta en línea

| Campo | Valor |
|---|---|
| Épica | E22 — Sincronización entre el nodo local y la versión en línea |
| Tipo | Feature |
| Prioridad | P0 |
| Estado | Pendiente |
| Depende de | [KAN-120](KAN-120-agente-sin-pantalla.md) |
| Desbloquea | [KAN-136](KAN-136-prueba-nube-controla-nodo.md) |
| Severidad física (ADR-004) | No aplica |
| Requiere ADR | No |

## Qué necesita poder hacer el usuario

Decirle a mi cuenta en línea que esta Raspberry Pi es mía, una sola vez, sin teclado ni monitor en la Pi.

## Por qué

KAN ya tiene emparejamiento de agentes con la cuenta del usuario (ADR-033): la web genera un código de un solo uso, válido 10 minutos, y el agente lo reclama. Hoy ese código se introduce en la ventana de la app de escritorio.

## Alcance

- Reclamar el código sin pantalla: por línea de comandos, por un archivo de configuración o desde la interfaz local del nodo ([KAN-124](KAN-124-interfaz-local.md)).
- Guardar la credencial del nodo de forma segura en disco.
- Poder desvincular el nodo desde la cuenta en línea.

## Criterio de aceptación

- [ ] Un nodo recién instalado queda vinculado en menos de dos minutos.
- [ ] Un nodo desvinculado deja de recibir órdenes de inmediato.
- [ ] Otro usuario no puede ver ni controlar el nodo.

## Notas

Tabla existente: `supabase/migrations/0008_edge_agent_pairings.sql`.
