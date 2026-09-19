---
title: Configuración
description: Configura un proyecto de FrameKit con sus variables de entorno actuales, alias y valores predeterminados del proyecto generado.
sidebar:
  order: 2
---

La configuración de FrameKit proviene del proyecto generado, su entorno y los puntos de entrada del paquete público. Mantén los secretos en el entorno de ejecución; `.env.example` es una plantilla, no un almacén de secretos de despliegue.

## Variables de entorno

La plantilla generada documenta estas variables:

| Variable | Predeterminado | Se usa para |
| --- | --- | --- |
| `FRAMEKIT_ADMIN_USERNAME` | `admin` | El nombre de usuario del primer administrador creado en una base de datos vacía. Debe contener entre 3 y 64 letras ASCII, números, `.`, `_` o `-`. Después de que exista un usuario, el valor de bootstrap se ignora. |
| `FRAMEKIT_ADMIN_PASSWORD` | Ninguno | Solo es obligatorio durante el bootstrap del primer administrador. Debe contener entre 12 y 256 bytes UTF-8. |
| `FRAMEKIT_DATABASE_PATH` | `.framekit-data/framekit.sqlite` | La ruta de la base de datos SQLite. Las rutas relativas se resuelven desde el directorio de trabajo de la aplicación. `:memory:` usa una base de datos no persistente. |
| `PORT` | `3000` | El puerto del servidor. Debe ser un entero de `1` a `65535`. |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | Vacío | Una lista separada por comas de nombres de host exactos permitidos para imágenes remotas HTTPS. Las entradas se recortan y se convierten a minúsculas; los nombres de host tienen un máximo de 253 caracteres y no se aceptan literales de IP. |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | `2` | El número máximo de renderizados de imágenes simultáneos. Debe ser un entero de `1` a `32`. |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | `30000` | El tiempo de espera del renderizado de imágenes en milisegundos. Debe ser un entero de `1` a `120000`. |

El servidor de desarrollo también acepta `FRAMEKIT_HOST` y `HOST` para el nombre de host de enlace. `FRAMEKIT_HOST` tiene prioridad, luego `HOST` y después `localhost`. `PORT` se comparte con la configuración del renderizado de imágenes y también tiene allí el valor predeterminado `3000`.

Los hosts de imágenes remotas deben ser nombres de host HTTPS explícitos de la lista de permitidos. Por lo tanto, una lista vacía no autoriza ningún host de imágenes remotas.

## Alias del proyecto

El `tsconfig.json` generado canónico define estos alias:

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

Usa `@/*` para el código fuente del proyecto y `@framekit/generated/*` para los módulos generados. Importa FrameKit a través de sus puntos de entrada públicos del paquete, por ejemplo:

```ts
import { defineTemplate, field } from '@mauriciodmo/framekit'
import { withFrameKit } from '@mauriciodmo/framekit/next'
```

## Valores predeterminados de Next.js

El `next.config.ts` generado usa `withFrameKit()` de `@mauriciodmo/framekit/next`. El wrapper establece la salida de Next.js en `standalone`, usa `.framekit/next` como `distDir` y añade una redirección temporal de `/` a `/editor`. Un proyecto puede pasar su otra configuración de Next.js al wrapper, pero estos valores de FrameKit forman parte de la configuración generada.

Para conocer la estructura del proyecto generado, consulta [estructura del proyecto](/es/users/getting-started/project-structure). Para conocer los valores de despliegue del contenedor canónico, consulta [Docker y persistencia](/es/users/deployment/docker-and-persistence).
