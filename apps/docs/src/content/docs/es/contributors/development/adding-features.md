---
title: Añadir funcionalidades
description: Elige el workspace de FrameKit responsable, añade las pruebas adecuadas, regenera las salidas y ejecuta las comprobaciones correspondientes.
---

# Añadir funcionalidades

Empieza por identificar el workspace y la capa de runtime propietarios del comportamiento.
Las páginas de [arquitectura del repositorio](/es/contributors/architecture/repository) y
[arquitectura de paquetes](/es/contributors/architecture/packages) proporcionan
el mapa general.

## Elegir el propietario

| Área | Fuente mantenida |
| --- | --- |
| Runtime reutilizable, componentes de Editor y Studio, Server, generación de código, servidor de desarrollo y CLI `framekit` | `packages/framekit/src/` |
| Implementación de `create-framekit` | `packages/create-framekit/src/` |
| Consumidor generado canónico | `packages/create-framekit/template/` |
| Rutas, plantillas y assets de la aplicación de primera parte | `apps/studio/` |
| Sitio de documentación publicado | `apps/docs/src/content/docs/` |
| Scripts de mantenimiento del repositorio | `tooling/` |
| Skills escritas | `Docs/skills/` |

No coloques comportamiento reutilizable dirigido a consumidores en la aplicación privada de Studio. No pongas la lógica de mantenimiento del repositorio en un paquete de runtime público. Cambia el propietario y su fachada pública conjuntamente cuando la funcionalidad cruce el límite de un paquete.

## Añadir cobertura en el nivel adecuado

Añade la prueba más pequeña que demuestre el comportamiento modificado y después añade una cobertura más amplia cuando la funcionalidad cambie un contrato público o entre procesos:

- coloca las pruebas de runtime y componentes bajo el directorio `__tests__/` más cercano;
- coloca los fixtures de contratos públicos de TypeScript bajo `packages/framekit/type-tests/`;
- coloca los casos de argumentos, uso y códigos de salida de la CLI en el árbol de pruebas de la CLI correspondiente;
- coloca los flujos de navegador bajo `e2e/`; y
- valida los consumidores generados cuando la funcionalidad afecte a la generación de código, las exportaciones del paquete, el creador o un comando de consumidor.

Consulta las [convenciones de código](/es/contributors/development/coding-conventions) para conocer la ubicación de las pruebas, los alias y los límites de importación.

## Mantener separadas la fuente y la salida

Edita la fuente mantenida, como las plantillas, los componentes de marca, la fuente del paquete o las páginas Markdown. No edites manualmente:

- `packages/framekit/dist/` ni otras salidas de build;
- `src/generated/framekit/` del proyecto consumidor;
- `public/framekit/` o `.framekit/` del proyecto consumidor; ni
- `apps/docs/dist/` y `apps/docs/.astro/`.

Después de cambiar una plantilla, un componente de marca o un asset compatible, ejecuta el comando `framekit generate`, `framekit check` o `framekit build` correspondiente. La [guía de código generado](/es/contributors/architecture/generated-code) indica qué comando regenera cada salida.

## Seleccionar las comprobaciones

Ejecuta primero las comprobaciones específicas del propietario y después las comprobaciones generales:

| Cambio | Comprobaciones específicas mínimas |
| --- | --- |
| Runtime o API pública de `@mauriciodmo/framekit` | `pnpm --filter @mauriciodmo/framekit lint`; `pnpm --filter @mauriciodmo/framekit test`; `pnpm --filter @mauriciodmo/framekit typecheck`; `pnpm --filter @mauriciodmo/framekit build` |
| Studio de primera parte | Compila primero FrameKit con `pnpm --filter @mauriciodmo/framekit build` y después ejecuta `pnpm --filter studio check`; `pnpm --filter studio test`; `pnpm --filter studio typecheck`; `pnpm --filter studio lint`; y `pnpm --filter studio build` |
| `@mauriciodmo/create-framekit` o su plantilla | `pnpm --filter @mauriciodmo/create-framekit lint`; `pnpm --filter @mauriciodmo/create-framekit test`; `pnpm --filter @mauriciodmo/create-framekit typecheck`; `pnpm --filter @mauriciodmo/create-framekit build` |
| Documentación | `pnpm --filter docs build` |
| Comportamiento de un paquete público, la CLI o un consumidor generado | Ejecuta el build completo del paquete propietario, `pnpm check:runtime` cuando cambie el contrato del runtime y `pnpm smoke:tarballs` cuando cambie el empaquetado o el comportamiento del consumidor |

Para un cambio entre workspaces, ejecuta `pnpm lint`, `pnpm test`, `pnpm typecheck`
y `pnpm build` desde la raíz. Usa `pnpm test:e2e` para el comportamiento del navegador y
el comando de smoke correspondiente de `tooling/` para el comportamiento de distribución. Consulta
el [flujo de trabajo para contribuidores](/es/contributors/development/workflow) para conocer
el orden de los comandos.
