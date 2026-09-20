---
title: Convenciones de código
description: Aplica las convenciones de formato, ubicación de pruebas, alias y límites de importación de FrameKit al cambiar código.
---

# Convenciones de código

Sigue la configuración compartida de ESLint Standard del repositorio antes de añadir
reglas de estilo locales. La página de [límites de importación](/es/contributors/development/import-boundaries) describe las reglas de las capas de runtime que acompañan a estas convenciones.

## Formatea el código de forma coherente

El JavaScript y TypeScript analizados por el linter usan el contrato actual de Standard:

- indentación de dos espacios;
- comillas simples;
- sin punto y coma;
- sin comas finales; y
- un salto de línea final.

Las reglas compartidas se encuentran en `tooling/eslint-standard.mjs`. Las configuraciones de ESLint de los paquetes combinan esa configuración con sus reglas específicas de Next.js. Ejecuta el script de lint del workspace propietario y luego el lint de la raíz cuando el cambio abarque varios workspaces:

```bash
pnpm --filter @mauriciodmo/framekit lint
pnpm lint
```

## Coloca las pruebas bajo el árbol de pruebas más cercano

Las pruebas de runtime deben estar bajo el directorio `__tests__/` más cercano, no junto al archivo de implementación. Replica el dominio de producción debajo de ese directorio. Por ejemplo, las pruebas de validación del core de FrameKit se encuentran bajo
`packages/framekit/src/core/validation/__tests__/`, mientras que las pruebas de la CLI se encuentran bajo
`packages/framekit/src/tooling/cli/__tests__/`.

Usa los límites de pruebas existentes en el repositorio:

- Vitest descubre archivos anidados `*.test.ts` y `*.test.tsx`;
- los fixtures de contratos públicos en tiempo de compilación de FrameKit viven únicamente bajo
  `packages/framekit/type-tests/`, agrupados por contexto como `public-api/`,
  `fields/`, `templates/` o `integrations/`; y
- las pruebas de sistema del navegador viven bajo el directorio `e2e/` del repositorio y
  se ejecutan mediante Playwright.

Conserva los fixtures compartidos de las pruebas de runtime dentro del árbol `__tests__/` correspondiente. No crees un directorio genérico de pruebas a nivel de paquete ni pongas helpers exclusivos de pruebas en directorios de código fuente de producción.

## Usa deliberadamente los alias configurados

Las pruebas locales del paquete pueden usar el alias configurado `@/*`:

```typescript
import { createThing } from '@/domain/create-thing'
```

En este repositorio, `@/*` se asigna a `src/*` en `packages/framekit/`,
`packages/create-framekit/`, `apps/studio/` y la plantilla generada. Al añadir o
cambiar un alias, actualiza tanto `compilerOptions.paths` como el resolvedor del
runner de pruebas. Un alias solo de TypeScript no basta en runtime.

Conserva el estilo de importaciones relativas existente en el código de implementación a menos que la configuración de compilación del paquete admita el nuevo alias. Los módulos de consumidores generados usan el límite configurado `@framekit/generated/*`; no importan archivos fuente de FrameKit.

## Respeta los límites de importación

El código dirigido a consumidores importa los entrypoints del paquete publicado, por ejemplo:

```typescript
import { defineTemplate } from '@mauriciodmo/framekit'
import { TemplateCanvas } from '@mauriciodmo/framekit/editor'
```

El código orientado al consumidor debe mantenerse en los entrypoints publicados. Mantén el código cliente fuera de la fachada de servidor y los módulos integrados de Node y las dependencias de Playwright en Server o Tooling. Usa las páginas de [arquitectura de paquetes](/es/contributors/architecture/packages) y [límites de importación](/es/contributors/development/import-boundaries) cuando un cambio cruce un límite público o de capa de runtime.

Los registros generados, los recursos copiados y la salida de compilación son resultados, no una segunda implementación. Cambia su fuente mantenida y vuelve a generarlos en lugar de editar directamente los archivos generados.
