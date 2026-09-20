---
title: Estructura del proyecto
description: Comprende los archivos canónicos, las rutas, los alias y la salida generada de un proyecto de FrameKit.
sidebar:
  order: 4
---

`create-framekit` genera un proyecto de Next.js con App Router. Las siguientes rutas contienen código fuente o configuración que se mantiene; los archivos generados son desechables por diseño.

## Estructura canónica

```text
my-project/
├── src/
│   ├── app/
│   │   ├── [section]/[[...slug]]/page.tsx
│   │   ├── api/framekit/[...action]/route.ts
│   │   ├── framekit/render/[id]/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── login/page.tsx
│   ├── profile.ts
│   ├── templates/
│   │   └── example/
│   │       ├── assets/
│   │       └── template.tsx
│   └── generated/framekit/
│       ├── brands.ts
│       ├── render-client.tsx
│       ├── studio-client.tsx
│       └── templates.ts
├── public/framekit/
├── .framekit/
├── .env.example
├── Dockerfile
├── next.config.ts
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

El creador elimina `pnpm-workspace.yaml` cuando se selecciona npm. Los seis archivos mantenidos bajo `src/app/` son la estructura base de la aplicación, la ruta catch-all de Studio, la ruta de inicio de sesión, la ruta de API, la ruta privada de renderizado y la hoja de estilos global.

## Código fuente mantenido

- `src/templates/` contiene plantillas detectables. Un directorio con un `template.tsx` que exporta un valor predeterminado se registra automáticamente.
- `src/brand/` es opcional y contiene componentes de marca reutilizables cuando el proyecto los necesita.
- `src/profile.ts` es información pública opcional del proyecto que las plantillas pueden usar. Conserva únicamente valores que sea seguro mostrar en imágenes.
- `src/app/layout.tsx` envuelve la aplicación con `FrameKitStudioRoot`.
- `next.config.ts` usa `withFrameKit()` para configurar la salida de compilación y la redirección raíz.
- `.env.example` documenta las variables de ejecución sin contener secretos de despliegue.

## Rutas de la aplicación

Los archivos generados de App Router conectan las exportaciones del paquete público con la aplicación:

| Ruta | Responsabilidad |
| --- | --- |
| `src/app/[section]/[[...slug]]/page.tsx` | Carga el cliente de Studio generado para `/editor`, `/brand` y `/settings`. `createStudioPage` valida la sección y redirige a los usuarios no autenticados a `/login`. |
| `src/app/login/page.tsx` | Renderiza el flujo de inicio de sesión y redirige a una sesión existente a `/editor`. |
| `src/app/api/framekit/[...action]/route.ts` | Expone el controlador de API de FrameKit del lado del servidor con el runtime de Node.js y solicitudes dinámicas. |
| `src/app/framekit/render/[id]/page.tsx` | Es la intermediación privada de renderizado en el servidor utilizada por el renderizador de imágenes. No es una página pública y está marcada como `noindex`. |
| `src/app/layout.tsx` | Usa `FrameKitStudioRoot` para generar la estructura del documento, el proveedor de configuración regional, la gestión del tema y los estilos del cuerpo de FrameKit. |
| `src/app/globals.css` | Importa la hoja de estilos pública de FrameKit y el framework CSS del proyecto cuando se usa uno. |

El envoltorio `withFrameKit()` establece `output` de Next.js en `standalone`, escribe la salida de compilación en `.framekit/next` y añade la redirección temporal de `/` a `/editor`. No reemplaces esos valores con otro `distDir`, `output` o redirección raíz.

## Alias de TypeScript

La plantilla generada define estos alias en `tsconfig.json`:

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

Usa `@/*` para el código fuente del proyecto y `@framekit/generated/*` para los módulos generados de FrameKit. El código consumidor debe importar el paquete mediante sus entrypoints publicados, como `@mauriciodmo/framekit`, `@mauriciodmo/framekit/server` y `@mauriciodmo/framekit/studio/root`.

## Salida generada

Los comandos de FrameKit crean o reemplazan las salidas siguientes; el servidor crea la base de datos local:

- `src/generated/framekit/` contiene el registro de plantillas, el módulo de marcas, el cliente de Studio y el cliente de renderizado.
- `public/framekit/` contiene los assets de las plantillas copiados que usa el registro generado.
- `.framekit/next/` contiene la salida de compilación de Next.js y el servidor standalone.
- `.framekit/` también contiene archivos temporales de validación durante `framekit check`.
- `.framekit-data/` contiene la base de datos SQLite predeterminada cuando el proyecto usa la ruta de base de datos predeterminada.

El proyecto generado ignora estas rutas. Puedes eliminar las salidas generadas (`src/generated/framekit/`, `public/framekit/` y `.framekit/`) si es necesario y volver a generarlas; no elimines `.framekit-data/`, porque contiene la base de datos SQLite persistente. Nunca edites las salidas generadas para corregir una plantilla o una ruta.

Continúa con [el recorrido de la primera plantilla](/es/users/getting-started/first-template) después de localizar `src/templates/`.
