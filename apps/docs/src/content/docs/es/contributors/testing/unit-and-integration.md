---
title: Pruebas unitarias y de integración
description: Ejecuta las suites de Vitest, coloca las pruebas en el árbol correcto y selecciona las comprobaciones enfocadas del workspace.
---

# Pruebas unitarias y de integración

Ejecuta estos comandos desde la raíz del repositorio. Los tres workspaces de
runtime usan Vitest, pero cada workspace es responsable de una parte distinta de
la superficie de pruebas.

## Comandos específicos

### FrameKit

```bash
pnpm --filter @mauriciodmo/framekit test
```

Esto ejecuta las suites anidadas de Vitest del paquete público. El entorno
predeterminado en `packages/framekit/vitest.config.ts` es Node, y
`packages/framekit/vitest.setup.ts` instala el `ResizeObserver` de pruebas. Las suites
de componentes de React optan por `jsdom` cuando necesitan un DOM y usan
archivos como `*.test.tsx` bajo el directorio `__tests__/` más cercano.

Para ejecutar las suites específicas de descubrimiento y generación de código
que usa el trabajo de CI de Windows, ejecuta:

```bash
pnpm --filter @mauriciodmo/framekit exec vitest run src/tooling/discovery src/tooling/codegen
```

### Studio

```bash
pnpm --filter studio test
```

El script de Studio ejecuta `framekit generate` antes de `vitest run`. Esto
mantiene actualizados los bindings generados para las pruebas de Studio. Desde
un checkout limpio, compila primero el paquete público:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter studio test
```

Las suites actuales de integración de Studio bajo
`apps/studio/src/__tests__/framekit/` cubren la generación desde un proyecto
aislado, los adaptadores de aplicación y la página privada de renderizado. Se
ejecutan mediante Vitest; no sustituyen las pruebas de Chromium del servidor de
producción.

### create-framekit

```bash
pnpm --filter @mauriciodmo/create-framekit test
```

Estas suites cubren los requisitos de runtime del creador y el comportamiento
de los helpers del proyecto, incluida la creación de proyectos temporales y las
rutas de error. El comportamiento del consumidor que depende de artefactos
empaquetados pertenece a la ruta smoke del tarball.

## Todas las pruebas de runtime

```bash
pnpm test
```

El script raíz ejecuta recursivamente el script `test` en cada workspace que lo
define. No ejecuta las pruebas E2E de Playwright ni los scripts smoke de
distribución.

## Qué probar en este nivel

Usa pruebas unitarias para un contrato o algoritmo individual de runtime: la
validación de campos y plantillas, la resolución de datos, los límites de las
solicitudes al servidor, el comportamiento de acceso, el descubrimiento, los
helpers de generación de código o el manejo de argumentos de la CLI son ejemplos
actuales.

Usa pruebas de componentes para el renderizado y la interacción de React en el
DOM de pruebas. El paquete FrameKit tiene suites a nivel de archivo con
`// @vitest-environment jsdom` para controles del editor, componentes de Studio,
navegación, almacenamiento local y comportamientos relacionados. Esta es
cobertura de un DOM simulado, no una ejecución en un navegador real.

Usa pruebas de integración cuando el comportamiento atraviesa módulos, código
fuente generado, adaptadores de aplicación o un límite de proceso. Mantén la
prueba en el workspace responsable de ese límite. La instalación, compilación y
ruta de inicio independiente de un consumidor generado son cuestiones de
distribución y están cubiertas por la [guía del consumidor generado](/es/contributors/distribution/generated-consumer).

## Reglas de ubicación

- Coloca las pruebas de runtime bajo el directorio `__tests__/` más cercano, no junto al archivo de implementación.
- Replica el dominio de producción bajo ese directorio, como
  `packages/framekit/src/core/validation/__tests__/definition/` o
  `packages/framekit/src/tooling/cli/__tests__/`.
- Vitest descubre recursivamente los archivos anidados `*.test.ts` y `*.test.tsx`.
- Conserva los fixtures compartidos de runtime dentro del árbol `__tests__/` correspondiente.
- No crees un directorio genérico de pruebas a nivel de paquete ni pongas helpers exclusivos de pruebas en directorios de código fuente de producción.

La página de [convenciones de código](/es/contributors/development/coding-conventions)
también documenta el alias de pruebas configurado `@/*` y la regla de actualizar
juntos los resolvedores de TypeScript y Vitest cuando cambia un alias.

## Los fixtures de tipos están separados

`packages/framekit/type-tests/` contiene casos de contratos en tiempo de
compilación, no pruebas de runtime. Sus directorios abarcan fields, templates,
entrypoints de la API pública e integraciones de Next.js o Studio. Los casos
positivos deben comprobarse mediante el sistema de tipos; los casos negativos
usan `@ts-expect-error` para el error que requiere el contrato.

El paquete FrameKit ejecuta tanto su comprobación de tipos normal como el
proyecto de fixtures:

```bash
pnpm --filter @mauriciodmo/framekit typecheck
```

El comando raíz ejecuta esa comprobación del paquete junto con los demás scripts
de comprobación de tipos de los workspaces:

```bash
pnpm typecheck
```

## Límites

Las suites de Vitest pueden demostrar contratos de runtime y de componentes sin
demostrar que un servidor de producción de Next.js, un navegador Chromium real
o un paquete publicado funcione de extremo a extremo. Añade [pruebas E2E del
navegador](/es/contributors/testing/e2e-and-smoke) para la ruta crítica de
Studio en producción y la prueba smoke de distribución correspondiente para
consumidores empaquetados.
