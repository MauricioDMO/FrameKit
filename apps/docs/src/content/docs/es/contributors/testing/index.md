---
title: Pruebas para contribuidores
description: Elige el nivel de pruebas de FrameKit y el comando de verificación que correspondan a un cambio del repositorio.
---

# Pruebas para contribuidores

Ejecuta los comandos del repositorio desde la raíz del checkout de FrameKit. Cada nivel de pruebas responde
a una pregunta diferente; aprobar un nivel no sustituye a los demás.

## Niveles de pruebas

| Nivel | Ubicación principal | Qué demuestra | Comando principal |
| --- | --- | --- | --- |
| Unitarias | El árbol `__tests__/` más cercano dentro de un paquete | Un comportamiento específico de runtime, validación, servidor, tooling o CLI | El script `test` del workspace propietario |
| Componentes | Pruebas de React bajo el árbol `__tests__/` más cercano | Renderizado e interacción de componentes en el entorno de pruebas DOM configurado | `pnpm --filter @mauriciodmo/framekit test` |
| Integración | Pruebas de integración del workspace y suites de Vitest entre módulos | Comportamiento entre módulos, código fuente generado, adaptadores o un proceso hijo | El script `test` del workspace propietario |
| Fixtures de tipos | `packages/framekit/type-tests/` | Contratos públicos de TypeScript, incluidos los errores esperados | `pnpm typecheck` |
| E2E | `e2e/` a nivel del repositorio | Rutas críticas de Studio y de la API de imágenes en una compilación de producción con Chromium | `pnpm test:e2e` |
| Smoke | `tooling/smoke-tarballs.mjs` y `tooling/smoke-docker.mjs` | Comportamiento del consumidor empaquetado y del contenedor fuera del checkout | `pnpm smoke:tarballs` o `pnpm smoke:docker -- <exact-published-framekit-version>` |

Las pruebas unitarias, de componentes y de integración usan Vitest. Los archivos de componentes que necesitan un
DOM optan por `jsdom` mediante un comentario de entorno de Vitest a nivel de archivo; las configuraciones de los
paquetes usan Node de forma predeterminada. Los fixtures de tipos son pruebas en tiempo de compilación,
no pruebas de Vitest.

## Elegir un comando

Usa el comando enfocado del workspace mientras cambias un área y, después, las comprobaciones de la raíz cuando el
cambio atraviese los límites del workspace o del paquete público:

```bash
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
pnpm test
pnpm typecheck
pnpm test:e2e
```

Desde un checkout limpio, compila `@mauriciodmo/framekit` antes de ejecutar pruebas enfocadas de Studio,
comprobaciones de tipos u otros comandos que ejecuten la CLI de FrameKit. El [flujo de trabajo para contribuidores](/es/contributors/development/workflow)
documenta el orden que empieza por compilar el paquete.

## Añadir cobertura con un cambio

Coloca las pruebas de runtime debajo del directorio `__tests__/` más cercano y refleja el dominio de producción.
Mantén los fixtures de runtime compartidos en ese árbol de pruebas. Coloca los fixtures de contratos públicos en
tiempo de compilación únicamente bajo `packages/framekit/type-tests/`, agrupados por contexto. Coloca los flujos de
trabajo del navegador en el directorio `e2e/` a nivel del repositorio.

La página de [convenciones de código](/es/contributors/development/coding-conventions) contiene las reglas sobre
ubicación, alias y límites de importación. La [guía de funcionalidades](/es/contributors/development/adding-features)
relaciona los tipos de cambios con la prueba útil más pequeña y con las validaciones más amplias.

## Límites de cobertura

La suite actual no proporciona cobertura de regresión visual o comparación de píxeles, una matriz completa de
navegadores Firefox/WebKit ni una validación del portapapeles. La ruta E2E de Chromium cubre flujos críticos,
no todas las interacciones de Studio. Las pruebas smoke de tarball y Docker validan los contratos de distribución
y despliegue; la prueba smoke de Docker es una comprobación operativa de publicación, no una prueba unitaria.
