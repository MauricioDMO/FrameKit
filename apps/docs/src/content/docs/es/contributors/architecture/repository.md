---
title: Arquitectura del repositorio
description: Conoce la estructura del monorepo de FrameKit, la responsabilidad de cada workspace, el conocimiento operativo y los límites entre la fuente y la salida generada.
---

# Arquitectura del repositorio

FrameKit es un monorepo privado gestionado con pnpm. El `pnpm-workspace.yaml` de la raíz incluye
`apps/*` y `packages/*`, por lo que los comandos que coordinan los workspaces se
ejecutan desde la raíz del repositorio.

## Mapa del repositorio

```text
FrameKit/
├── apps/
│   ├── docs/                         # sitio de Astro y Starlight
│   └── studio/                       # aplicación privada de primera parte de Next.js
├── packages/
│   ├── framekit/                     # paquete público de runtime y herramientas
│   └── create-framekit/              # creador público y plantilla canónica
├── Docs/
│   ├── Plans/                        # planes operativos y registros de fases
│   └── skills/                       # fuentes canónicas de skills
├── tooling/                          # scripts de mantenimiento del repositorio
├── e2e/                              # pruebas de sistema de Playwright
├── package.json                      # comandos raíz y contrato de runtime
└── pnpm-workspace.yaml               # configuración de workspaces y pnpm
```

Cada uno de los cuatro workspaces tiene una responsabilidad distinta:

| Ruta | Responsabilidad |
| --- | --- |
| `apps/studio/` | Rutas de la aplicación de primera parte, integración de la aplicación, plantillas y recursos. |
| `apps/docs/` | Configuración de la documentación y contenido bajo `src/content/docs/`. |
| `packages/framekit/` | Runtime reutilizable para consumidores, junto con las implementaciones de Editor, Studio, servidor, codegen, servidor de desarrollo y CLI. |
| `packages/create-framekit/` | CLI pública de creación de proyectos y la plantilla canónica que se copia en nuevos proyectos de consumidores. |

`Docs/Plans/` y `Docs/skills/` permanecen fuera de estos workspaces publicados.
Solo los dos paquetes `@mauriciodmo/*` se publican; el workspace raíz y
`apps/studio` son privados.

## Orden de los comandos raíz

El script `pnpm dev` de la raíz compila `@mauriciodmo/framekit` y después inicia
`studio`. Studio resuelve el paquete del workspace a través de sus archivos
`dist/` compilados, por lo que iniciar solo la aplicación puede dejar los
entrypoints del paquete no disponibles en un checkout limpio. Usa la [guía de
desarrollo local](/es/contributors/getting-started/local-development) para
consultar los comandos específicos.

El ciclo de vida a nivel de paquete tiene un orden de dependencia similar:

1. `framekit generate` crea los registros, bindings y assets del proyecto local.
2. `framekit check` genera primero y después valida cada plantilla y variante de contenido.
3. `framekit build` ejecuta `check`, después compila con Next.js y prepara la salida standalone.
4. `framekit start` ejecuta el servidor standalone existente y no genera ni valida el código fuente.

Los scripts raíz `lint`, `test`, `typecheck` y `build` recorren los workspaces
que definen esos scripts. Los scripts de mantenimiento del repositorio viven
en `tooling/`; la lógica de compilación y codegen específica de cada paquete permanece
con su paquete.

## Límites entre la fuente y la salida

El código de consumidores y de proyectos generados importa el paquete a través
de entrypoints publicados como `@mauriciodmo/framekit`,
`@mauriciodmo/framekit/editor`, `@mauriciodmo/framekit/studio/root` y
`@mauriciodmo/framekit/server`. Un consumidor no debe importar
`packages/framekit/src/**` directamente.

Las fuentes mantenidas y la salida generada están deliberadamente separadas:

- El código fuente mantenido de las plantillas se encuentra en `src/templates/` y,
  de forma opcional, el de marca en `src/brand/` dentro de un proyecto consumidor.
- `src/generated/framekit/` y `public/framekit/` contienen archivos generados;
  `.framekit/` contiene archivos temporales y la salida de Next.js, mientras que
  `.framekit-data/` almacena datos de runtime.
- `packages/framekit/dist/`, `apps/docs/dist/` y `apps/docs/.astro/` son salidas de compilación.

Regenera la salida desde la fuente en lugar de corregirla manualmente. Consulta
el [código generado](/es/contributors/architecture/generated-code) para ver los
archivos exactos y los eventos que desencadenan su generación.

## Sincronización de skills

`Docs/skills/` es la fuente canónica de skills. El repositorio sincroniza sus
skills internas con `.agents/skills/` y sus skills públicas con
`packages/create-framekit/template/.agents/skills/`. Edita la fuente bajo
`Docs/skills/` y después ejecuta `pnpm sync:skills`; no edites directamente
ninguna de las copias sincronizadas.
