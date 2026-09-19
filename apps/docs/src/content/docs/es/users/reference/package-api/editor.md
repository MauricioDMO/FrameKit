---
title: API del paquete del editor
description: Usa el editor y los componentes de navegación del lado del cliente de FrameKit.
sidebar:
  order: 4
---

**Importación:** `@mauriciodmo/framekit/editor`  
**Entorno:** cliente.

El punto de entrada del editor exporta `FrameKitEditor`, `TemplateCanvas`, `FrameKitNavigation`, `humanizeSegment`, `manifestToNavigation`, `toast`, `ErrorToast`, `InfoToast` y `SuccessToast`. También exporta `EditorMessages`, los tipos de navegación `TemplateNavigationFolder`, `TemplateNavigationItem` y `TemplateNavigationNode`, y los tipos de notificaciones `BasicToastProps`, `ToastOptions` y `ToastPosition`.

## Ejemplo mínimo

`manifestToNavigation` convierte las entradas de plantillas generadas en nodos para el árbol de navegación del cliente:

```tsx
'use client'

import { FrameKitNavigation, manifestToNavigation } from '@mauriciodmo/framekit/editor'
import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

export function Navigation ({ templates }: { templates: readonly TemplateRegistryEntry[] }) {
  const nodes = manifestToNavigation(templates)
  return (
    <nav>
      {nodes.map((node) => <FrameKitNavigation key={node.id} node={node} />)}
    </nav>
  )
}
```

En cambio, `FrameKitEditor` recibe una entrada del registro, su definición cargada, un catálogo `EditorMessages` y, opcionalmente, `sidebarCollapsed`. `TemplateCanvas` representa una definición con las dimensiones que esta declara.

## Restricciones del paquete y del entorno de ejecución

Este punto de entrada se ejecuta del lado del cliente: sus componentes interactivos usan el estado de React y, para la navegación, la navegación del cliente de Next.js y el almacenamiento del navegador. Mantenlo detrás de un límite de cliente y no lo uses como un manejador de rutas exclusivo del servidor.

Consulta [Usar Studio](/es/users/guides/use-studio), [representación de plantillas](/es/users/concepts/templates/rendering) y la [API del paquete Studio](/es/users/reference/package-api/studio).
