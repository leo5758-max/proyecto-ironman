# KAN-170 — Control de la computadora local

| Campo | Valor |
|---|---|
| Épica | E26 — Control del mundo digital |
| Tipo | Feature |
| Prioridad | P1 |
| Estado | Pendiente |
| Depende de | — |
| Desbloquea | — |
| Severidad física (ADR-004) | `safety-critical` para comandos libres |
| Requiere ADR | Sí |

## Qué necesita poder hacer el usuario

Pedirle al asistente que abra programas, busque y organice archivos o ejecute tareas en mi computadora.

## Por qué

`plugin-ssh` controla computadoras remotas, pero no hay un plugin para la máquina donde corre el propio agente.

## Alcance

- Plugin con capacidades acotadas: abrir aplicación, listar y buscar archivos, leer un archivo, estado del sistema.
- Carpetas permitidas configurables; todo lo demás, negado.
- Ejecución de comandos libres como capacidad separada, con la severidad máxima.
- Windows y Linux.

## Criterio de aceptación

- [ ] «Abre el proyecto X en el editor» funciona.
- [ ] Leer un archivo fuera de las carpetas permitidas se rechaza.
- [ ] Un comando libre no corre sin confirmación.
