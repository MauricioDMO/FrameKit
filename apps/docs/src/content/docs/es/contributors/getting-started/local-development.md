---
title: Desarrollo local
description: Instala, compila y ejecuta los workspaces de FrameKit desde la raíz del repositorio.
---

# Desarrollo local

Ejecuta los comandos del repositorio desde la raíz del checkout, a menos que un comando se dirija explícitamente a un workspace. La ruta más corta para un checkout limpio es:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Por qué `pnpm dev` se ejecuta en la raíz

El `package.json` raíz define `pnpm dev` como:

```bash
pnpm --filter @mauriciodmo/framekit build && pnpm --filter studio dev
```

El paquete público `@mauriciodmo/framekit` exporta archivos compilados desde `dist/`, mientras que `apps/studio` consume ese paquete mediante su enlace del workspace. Compilar primero el paquete hace que esas exportaciones estén disponibles antes de que se inicie Studio. Ejecutar `pnpm dev` dentro de un paquete omite este orden a nivel de la raíz.

El comando `framekit dev` de Studio genera los módulos de plantilla actuales antes de iniciar el servidor de desarrollo de Next.js y observa las rutas de origen de la plantilla y de la marca para detectar cambios.

## Propiedad de los workspaces

| Workspace | Responsabilidad |
| --- | --- |
| `apps/studio/` | La aplicación privada de Next.js de primera parte, incluidas sus rutas, integración de la aplicación, plantillas y recursos. |
| `apps/docs/` | El sitio privado de documentación de Astro y Starlight bajo `src/content/docs/`. |
| `packages/framekit/` | El runtime público reutilizable, el editor y los componentes de Studio, las herramientas de servidor y desarrollo, la CLI y la generación de código. |
| `packages/create-framekit/` | La CLI pública para crear proyectos y su plantilla canónica de consumidor generado. |

`Docs/Plans/` y `Docs/skills/` son conocimiento operativo del repositorio fuera de los workspaces publicados.

## Comandos específicos

Ejecuta los comandos siguientes desde la raíz del repositorio. Son scripts definidos por los manifiestos de los workspaces correspondientes.

| Workspace | Comandos específicos útiles |
| --- | --- |
| `@mauriciodmo/framekit` | `pnpm --filter @mauriciodmo/framekit build`; `pnpm --filter @mauriciodmo/framekit lint`; `pnpm --filter @mauriciodmo/framekit test`; `pnpm --filter @mauriciodmo/framekit typecheck` |
| `studio` | `pnpm --filter studio dev`; `pnpm --filter studio check`; `pnpm --filter studio lint`; `pnpm --filter studio test`; `pnpm --filter studio typecheck`; `pnpm --filter studio build`; `pnpm --filter studio start` |
| `@mauriciodmo/create-framekit` | `pnpm --filter @mauriciodmo/create-framekit build`; `pnpm --filter @mauriciodmo/create-framekit lint`; `pnpm --filter @mauriciodmo/create-framekit test`; `pnpm --filter @mauriciodmo/create-framekit typecheck` |
| `docs` | `pnpm --filter docs build`; `pnpm --filter docs preview` |

En un checkout nuevo, compila `@mauriciodmo/framekit` antes de ejecutar pruebas, comprobaciones de tipos u otros comandos específicos de Studio que ejecuten la CLI de FrameKit. `studio start` requiere primero una compilación de producción correcta.

Para ejecutar el servidor de desarrollo de la documentación, sigue `apps/docs/AGENTS.md` y usa `astro dev --background`; adminístralo con `astro dev stop`, `astro dev status` y `astro dev logs`.

## No edites la salida generada

Regenera las salidas a partir de sus fuentes mantenidas en lugar de cambiarlas manualmente:

- `packages/framekit/dist/` es la salida compilada del paquete público.
- En el consumidor canónico, `src/generated/framekit/` contiene registros y enlaces de cliente generados, `public/framekit/` contiene recursos generados copiados y `.framekit/`, incluido `.framekit/next/`, contiene la salida temporal o de compilación de producción.
- `apps/docs/dist/` es el sitio de documentación compilado y `apps/docs/.astro/` contiene archivos generados por Astro.

Estas rutas son salidas ignoradas de compilación o generadas. Las reglas de exclusión raíz cubren las rutas correspondientes `**/dist/`, `**/build/`, `**/out/` y `.framekit`; la aplicación de documentación también excluye sus salidas `dist/` y `.astro/`. Cambia fuentes mantenidas como plantillas, componentes de marca, código fuente de los paquetes o páginas Markdown, y luego vuelve a ejecutar el comando correspondiente.

## Sincronización de skills

`Docs/skills/` es la fuente canónica de las skills internas y públicas del repositorio. Ejecuta:

```bash
pnpm sync:skills
```

El script de sincronización copia las skills internas a `.agents/skills/` y las skills públicas a `packages/create-framekit/template/.agents/skills/`. Edita únicamente `Docs/skills/`; no edites directamente ninguna de las dos copias sincronizadas.

## Continúa

Lee la [guía de arquitectura](/es/contributors/architecture) antes de realizar un cambio que abarque varios workspaces. Después usa la [guía de desarrollo](/es/contributors/development) y sus enlaces a pruebas, distribución, versiones y documentación en lugar de duplicar aquí esos procedimientos. Los contratos dirigidos a consumidores pertenecen a la [documentación para usuarios](/es/users/).
