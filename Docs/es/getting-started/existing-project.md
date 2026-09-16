# Integrar en un proyecto Next.js existente

## Requisitos previos

- Node.js 22.13.0 o posterior.
- pnpm 11.14.0 o posterior cuando uses pnpm. El manifiesto del paquete no declara un rango de engine para npm.
- Next.js `>=16 <17`.
- React y React DOM `>=19 <20`.

Los comandos siguientes usan pnpm. El creador y la CLI de FrameKit también admiten comandos npm; usa los comandos equivalentes del gestor de paquetes de tu proyecto.

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

El modo de salida `standalone` produce una compilación de producción autocontenida. `.framekit/next` es la salida de build de Next.js; es independiente del registro generado en el código fuente bajo `src/generated/framekit`.

## Configurar TypeScript

Abre `tsconfig.json` y agrega el alias de ruta `@framekit/generated/*` dentro de `compilerOptions.paths`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@framekit/generated/*": ["./src/generated/framekit/*"]
    }
  }
}
```

Este alias resuelve las importaciones desde `@framekit/generated/templates` hacia `src/generated/framekit/templates`, que es donde el comando `framekit generate` escribe el archivo de registro de plantillas generado.

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

`FrameKitStudioRoot` es un componente de servidor asíncrono que genera la estructura completa del documento: `<html>`, `<head>` y `<body>`; luego renderiza un `FrameKitLocaleProvider` alrededor de tus hijos. Úsalo directamente desde el layout raíz del App Router, que debe seguir siendo un componente de servidor y no debe renderizar otro `<html>`, `<head>` ni `<body>`. Lee la configuración regional de la cabecera `accept-language` y del almacén de cookies del usuario, y aplica la clase de tema `dark` a `<html>` cuando corresponde.

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

Este comando escribe `src/generated/framekit/templates.ts` (resuelto mediante el alias `@framekit/generated/*`). El archivo generado exporta `templates: TemplateRegistryEntry[]`; sus entradas contienen `slug`, `segments`, metadata `meta` validada, dimensiones, variantes, `variantKeys` en el orden de declaración, un manifiesto `assets` y funciones `load` lazy. No edites este archivo; el flujo de generación lo sobrescribe.

`pnpm framekit dev`, `pnpm framekit check` y `pnpm framekit build` generan
automáticamente. `pnpm framekit start` no genera y espera una compilación de
producción existente.

## Registro generado y salida de build

El directorio `src/generated/framekit` contiene el registro desechable generado
en el código fuente. Es creado o regenerado por `framekit generate`, `pnpm framekit
dev`, `pnpm framekit check` y `pnpm framekit build`. Puedes eliminarlo sin problema
y se reconstruirá automáticamente. El directorio `.framekit/next` es independiente:
es la salida de build de Next.js producida por el `distDir` configurado, no el
registro de plantillas.

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

Este comando primero ejecuta `framekit check` para regenerar el catálogo de plantillas y validar cada definición de plantilla y variante de contenido. Si la validación pasa, ejecuta `next build`. A continuación, el directorio `public`, cuando está presente, y los activos estáticos se copian junto al servidor standalone.

## Iniciar el servidor de producción

Después de una compilación exitosa, inicia el servidor de producción:

```bash
pnpm framekit start
```

## Variables de entorno

Las siguientes siete variables son leídas por el runtime de acceso y renderizado
de imágenes. La [referencia de la API pública](../reference/public-api.md#handler-api-unificado-de-framekit)
es normativa para el contrato de los handlers de imágenes.

Las opciones de renderizado se leen desde `process.env` en cada solicitud del
handler de imágenes; construir un handler no las lee. La capa de acceso lee la
ruta de la base de datos de forma lazy, y el bootstrap solo lee
`FRAMEKIT_ADMIN_USERNAME` y `FRAMEKIT_ADMIN_PASSWORD` cuando inicializa una base
de datos vacía.

La primera solicitud válida `POST /api/framekit/login` contra una base vacía
ejecuta el bootstrap antes de autenticar las credenciales. Si faltan valores de
bootstrap o no son válidos, la respuesta es `503` y no se guarda ningún usuario.
Cuando ya existe un usuario, los valores de entorno del bootstrap se ignoran y
los datos de la cuenta no se sincronizan desde el entorno.

| Variable | Consumida por | Comportamiento |
| --- | --- | --- |
| `FRAMEKIT_DATABASE_PATH` | Capa de acceso SQLite (`getDatabase`) | Se lee de forma lazy cuando se necesitan datos de acceso. Las rutas relativas se resuelven desde el directorio de trabajo de la aplicación. Por defecto: `.framekit-data/framekit.sqlite`. En producción, configúrala en un volumen o ruta de almacenamiento persistente; la base contiene usuarios, sesiones y tokens API. `:memory:` es local al proceso y no persiste entre reinicios. |
| `FRAMEKIT_ADMIN_PASSWORD` | Bootstrap de una base vacía (`bootstrapUsers`) | Obligatoria cuando se ejecuta el bootstrap del primer usuario. Debe tener entre 12 y 256 bytes UTF-8. No se lee después de que exista cualquier usuario. |
| `FRAMEKIT_ADMIN_USERNAME` | Bootstrap de una base vacía (`bootstrapUsers`) | Se lee solo para el primer usuario. Por defecto es `admin`; de lo contrario debe tener entre 3 y 64 caracteres ASCII entre letras, números, `.`, `_` o `-`. No se lee después de que exista cualquier usuario. |
| `FRAMEKIT_INTERNAL_ORIGIN` | `parseImageRenderConfig` → `renderTemplateImage` | Obligatoria para el renderizado en servidor. Debe ser un origen HTTP de loopback (`localhost`, `127.0.0.1` o `[::1]`), con un puerto numérico opcional y sin credenciales, query, fragmento ni ruta distinta de `/`. El esquema HTTP no distingue mayúsculas de minúsculas. |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | `parseImageRenderConfig` → `prepareRenderInputs` | Opcional; por defecto es un conjunto vacío. Acepta nombres de host DNS exactos separados por comas, recorta, pasa a minúsculas y deduplica las entradas; las vacías se ignoran. Cada hostname puede tener como máximo 253 caracteres; los literales IP, comodines, puntos finales, puertos, rutas, queries y fragmentos son inválidos. Un valor vacío o compuesto solo por comas es válido. Las URLs remotas deben usar HTTPS y un host permitido exacto; las rutas seguras `/assets/...` y `/framekit/templates/...`, además de las data URLs, siguen disponibles. |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | `parseImageRenderConfig` → límite de capacidad de renderizado | Opcional; por defecto es `2`. Debe ser un string de dígitos decimales en el rango inclusivo `1..32`; los valores inválidos hacen fallar la configuración. Las solicitudes que superan el límite de renders simultáneos dentro del proceso fallan con un error de capacidad. |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | `parseImageRenderConfig` → plazo de la solicitud y operaciones del navegador | Opcional; por defecto es `30000` ms. Debe ser un string de dígitos decimales en el rango inclusivo `1..120000`; los valores inválidos hacen fallar la configuración. Limita el plazo de la solicitud de imágenes y las operaciones del navegador. |

`FRAMEKIT_PUBLIC_ORIGIN` no es compatible y el runtime actual no la lee; no es
un fallback ni una variable de configuración de origen.
La ruta canónica es la única ruta de API de imágenes admitida y usa una sesión o
un token API de la base de datos para autenticarse.

Detrás de un reverse proxy, el handler de acceso y las solicitudes de imágenes
autenticadas por cookie obtienen el origen canónico a partir de un par validado
de `x-forwarded-proto` y `x-forwarded-host`. Si se presenta cualquiera de los
dos headers, ambos deben estar presentes con un único valor válido. Configura el
proxy para sobrescribir o eliminar los headers de forwarding enviados por el
cliente; usa un único valor válido `x-forwarded-proto: https` y una única
autoridad válida en `x-forwarded-host` para el origen HTTPS público. Las
solicitudes directas usan la URL de la solicitud y, para los hosts wildcard
predeterminados, la autoridad `Host` validada. Un par de forwarding HTTP solo se
acepta para los casos de origen interno o wildcard validado; los reverse proxy
públicos deben usar HTTPS. `FRAMEKIT_PUBLIC_ORIGIN` no se usa.

Consulta la [referencia de la CLI](../reference/cli.md#framekit-dev) para el
comportamiento separado de los procesos: `framekit dev` procesa
`FRAMEKIT_HOST`, `HOST` y `PORT`, mientras [`framekit start`](../reference/cli.md#framekit-start)
pasa el entorno heredado al servidor standalone de Next.

## Límites de renderizado

La vista previa de Studio permanece local, mientras Download PNG y Copy PNG usan
la API de imágenes exclusiva de Node.js
`POST /api/framekit/images/render` mediante el adapter unificado
`createFrameKitApiHandler`. La ruta delega en el handler de imágenes de Studio y
acepta una cookie `framekit_session` activa o
`Authorization: Bearer <API_TOKEN>`; las solicitudes autenticadas por cookie
deben ser del mismo origen. Download PNG y Copy PNG solicitan sus bytes PNG a
esta ruta canónica. Instala explícitamente el headless shell de Chromium con
`framekit browser install` antes de servir solicitudes. La ruta anterior
`/api/v1/images` devuelve `404`. El handoff privado de trabajo/página sigue
siendo un detalle interno de esa API
y de la página de renderizado generada.

---

[English](./../../en/getting-started/existing-project.md)
