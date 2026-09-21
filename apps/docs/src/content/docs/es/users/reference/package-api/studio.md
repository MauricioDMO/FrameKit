---
title: API del paquete de Studio
description: Renderiza la superficie de Studio de FrameKit del lado del cliente con registros generados.
sidebar:
  order: 6
---

**Importación:** `@mauriciodmo/framekit/studio`  
**Entorno:** cliente.

Este punto de entrada exporta `FrameKitStudio`, `frameKitMessages` y `getFrameKitLocale`, además de los tipos de marca, sección, usuario, configuración regional y mensajes de Studio. `FrameKitStudio` acepta un catálogo de plantillas generado, un catálogo de marcas o ambos; se requiere al menos un catálogo.

## Ejemplo mínimo

```tsx
'use client'

import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import { templates } from '@framekit/generated/templates'

export function Studio () {
  return <FrameKitStudio templates={templates} />
}
```

El proyecto generado también proporciona `brands` y una vinculación de cliente para las páginas de Studio. La autenticación de esas páginas la controla `FRAMEKIT_AUTH_ENABLED`; Studio elige la variante de contenido predeterminada de la plantilla y la configuración regional de su interfaz es independiente de las claves de variante de la plantilla.

## Restricciones del bundle y del runtime

`FrameKitStudio` es un componente de cliente y depende de la navegación de cliente de Next.js y del estado del navegador. Úsalo detrás de un límite de cliente. La ruta y el shell del documento pertenecen a la [API raíz de Studio](/es/users/reference/package-api/studio-root), mientras que el acceso opcional y las solicitudes de imágenes pertenecen a la [API del servidor](/es/users/reference/package-api/server).

Consulta [Usar Studio](/es/users/guides/use-studio) y el [concepto de Studio](/es/users/concepts/studio).
