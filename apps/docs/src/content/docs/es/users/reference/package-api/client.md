---
title: API del paquete cliente
description: Crea el componente cliente utilizado por la página privada de renderizado de FrameKit.
sidebar:
  order: 3
---

**Importación:** `@mauriciodmo/framekit/client`  
**Entorno:** cliente.

Este punto de entrada exporta `createRenderClient`. La función recibe un registro generado (`readonly TemplateRegistryEntry[]`), lo captura y devuelve un componente de renderizado del cliente que acepta el payload privado de renderizado.

## Ejemplo mínimo

Mantén la llamada a la factoría en un módulo marcado con `'use client'`:

```tsx
'use client'

import { createRenderClient } from '@mauriciodmo/framekit/client'
import { templates } from '@framekit/generated/templates'

export const RenderClient = createRenderClient(templates)
```

`@framekit/generated/templates` es el alias del proyecto consumidor generado. Ejecuta `framekit generate` antes de importarlo.

## Restricciones del bundle y del tiempo de ejecución

El punto de entrada contiene un límite de `use client` y utiliza estado y efectos de React del lado del cliente. No lo importes en un módulo exclusivo del servidor como implementación del servidor ni incluyas el registro generado en un bundle del navegador fuera del límite previsto del componente de renderizado.

La [integración de un proyecto existente](/es/users/getting-started/existing-project) muestra la ruta privada de renderizado. La [API del paquete servidor](/es/users/reference/package-api/server) documenta el traspaso del lado del servidor que proporciona su payload.
