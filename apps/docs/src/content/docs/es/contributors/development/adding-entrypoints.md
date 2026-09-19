---
title: Añadir puntos de entrada de paquetes
description: Alinea las fachadas de código fuente, las entradas de tsdown, las exportaciones de paquetes, los binarios y las comprobaciones del contrato público de FrameKit.
---

# Añadir puntos de entrada de paquetes

Un punto de entrada es un contrato público, no solo otro archivo fuente. Actualiza la
fachada de código fuente, la entrada de compilación, el manifiesto del paquete y
la cobertura del contrato conjuntamente. La página de [arquitectura de
paquetes](/es/contributors/architecture/packages) describe los límites de
responsabilidad.

## Sigue el mapa de compilación actual

El mapa de puntos de entrada de `packages/framekit/tsdown.config.ts` y las exportaciones
de `packages/framekit/package.json` están alineados actualmente de la siguiente
manera:

| Especificador del consumidor | Entrada de código fuente | Destino compilado |
| --- | --- | --- |
| `@mauriciodmo/framekit` | `src/index.ts` | `dist/index.js` y `dist/index.d.ts` |
| `@mauriciodmo/framekit/editor` | `src/editor.ts` | `dist/editor.js` y `dist/editor.d.ts` |
| `@mauriciodmo/framekit/client` | `src/client/index.ts` | `dist/client.js` y `dist/client.d.ts` |
| `@mauriciodmo/framekit/next` | `src/next.ts` | `dist/next.js` y `dist/next.d.ts` |
| `@mauriciodmo/framekit/studio` | `src/studio.ts` | `dist/studio.js` y `dist/studio.d.ts` |
| `@mauriciodmo/framekit/studio/root` | `src/studio-root.ts` | `dist/studio-root.js` y `dist/studio-root.d.ts` |
| `@mauriciodmo/framekit/dev` | `src/dev.ts` | `dist/dev.js` y `dist/dev.d.ts` |
| `@mauriciodmo/framekit/server` | `src/server.ts` | `dist/server.js` y `dist/server.d.ts` |
| `@mauriciodmo/framekit/styles.css` | `src/styles.css` mediante `build:css` | `dist/styles.css` |

Las exportaciones de JavaScript usan destinos `types`, `import` y `default` en
el manifiesto público. La exportación de la hoja de estilos es un destino de
archivo directo. El binario `framekit` se configura por separado de las
exportaciones para importación: `bin/framekit.js` carga `dist/cli.js`, que se
compila a partir de `src/tooling/cli/index.ts`.

El paquete `@mauriciodmo/create-framekit` tiene una única entrada de compilación,
`src/cli.ts`, y el binario de su manifiesto apunta `create-framekit` a
`dist/cli.js`.

## Añade un punto de entrada siguiendo este orden

1. Añade o actualiza la pequeña fachada de código fuente. Exporta solo los
   símbolos que pertenecen a ese límite público y conserva directivas del
   cliente como `'use client'`.
2. Añade la clave correspondiente a `packages/framekit/tsdown.config.ts`, o
   actualiza la configuración de compilación del paquete responsable. Mantén el
   nombre base de salida alineado con el destino del manifiesto.
3. Añade la entrada `exports` de `package.json` con sus destinos de tipos y
   runtime. Actualiza `bin` solo para un binario de comandos, no para un
   punto de entrada de importación.
4. Añade pruebas de runtime bajo el árbol `__tests__/` más cercano y fixtures
   públicos de TypeScript bajo `packages/framekit/type-tests/` cuando el contrato
   exportado tenga tipos. Importa el fixture mediante el especificador público
   del paquete.
5. Compila e inspecciona el paquete antes de probar un consumidor:

   ```bash
   pnpm --filter @mauriciodmo/framekit build
   pnpm --filter @mauriciodmo/framekit typecheck
   pnpm --filter @mauriciodmo/framekit test
   ```

La compilación del paquete ejecuta `check:dist`. Esa comprobación verifica que
existan todos los destinos de `exports` y `bin` del manifiesto, y que las
importaciones relativas en `dist/` permanezcan dentro del paquete. La
comprobación de tipos también incluye el proyecto de type-tests de FrameKit.

## Verifica la estructura publicada

Usa la simulación de empaquetado del paquete y las comprobaciones del consumidor
cuando un cambio afecte a un punto de entrada público:

```bash
pnpm --filter @mauriciodmo/framekit pack --dry-run
pnpm smoke:tarballs
```

La comprobación smoke del tarball verifica la resolución de exportaciones
públicas, los destinos del paquete, el aislamiento de cliente y servidor, el
consumidor generado y las rutas de `framekit generate`, `check`, `build` y
`start`. No consideres que una importación correcta desde el código fuente
demuestre que el paquete empaquetado funciona. Consulta [los límites de
importación](/es/contributors/development/import-boundaries) para conocer los
límites de consumidor compatibles.
