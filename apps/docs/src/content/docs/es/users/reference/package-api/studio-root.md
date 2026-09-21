---
title: API del paquete raíz de Studio
description: Añade el shell de documento del servidor y las fábricas de páginas de Studio con autenticación opcional.
sidebar:
  order: 7
---

**Importación:** `@mauriciodmo/framekit/studio/root`  
**Entorno:** solo servidor.

Este punto de entrada exporta `FrameKitStudioRoot`, `createStudioPage` y `createLoginPage`. El componente raíz lee las cookies y las cabeceras de la solicitud, emite el shell completo del documento y proporciona el contexto de configuración regional de Studio. Las fábricas de páginas aplican el límite de sesión de Studio solo cuando `FRAMEKIT_AUTH_ENABLED=true`; el modo abierto deja disponibles `/editor` y `/brand` y oculta `/settings`.

## Ejemplo mínimo

Usa `FrameKitStudioRoot` como shell del documento en un layout del servidor:

```tsx
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'

export default function RootLayout ({ children }: { children: React.ReactNode }) {
  return <FrameKitStudioRoot>{children}</FrameKitStudioRoot>
}
```

Usa `createStudioPage(StudioClient)` para `/editor`, `/brand` y `/settings`, y `createLoginPage()` para `/login`. En el modo autenticado, el componente cliente que se pasa a `createStudioPage` recibe el valor seguro de `StudioUser`; en el modo abierto no recibe usuario para `/editor` y `/brand`.

## Restricciones del paquete y del entorno de ejecución

Este punto de entrada solo funciona en el servidor. `FrameKitStudioRoot` usa las API de solicitudes de Next.js, emite `<html>`, `<head>` y `<body>`, y no debe importarse en código cliente ni anidarse dentro de otro shell de documento. Los módulos de rutas deben usar el entorno de ejecución de Node.js y el renderizado dinámico.

Consulta [la configuración de rutas para proyectos existentes](/es/users/getting-started/existing-project), [Usar Studio](/es/users/guides/use-studio) y la [API de Studio](/es/users/reference/package-api/studio).
