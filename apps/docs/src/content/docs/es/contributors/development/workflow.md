---
title: Flujo de trabajo para contribuidores
description: Sigue el checkout de FrameKit, los comandos específicos, las reglas para la salida generada y el flujo de sincronización de skills.
---

# Flujo de trabajo para contribuidores

Ejecuta los comandos del repositorio desde la raíz del checkout de FrameKit. La
página de [requisitos previos para colaboradores](/es/contributors/getting-started/prerequisites) enumera las
versiones compatibles de Node.js y pnpm. La [guía de desarrollo
local](/es/contributors/getting-started/local-development) explica la propiedad
de los workspaces y el primer inicio de Studio.

## Comenzar desde la raíz

Para un checkout limpio, instala exactamente lo que especifica el lockfile:

```bash
pnpm install --frozen-lockfile
```

Ejecuta la comprobación del contrato del runtime cuando cambies versiones,
manifiestos, CI o los requisitos documentados del runtime:

```bash
pnpm check:runtime
```

El comando normal de desarrollo de primera parte también se ejecuta únicamente
desde la raíz:

```bash
pnpm dev
```

El script raíz compila `@mauriciodmo/framekit` antes de iniciar el workspace
privado `studio`. Este orden hace que las exportaciones `dist/` del paquete
estén disponibles para Studio.

## Usar primero los comandos específicos

Comienza con los comandos del workspace que es propietario del cambio:

| Workspace | Comandos específicos |
| --- | --- |
| `@mauriciodmo/framekit` | `pnpm --filter @mauriciodmo/framekit build`; `pnpm --filter @mauriciodmo/framekit lint`; `pnpm --filter @mauriciodmo/framekit test`; `pnpm --filter @mauriciodmo/framekit typecheck` |
| `studio` | `pnpm --filter studio check`; `pnpm --filter studio lint`; `pnpm --filter studio test`; `pnpm --filter studio typecheck`; `pnpm --filter studio build`; `pnpm --filter studio start` |
| `@mauriciodmo/create-framekit` | `pnpm --filter @mauriciodmo/create-framekit build`; `pnpm --filter @mauriciodmo/create-framekit lint`; `pnpm --filter @mauriciodmo/create-framekit test`; `pnpm --filter @mauriciodmo/create-framekit typecheck` |
| `docs` | `pnpm --filter docs build`; `pnpm --filter docs preview` |

Los comandos de la tabla son scripts de los manifiestos de los workspaces. En
un checkout limpio, compila `@mauriciodmo/framekit` antes de las pruebas,
comprobaciones de tipos o comandos específicos de Studio que ejecuten la CLI de
FrameKit. Inicia un servidor de producción solo después de una
compilación correcta:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter studio build
pnpm --filter studio start
```

Cuando un cambio abarque varios workspaces, ejecuta también las comprobaciones
de la raíz:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

Actualmente, CI verifica Node.js `22.13.0` y `24` en Linux, ejecuta una ruta de
smoke test de consumidor en Windows con Node.js `22.13.0` y ejecuta E2E de
Chromium en Linux.

## Mantener desechable la salida generada

Cambia la fuente mantenida y regenera sus salidas. No edites manualmente estas
rutas:

- `packages/framekit/dist/` y otros directorios `dist/` de paquetes;
- `apps/docs/dist/` y `apps/docs/.astro/`;
- `src/generated/framekit/` y `public/framekit/` de un proyecto consumidor; y
- `.framekit/`, `.framekit/next/` u otra salida de compilación ignorada de un
  proyecto consumidor.

El `.framekit-data/` de un proyecto consumidor es almacenamiento persistente de
runtime para la base de datos de acceso SQLite, no una salida generada
desechable. Consérvalo entre reinicios y despliegues cuando la ruta de la base
de datos use ese directorio. No lo elimines como parte de la regeneración;
cambia la fuente mantenida y regenera únicamente las rutas de salida
desechables indicadas arriba.

Para cambios de plantillas o de marca, usa `framekit generate` para regenerar
registros, clientes y assets copiados. `framekit check` genera antes de
validar; `framekit build` comprueba antes de compilar; `framekit dev` genera
antes de observar cambios; y `framekit start` usa la salida de producción
existente sin generar. Consulta [código generado](/es/contributors/architecture/generated-code)
para ver el flujo de fuente a salida.

## Sincronizar las skills desde su fuente

`Docs/skills/` es la fuente mantenida de las skills del repositorio y de la
plantilla. Ejecuta el script raíz después de cambiar una skill:

```bash
pnpm sync:skills
```

El script copia las skills internas a `.agents/skills/` y las skills públicas a
`packages/create-framekit/template/.agents/skills/`. Edita únicamente
`Docs/skills/`; los dos directorios de destino son copias sincronizadas. El hook
pre-commit ejecuta `pnpm lint`, después `pnpm sync:skills` y añade esos destinos
sincronizados al staging.
