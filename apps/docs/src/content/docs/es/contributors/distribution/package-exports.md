---
title: Exportaciones y límites de los paquetes
description: Verifica los puntos de entrada públicos del paquete FrameKit, los destinos de compilación y los límites de importación de los consumidores.
---

# Exportaciones y límites de los paquetes

Los campos `exports`, `files` y `bin` de los manifiestos de los paquetes definen
el contrato de distribución. Los consumidores usan especificadores de paquetes
publicados, no el árbol de código fuente del repositorio ni las rutas internas
de compilación.

## Exportaciones de `@mauriciodmo/framekit`

El paquete actual publica estos puntos de entrada exactos:

| Especificador del consumidor | Clave del manifiesto | Destino de JavaScript | Destino de tipos |
| --- | --- | --- | --- |
| `@mauriciodmo/framekit` | `.` | `./dist/index.js` | `./dist/index.d.ts` |
| `@mauriciodmo/framekit/editor` | `./editor` | `./dist/editor.js` | `./dist/editor.d.ts` |
| `@mauriciodmo/framekit/client` | `./client` | `./dist/client.js` | `./dist/client.d.ts` |
| `@mauriciodmo/framekit/next` | `./next` | `./dist/next.js` | `./dist/next.d.ts` |
| `@mauriciodmo/framekit/studio` | `./studio` | `./dist/studio.js` | `./dist/studio.d.ts` |
| `@mauriciodmo/framekit/studio/root` | `./studio/root` | `./dist/studio-root.js` | `./dist/studio-root.d.ts` |
| `@mauriciodmo/framekit/dev` | `./dev` | `./dist/dev.js` | `./dist/dev.d.ts` |
| `@mauriciodmo/framekit/server` | `./server` | `./dist/server.js` | `./dist/server.d.ts` |
| `@mauriciodmo/framekit/styles.css` | `./styles.css` | `./dist/styles.css` | No aplicable |

Cada exportación de JavaScript tiene el mismo destino `import` y `default` que
se muestra en la tabla, además de su destino `types`. El punto de entrada
`./next` es compatible y es el punto de entrada que usa el `next.config.ts` de
la plantilla canónica:

```ts
import { withFrameKit } from '@mauriciodmo/framekit/next'

export default withFrameKit()
```

El binario del paquete también forma parte de este límite:

```text
framekit -> ./bin/framekit.js
```

La CLI admite `generate`, `check`, `dev`, `build`, `start` y
`browser install [--with-deps]`. Consulta la [referencia de la CLI de
FrameKit](/es/users/reference/cli/framekit) para ver el contrato de los
comandos.

## El límite del paquete creador

`@mauriciodmo/create-framekit` es el segundo y único otro paquete público.
Publica el binario `create-framekit` en `./dist/cli.js` y el directorio
canónico `template/`. Se consume mediante su ejecutable y su plantilla copiada,
no mediante importaciones desde `packages/create-framekit/src/**`.

La plantilla generada importa código reutilizable mediante los puntos de entrada
públicos de FrameKit, por ejemplo:

```ts
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'
import { createFrameKitApiHandler } from '@mauriciodmo/framekit/server'
```

Después de la generación, los enlaces locales del proyecto usan los alias
`@framekit/generated/*`. Son archivos generados del consumidor, no
exportaciones adicionales de FrameKit publicadas.

## Mantén el límite público

Los imports del consumidor, del proyecto generado y de los adaptadores propios
deben usar uno de los especificadores exactos anteriores. Usa
`@framekit/generated/*` únicamente para archivos generados dentro del proyecto
consumidor.

Esto mantiene el contrato público independiente de la disposición del
repositorio y mantiene los grafos de cliente, servidor y herramientas en sus
lados compatibles del límite. La [guía de límites de importación](/es/contributors/development/import-boundaries)
y la [referencia de la API de paquetes para usuarios](/es/users/reference/package-api)
describen la misma regla desde las perspectivas del contribuidor y del
consumidor.

## Compila y audita los destinos

La compilación de FrameKit con `tsdown` tiene una entrada para cada exportación
de JavaScript, además de la entrada de la CLI:

```text
src/index.ts          -> dist/index.js
src/editor.ts         -> dist/editor.js
src/client/index.ts   -> dist/client.js
src/next.ts           -> dist/next.js
src/studio.ts         -> dist/studio.js
src/studio-root.ts    -> dist/studio-root.js
src/dev.ts            -> dist/dev.js
src/server.ts         -> dist/server.js
src/tooling/cli/index.ts -> dist/cli.js
```

La hoja de estilos se compila por separado en `dist/styles.css`. La compilación
del creador usa `src/cli.ts` como entrada de `dist/cli.js`. Al empaquetar el
paquete, su lista `files` incluye el directorio canónico `template/`.
Ejecuta las compilaciones de los paquetes en este orden:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
```

Ambas compilaciones ejecutan `check-dist`, que verifica las importaciones
relativas emitidas y que los destinos `exports` y `bin` del manifiesto sean
archivos existentes dentro del paquete. Después, ejecuta [la prueba del tarball](/es/contributors/testing/e2e-and-smoke)
para inspeccionar los archivos reales, incluidas las referencias del espacio de
trabajo, las rutas locales, los secretos y los artefactos del navegador.
