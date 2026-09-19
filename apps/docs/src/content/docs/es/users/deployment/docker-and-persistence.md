---
title: Docker y persistencia
description: Compila y ejecuta el contenedor canónico de FrameKit con Chromium, un proceso sin privilegios de root y almacenamiento SQLite persistente.
sidebar:
  order: 3
---

La plantilla generada para consumidores incluye un Dockerfile de varias etapas para el despliegue compatible de un proceso Node.js de larga duración. Compila la salida `standalone` de Next.js, instala Chromium con las dependencias de Linux, se ejecuta como el usuario `node` y se inicia mediante `tini`.

## Compilar y ejecutar

Desde un proyecto generado que contenga el `Dockerfile` canónico, `package.json`, `pnpm-lock.yaml` y `pnpm-workspace.yaml`:

```bash
docker build --tag framekit-app .
docker volume create framekit-data
docker run --detach \
  --publish 3000:3000 \
  --env FRAMEKIT_ADMIN_PASSWORD='replace-with-a-strong-password' \
  --mount type=volume,source=framekit-data,target=/data \
  --name framekit-app \
  framekit-app
```

El Dockerfile de la plantilla usa pnpm y requiere `package.json`, `pnpm-lock.yaml` y `pnpm-workspace.yaml`. Si la creación del proyecto omitió la instalación de dependencias, ejecuta `pnpm install` desde la raíz del proyecto antes de `docker build`. Pasa el resto de la configuración pública mediante el entorno del contenedor según sea necesario. No copies un archivo `.env` secreto en la imagen. El contenedor escucha en el puerto `3000` de forma predeterminada y la imagen establece `/data/framekit.sqlite` como `FRAMEKIT_DATABASE_PATH`; el entorno de ejecución puede sobrescribir `PORT` y la ruta de SQLite.

**Advertencia:** No uses `.env.example` sin modificar como `--env-file` del contenedor. Su valor `FRAMEKIT_DATABASE_PATH=.framekit-data/framekit.sqlite` reemplaza el valor predeterminado de Docker, `/data/framekit.sqlite`, por lo que SQLite no usará el volumen montado en `/data`. Omite esa variable para el contenedor o establécela explícitamente como `/data/framekit.sqlite`, y conserva los demás secretos en el entorno de ejecución.

## Qué hace la imagen

Las etapas de compilación usan Node 22 y pnpm `11.14.0`. El `builder` ejecuta `pnpm build` y comprueba que exista `.framekit/next/standalone/server.js`. La etapa `prod-deps` instala las dependencias de producción; el `runner` las copia y ejecuta `./node_modules/.bin/framekit browser install --with-deps`.

El `runner` establece estas variables a nivel de imagen:

| Variable | Valor en la imagen | Significado |
| --- | --- | --- |
| `NODE_ENV` | `production` | Modo de ejecución. |
| `HOSTNAME` | `0.0.0.0` | Nombre de host al que se enlaza el contenedor. |
| `PORT` | `3000` | Puerto del contenedor y del renderizador. |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` | Ubicación de Chromium instalado. |
| `FRAMEKIT_DATABASE_PATH` | `/data/framekit.sqlite` | Ruta predeterminada de SQLite establecida por la imagen; el entorno de ejecución puede sobrescribirla. |

`NODE_ENV`, `HOSTNAME` y `PLAYWRIGHT_BROWSERS_PATH` son ajustes operativos de la imagen, no opciones de configuración pública de FrameKit. `FRAMEKIT_ADMIN_PASSWORD`, `FRAMEKIT_ADMIN_USERNAME`, `FRAMEKIT_ALLOWED_IMAGE_HOSTS` y los límites de renderizado siguen siendo valores del entorno de despliegue.

La imagen final crea `/data`, permite que `node` escriba en ella, expone el puerto `3000`, elimina los privilegios de root mediante `USER node` y usa `/usr/bin/tini --` como punto de entrada antes de `node server.js`.

## Persistencia de SQLite

Monta `/data` como almacenamiento persistente si los usuarios, las sesiones y los metadatos de los tokens de API deben sobrevivir al reemplazo del contenedor. Sin un montaje persistente, el directorio preparado de la imagen forma parte del sistema de archivos del contenedor y puede perderse cuando se reemplace el contenedor. Asegúrate de que un montaje de enlace o un volumen permita escribir al usuario `node`.

La persistencia de SQLite no conserva los trabajos de renderizado. Los trabajos de renderizado se mantienen en la memoria del proceso, tienen un TTL de 120 segundos y no están disponibles intencionadamente después de reiniciar el proceso. Un contenedor de reemplazo puede recuperar el estado de las cuentas y de los tokens respaldado por la base de datos, pero se pierde cualquier trabajo de renderizado en curso o de prueba.

## Comprobar el reinicio

Después del primer inicio de sesión y de crear un token, reinicia o reemplaza el contenedor manteniendo el mismo volumen `/data`. La base de datos de cuentas y sesiones debería seguir disponible. No debe esperarse que un trabajo de renderizado creado antes del reemplazo del proceso siga disponible; envía una nueva solicitud de imagen.
