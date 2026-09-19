---
title: Integración continua
description: Comprende las comprobaciones de CI de FrameKit, los carriles por sistema operativo y la matriz de versiones de Node.js.
---

# Integración continua

El flujo de trabajo de `.github/workflows/ci.yml` se ejecuta en pushes y pull requests.
Usa pnpm `11.14.0` y mantiene separadas las comprobaciones del repositorio de
los scripts de smoke de la publicación.

## Contrato del runtime

El primer paso del carril de verificación es:

```bash
pnpm check:runtime
```

Comprueba que los manifiestos raíz y de los paquetes coincidan en los engines de
Node.js y pnpm, que el valor raíz de `packageManager` coincida con la versión de
pnpm fijada, que la documentación del runtime contenga las versiones declaradas
y que el flujo de trabajo de CI contenga el contrato esperado de Node.js y pnpm. No
instala dependencias ni ejecuta pruebas.

Ejecútalo localmente al cambiar las versiones del runtime, los manifiestos, la
matriz de CI o la documentación cubierta por ese contrato.

## Matriz de verificación de Linux

El job `verify` se ejecuta en `ubuntu-latest` tanto para Node.js `22.13.0` como
para Node.js `24`. Cada entrada de la matriz instala las dependencias con el
lockfile y ejecuta las mismas comprobaciones:

1. Compilar `@mauriciodmo/framekit`.
2. Compilar `@mauriciodmo/create-framekit`.
3. Ejecutar `pnpm lint`.
4. Ejecutar `pnpm test`.
5. Ejecutar `pnpm typecheck`.
6. Ejecutar `pnpm build`.
7. Hacer un dry-run del empaquetado de ambos paquetes públicos.

Los comandos raíz tienen estas responsabilidades:

| Comando | Propósito en CI |
| --- | --- |
| `pnpm lint` | Ejecutar los scripts recursivos de ESLint para los workspaces que los definan. |
| `pnpm test` | Ejecutar los scripts recursivos de Vitest; no es el comando E2E de Playwright. |
| `pnpm typecheck` | Ejecutar las comprobaciones de TypeScript de los workspaces, incluidos los fixtures de tipos en tiempo de compilación de FrameKit. |
| `pnpm build` | Ejecutar los scripts de build de los workspaces después de compilar los prerrequisitos de los paquetes públicos. |

Las compilaciones iniciales de los paquetes públicos son explícitas porque los
comandos de Studio y del consumidor generado resuelven los archivos compilados
de `@mauriciodmo/framekit`.

## Carril de consumidor en Windows

El job `windows-smoke-test` se ejecuta en `windows-latest` con Node.js
`22.13.0`. Instala las dependencias, compila el paquete público y el creador,
ejecuta las rutas de Vitest de descubrimiento/generación de código y las pruebas
del creador, y ejecuta `pnpm typecheck`.

Después crea un consumidor con el creador compilado, instala un tarball de
FrameKit empaquetado localmente en ese consumidor, ejecuta `framekit generate` y
`framekit check`, y verifica ambos tarballs de paquetes con `pack --dry-run`.

Esta es una ruta enfocada en consumidores generados y empaquetado en Windows.
No afirma que exista una matriz completa de producción, navegador o pruebas
visuales en Windows.

## Carril E2E de Chromium

El job `chromium-e2e` se ejecuta en `ubuntu-latest` con Node.js `22.13.0`. Hace
lo siguiente:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

El servidor web de Playwright compila FrameKit, compila Studio e inicia el
servidor de producción de Studio antes de ejecutar las pruebas. Consulta
[Pruebas E2E y smoke](/es/contributors/testing/e2e-and-smoke) para conocer los
dos flujos actuales del navegador y sus límites.

## Lo que CI no ejecuta

El flujo de trabajo no ejecuta `pnpm smoke:tarballs` ni `pnpm smoke:docker`. El smoke del
tarball es una comprobación independiente de artefactos previa a la publicación,
y el smoke de Docker requiere una versión exacta del paquete publicado. CI
tampoco añade snapshots visuales, exportación al portapapeles ni gates de
Firefox/WebKit.

Usa el [flujo de trabajo para contribuidores](/es/contributors/development/workflow)
para las comprobaciones locales enfocadas y la [guía de funcionalidades](/es/contributors/development/adding-features)
para decidir cuándo un cambio necesita pruebas más amplias o verificación de
distribución.
