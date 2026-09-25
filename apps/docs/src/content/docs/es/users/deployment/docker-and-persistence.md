---
title: Docker y persistencia
description: Compila y ejecuta el contenedor canónico de FrameKit, entiende cada etapa del Dockerfile y persiste de forma segura el estado autenticado.
sidebar:
  order: 3
---

El proyecto generado por FrameKit incluye un `Dockerfile` de varias etapas orientado a producción. Compila la salida `standalone` de Next.js, instala Chromium solo en la imagen de ejecución, ejecuta la aplicación como el usuario `node` sin privilegios de root y arranca mediante `tini`.

## Compilar y ejecutar

Desde un proyecto generado que contenga el `Dockerfile` canónico, `pnpm-lock.yaml` y `pnpm-workspace.yaml`:

```bash
docker build --tag framekit-app .
docker volume create framekit-data
docker run --detach \
  --publish 3000:3000 \
  --env FRAMEKIT_AUTH_ENABLED=false \
  --mount type=volume,source=framekit-data,target=/data \
  --name framekit-app \
  framekit-app
```

Este ejemplo usa modo abierto y no requiere login, usuarios, tokens ni base de datos SQLite. Para un despliegue autenticado, activa la autenticación y proporciona la contraseña de bootstrap:

```bash
docker run --detach \
  --publish 3000:3000 \
  --env FRAMEKIT_AUTH_ENABLED=true \
  --env FRAMEKIT_ADMIN_PASSWORD='replace-with-a-strong-password' \
  --mount type=volume,source=framekit-data,target=/data \
  --name framekit-app \
  framekit-app
```

No copies un `.env` con secretos dentro de la imagen. Pasa los secretos en tiempo de ejecución. El contenedor escucha en el puerto `3000` y usa `/data/framekit.sqlite` como valor predeterminado de `FRAMEKIT_DATABASE_PATH`.

:::caution
No uses `.env.example` sin modificar como `--env-file` del contenedor. Su ruta local para SQLite reemplazaría `/data/framekit.sqlite` e impediría que la base de datos use el volumen montado en `/data`.
:::

## Etapas del Dockerfile

El Dockerfile separa las dependencias de compilación de las dependencias necesarias en producción.

### `base`

```dockerfile
FROM node:22-bookworm-slim AS base
```

Esta etapa sirve como base compartida para las siguientes. Hace lo siguiente:

- usa Node.js 22 sobre Debian Bookworm slim;
- activa Corepack y pnpm `11.14.0`;
- establece `/app` como directorio de trabajo; e
- instala únicamente `ca-certificates` como dependencia del sistema compartida.

Centralizar esta configuración evita repetir la preparación de Node y pnpm.

### `build-deps`

Instala todas las dependencias necesarias para compilar la aplicación:

```dockerfile
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm install --frozen-lockfile
```

`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` evita que Playwright descargue Chromium durante `pnpm install`. El navegador no es necesario para instalar paquetes ni para compilar y descargarlo en esta etapa duplicaría archivos entre capas de Docker.

El store de pnpm usa un cache mount de BuildKit para reutilizar paquetes descargados entre compilaciones.

### `prod-deps`

Instala solamente las dependencias de producción:

```dockerfile
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm install --prod --frozen-lockfile
```

La imagen final copia `node_modules` desde esta etapa y no arrastra las dependencias de desarrollo del builder.

### `builder`

El builder copia el código fuente y ejecuta:

```bash
pnpm build
```

FrameKit genera la salida `standalone` de Next.js en `.framekit/next/standalone/`. Después, el Dockerfile comprueba explícitamente que exista:

```text
.framekit/next/standalone/server.js
```

Así, el build de la imagen falla de inmediato si no se generó el artefacto de producción esperado.

### `runner`

La etapa final contiene únicamente lo necesario para ejecutar la aplicación compilada.

Copia las dependencias de producción, instala `tini` y ejecuta:

```bash
./node_modules/.bin/framekit browser install --with-deps
```

Este comando instala Chromium y las bibliotecas de Linux requeridas por el renderizador de FrameKit. `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` mantiene el navegador en una ubicación predecible dentro de la imagen.

Después, la etapa copia la aplicación standalone generada, crea `/data`, cambia su propietario al usuario `node`, elimina privilegios de root, expone el puerto `3000` e inicia la aplicación con:

```text
/usr/bin/tini -- node server.js
```

`tini` actúa como PID 1 y reenvía correctamente las señales Unix, lo que ayuda a que el proceso de Node se cierre limpiamente cuando se detiene el contenedor.

## Variables de la imagen

El runner define estos valores predeterminados:

| Variable | Valor | Significado |
| --- | --- | --- |
| `NODE_ENV` | `production` | Ejecuta la aplicación en modo producción. |
| `HOSTNAME` | `0.0.0.0` | Permite recibir tráfico desde fuera del contenedor. |
| `PORT` | `3000` | Puerto de la aplicación y del renderizador. |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` | Ubicación de Chromium instalado. |
| `FRAMEKIT_DATABASE_PATH` | `/data/framekit.sqlite` | Ruta predeterminada de SQLite en despliegues autenticados. |

El Dockerfile no activa la autenticación. Define `FRAMEKIT_AUTH_ENABLED` explícitamente en tiempo de ejecución.

## Por qué la aplicación se ejecuta como `node`

La instalación del navegador necesita privilegios de root porque instala paquetes de Linux mediante `apt`. Una vez preparada la imagen, FrameKit no necesita ejecutarse como root.

Por eso el Dockerfile crea `/data`, se lo asigna a `node` y cambia a:

```dockerfile
USER node
```

Esto reduce los privilegios del proceso de aplicación y mantiene la capacidad de escribir la base SQLite en `/data`.

## Persistencia de SQLite

Monta `/data` como almacenamiento persistente cuando la autenticación esté activa y necesites conservar usuarios, sesiones o metadatos de tokens de API después de reemplazar el contenedor.

Sin un volumen o bind mount persistente, la base queda dentro del sistema de archivos desechable del contenedor.

El modo abierto no inicializa SQLite, por lo que `/data` no es necesario para persistencia de cuentas cuando `FRAMEKIT_AUTH_ENABLED=false`.

La persistencia de SQLite no conserva trabajos de renderizado. Los trabajos viven en memoria y se pierden intencionalmente cuando el proceso se reinicia o reemplaza.

## Comprobar un reinicio

En modo autenticado, después del primer inicio de sesión y de crear un token, reinicia o reemplaza el contenedor conservando el mismo volumen `/data`. Las cuentas y tokens deberían seguir disponibles.

No se debe esperar que un trabajo de renderizado creado antes del reemplazo del proceso sobreviva; envía una nueva solicitud de renderizado.
