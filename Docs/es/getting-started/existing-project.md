# Integrar en un proyecto Next.js existente

## Versión alfa

FrameKit se encuentra actualmente en estado alfa/prerelease. Los paquetes aún no están publicados en npm. Esta documentación se actualizará una vez confirmada la publicación.

## Requisitos previos

- Next.js 16 o posterior (pero no Next.js 17).
- React 19 o posterior (pero no React 20).

Los comandos siguientes usan pnpm. El runtime y la CLI de FrameKit no requieren pnpm por sí mismos; usa los comandos equivalentes del gestor de paquetes de tu proyecto.

## Instalar el paquete

Instala `@mauriciodmo/framekit` en tu proyecto Next.js existente:

```bash
pnpm add @mauriciodmo/framekit
```

## Configurar Next.js

Abre `next.config.ts` y establece la opción `output` en `standalone` y la opción `distDir` en `.framekit/next`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: '.framekit/next',
  output: 'standalone',
}

export default nextConfig
```

El modo de salida `standalone` produce una compilación de producción autocontenida. El directorio `.framekit/next` es donde FrameKit coloca los archivos generados durante el desarrollo y la compilación.

## Configurar TypeScript

Abre `tsconfig.json` y agrega el alias de ruta `@framekit/*` dentro de `compilerOptions.paths`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@framekit/*": ["./.framekit/*"]
    }
  }
}
```

Este alias resuelve las importaciones desde `@framekit/generated/templates` hacia `.framekit/generated/templates`, que es donde el comando `framekit generate` escribe el archivo de registro de plantillas generado.

## Agregar estilos

En tu archivo de CSS global (por ejemplo, `src/app/globals.css`), importa la hoja de estilos de FrameKit:

```css
@import "tailwindcss";
@import "@mauriciodmo/framekit/styles.css";
```

Si tu proyecto no usa Tailwind CSS, omite la importación de Tailwind y conserva solo la importación de la hoja de estilos de FrameKit.

## Actualizar el layout raíz

Abre tu archivo de layout raíz (`src/app/layout.tsx` o `src/app/layout.jsx`). Importa `FrameKitStudioRoot` desde `@mauriciodmo/framekit/studio/root` y úsala para envolver el prop `children`:

```tsx
import type { Metadata } from 'next'
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <FrameKitStudioRoot>{children}</FrameKitStudioRoot>
}
```

`FrameKitStudioRoot` es un componente de servidor asíncrono que emite el shell completo del documento: genera o reemplaza `<html>`, `<head>` y `<body>`, y luego renderiza un `FrameKitLocaleProvider` alrededor de tus hijos. Úsalo directamente desde el layout raíz del App Router, que debe seguir siendo un componente de servidor y no debe renderizar otro `<html>`, `<head>` ni `<body>`. Lee el idioma del header `accept-language` y de la cookie del usuario, y aplica la clase de tema claro u oscuro a `<html>`.

## Crear la ruta catch-all del editor

Crea una ruta catch-all en `src/app/editor/[[...slug]]/page.tsx`. Esta página debe ser un componente cliente:

```tsx
'use client'

import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import { templates } from '@framekit/generated/templates'

export default function EditorPage() {
  return <FrameKitStudio templates={templates} />
}
```

`FrameKitStudio` carga la plantilla que coincide con el slug actual, valida su definición y renderiza el editor. Cuando `slug` está vacío, muestra una pantalla de bienvenida.

## Redirigir la página raíz al editor

Abre `src/app/page.tsx` (o `src/app/page.jsx`) y haz que redirija a `/editor`:

```tsx
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/editor')
}
```

## Generar el registro de plantillas

Ejecuta `framekit generate` para descubrir cada plantilla en tu proyecto y escribir el archivo de registro:

```bash
pnpm framekit generate
```

Este comando escribe `.framekit/generated/templates.ts` (resuelto mediante el alias `@framekit/*`). El archivo generado exporta un arreglo de solo lectura llamado `templates`. No edites este archivo; se sobrescribe cada vez que ejecutas `framekit generate` o `pnpm framekit dev`.

## El directorio .framekit

El directorio `.framekit` es completamente desechable. Es creado o regenerado por `framekit generate` y por `pnpm framekit dev`. Puedes eliminarlo sin problema y se reconstruirá automáticamente.

## Diferencias con la configuración de Studio en monorepo

El monorepo de FrameKit en `apps/studio` usa la opción `turbopack.root` de Turbopack apuntando a la raíz del repositorio, lo cual requiere una configuración especial de Next.js:

```ts
turbopack: {
  root: path.resolve(process.cwd(), '../..'),
},
```

Esta configuración es específica de espacios de trabajo de monorepo y no es necesaria en un proyecto independiente creado con `create-framekit` o integrando FrameKit manualmente. Tu proyecto usa la configuración estándar de Next.js mostrada anteriormente.

## Construir

Para crear una compilación de producción, usa el comando `framekit build`:

```bash
pnpm framekit build
```

Este comando primero ejecuta `framekit check` para regenerar el catálogo de plantillas y validar cada definición y locale de plantilla. Si la validación pasa, ejecuta `next build`. Los artefactos standalone y los activos estáticos se copian luego en el directorio de salida.

## Iniciar el servidor de producción

Después de una compilación exitosa, inicia el servidor de producción:

```bash
pnpm framekit start
```

## Variables de entorno

Consulta la [referencia de la CLI](../reference/cli.md#framekit-dev) para la distinción normativa: `framekit dev` procesa `FRAMEKIT_HOST`, `HOST` y `PORT`, mientras [`framekit start`](../reference/cli.md#framekit-start) pasa el entorno heredado al servidor standalone de Next, que gestiona sus propias variables de producción.

## Limitación crítica

Todas las exportaciones de frames (vista previa, descarga, generación de PNG) ocurren completamente en el navegador. FrameKit no es compatible con el renderizado del lado del servidor de frames, y la generación de PNG no ocurre en el servidor bajo ninguna configuración.

---

[English](./../../en/getting-started/existing-project.md)
