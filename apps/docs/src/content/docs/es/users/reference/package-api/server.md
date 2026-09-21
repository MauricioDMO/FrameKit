---
title: API del paquete servidor
description: Monta los manejadores opcionales de acceso, de imágenes y de renderizado privado de FrameKit para Node.js.
sidebar:
  order: 9
---

**Importación:** `@mauriciodmo/framekit/server`  
**Entorno:** solo servidor Node.js.

El punto de entrada del servidor exporta el manejador unificado `createFrameKitApiHandler`, los manejadores de acceso y de imágenes, los auxiliares de renderizado, el traspaso privado a la página de renderizado, la preparación de entradas de imagen, los auxiliares de trabajos de renderizado y sus tipos públicos de solicitudes, errores, tokens y trabajos.

## Ejemplo mínimo

Monta el manejador unificado en una ruta catch-all de Next.js del lado del servidor:

```tsx
import { createFrameKitApiHandler } from '@mauriciodmo/framekit/server'
import { templates } from '@framekit/generated/templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const handler = createFrameKitApiHandler(templates)

export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
```

El manejador unificado gestiona las operaciones de acceso cuando
`FRAMEKIT_AUTH_ENABLED=true` y `POST /api/framekit/images/render` en ambos
modos. En el modo abierto las solicitudes de imágenes no necesitan credenciales
y las operaciones de acceso no existen. `createRenderPage` es el traspaso
independiente a la página privada que usa el renderizador PNG del lado del
servidor.

## Restricciones del bundle y del runtime

Este punto de entrada es exclusivo del servidor y no debe incluirse en bundles del navegador ni desplegarse en un runtime Edge. Mantén las credenciales, sesiones, tokens de API que existan y la configuración de renderizado en el servidor. El renderizador requiere que el shell headless de Chromium esté instalado explícitamente; está pensado para un proceso Node.js de larga duración.

Consulta la [API HTTP](/es/users/reference/http-api), la [API de renderizado de imágenes](/es/users/reference/http-api/image-render), la [integración con un proyecto existente](/es/users/getting-started/existing-project) y la [API de desarrollo](/es/users/reference/package-api/dev).
