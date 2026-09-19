---
title: Entorno de ejecución y configuración
description: Configura el entorno de ejecución de Node, el renderizador de Chromium, la base de datos, los hosts de imágenes, la capacidad y el tiempo de espera del renderizado.
sidebar:
  order: 2
---

## Requisitos del entorno de ejecución

Los proyectos generados tienen como objetivo Node.js `>=22.13.0` y pnpm `>=11.14.0`. El renderizador del lado del servidor requiere el navegador Playwright Chromium:

```bash
pnpm framekit browser install
```

En máquinas Linux donde las dependencias del sistema del navegador aún no estén instaladas, usa:

```bash
pnpm framekit browser install --with-deps
```

Construye antes de iniciar la producción:

```bash
pnpm framekit build
pnpm framekit start
```

El navegador es un singleton para el proceso. Cada solicitud recibe un contexto y una página del navegador aislados, y la solicitud libera su capacidad, página, contexto y trabajo de renderizado temporal durante la limpieza. El navegador no se cierra automáticamente después de un periodo de inactividad, y la API pública del servidor no proporciona una operación de apagado para la gestión normal de solicitudes.

## Variables de FrameKit

Estas son las variables de la aplicación en la plantilla canónica. El bootstrap, la base de datos, el servidor de desarrollo o la configuración de renderizado de imágenes leen los valores en los puntos descritos a continuación.

| Variable | Predeterminado | Contrato y punto de lectura |
| --- | --- | --- |
| `FRAMEKIT_ADMIN_USERNAME` | `admin` | Nombre de usuario opcional para el bootstrap del primer usuario en una base de datos vacía. Debe tener entre 3 y 64 letras ASCII, números, `.`, `_` o `-`. No es una configuración posterior de sincronización de usuarios. |
| `FRAMEKIT_ADMIN_PASSWORD` | Ninguno | Obligatoria únicamente durante el bootstrap del primer usuario en una base de datos vacía. Debe tener entre 12 y 256 bytes UTF-8. Mantenla en el entorno de ejecución. |
| `FRAMEKIT_DATABASE_PATH` | `.framekit-data/framekit.sqlite` | Ruta de SQLite resuelta a partir del directorio de trabajo del proceso cuando se abre la base de datos. `:memory:` es explícitamente no persistente. |
| `PORT` | `3000` | Puerto decimal de `1` a `65535`. Configura el puerto del servidor y el origen privado de loopback del renderizador. |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | Vacío | Nombres de host exactos separados por comas para entradas de imágenes remotas HTTPS. Los nombres de host se convierten a minúsculas, se limitan a 253 caracteres y se rechazan los literales IP. Un valor vacío desactiva la obtención de imágenes remotas. |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | `2` | Entero positivo de `1` a `32`. Limita los renderizados activos en el proceso. |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | `30000` | Entero positivo de `1` a `120000` milisegundos. Aborta o cancela el trabajo de renderizado después de la duración configurada. La limpieza de la página y el contexto se intenta en `finally`; esa espera de limpieza no tiene un límite independiente documentado. |

El controlador de imágenes analiza su configuración de renderizado cuando gestiona una solicitud de imagen. Un valor no válido de puerto, lista de permitidos, capacidad o tiempo de espera devuelve `api_not_configured` en lugar de usar silenciosamente un valor no válido.

## Variables de host del servidor de desarrollo

`FRAMEKIT_HOST` y `HOST` se aplican a `framekit dev`, no a la configuración pública de renderizado de imágenes. El servidor de desarrollo elige primero `FRAMEKIT_HOST`, después `HOST` y luego `localhost`. `PORT` se comparte y tiene como valor predeterminado `3000`; los valores no válidos fuera de `1-65535` detienen el inicio.

El servidor de desarrollo también expone la ruta de carga protegida `POST /framekit/assets` para las cargas de imágenes de Studio. Esa ruta es una capacidad del servidor de desarrollo y no forma parte del enrutamiento de la API de producción `/api/framekit/**`.

## Ciclo de vida del renderizado

El proceso permite únicamente el número configurado de renderizados simultáneos. Un renderizado usa un identificador de trabajo temporal y un token en un `Map` local al proceso; el trabajo tiene un TTL de 120 segundos y se elimina después de que se completa la solicitud. El almacén de trabajos se pierde al reiniciar. El renderizador crea un contexto de Chromium sin interfaz con las dimensiones de la plantilla, bloquea la navegación no relacionada, espera a que se carguen las fuentes y las imágenes, captura un PNG y cierra el contexto y la página de la solicitud.
