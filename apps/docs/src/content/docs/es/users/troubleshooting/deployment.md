---
title: Solución de problemas de despliegue
description: Diagnostica problemas de inicio, Chromium, entorno, persistencia, proxy y estado del renderizado en un despliegue de FrameKit.
sidebar:
  order: 8
---

Usa [Desplegar FrameKit](/es/users/deployment) para consultar la topología compatible, [Entorno de ejecución y configuración](/es/users/deployment/runtime) para conocer los valores del entorno y [Docker y persistencia](/es/users/deployment/docker-and-persistence) para consultar la imagen canónica.

Antes de depurar acceso, confirma el modo configurado. La variable ausente o
`FRAMEKIT_AUTH_ENABLED=false` activa el modo abierto; `true` activa usuarios,
sesiones, tokens y SQLite. Otros valores fallan de forma explícita.

## El proceso de producción no se inicia

**Síntoma:** `pnpm framekit start` termina sin servir la aplicación.

**Causa probable:** La compilación de producción no se ha completado, el runtime o el puerto no son válidos, o la salida compilada no está disponible.

**Comprobación:** Confirma que Node.js sea `>=22.13.0`, que `PORT` sea un entero de `1` a `65535` y ejecuta la compilación por separado.

**Solución:** Compila e inicia desde la raíz del proyecto:

```bash
pnpm framekit build
pnpm framekit start
```

`start` usa la compilación de producción existente y no regenera las plantillas.

## Chromium no está disponible en producción

**Síntoma:** La aplicación se inicia, pero el renderizado de PNG del lado del servidor falla porque Chromium no puede iniciarse.

**Causa probable:** Chromium o sus dependencias del sistema Linux faltan en la imagen de runtime.

**Comprobación:** Ejecuta el comando de instalación del navegador en el mismo entorno que usa el proceso de producción.

**Solución:** Instala el navegador y sus dependencias en el entorno de producción antes de iniciar la aplicación, o usa el Dockerfile canónico. En Linux, instala las dependencias del sistema con:

```bash
pnpm framekit browser install --with-deps
```

## El primer inicio de sesión autenticado falla después del despliegue

**Síntoma:** Con `FRAMEKIT_AUTH_ENABLED=true`, el primer inicio de sesión en una base de datos vacía devuelve un error de servicio no disponible.

**Causa probable:** `FRAMEKIT_ADMIN_PASSWORD` falta o no es válida, o el nombre de usuario opcional no es válido.

**Comprobación:** Confirma que el entorno de ejecución tenga una contraseña de 12–256 bytes UTF-8 y, si se establece, un nombre de usuario de 3–64 letras ASCII, números, `.`, `_` o `-`.

**Solución:** Define `FRAMEKIT_AUTH_ENABLED=true` y valores válidos en el entorno de ejecución antes del primer inicio de sesión. Los valores de bootstrap solo crean el primer administrador y no reemplazan a los usuarios existentes. Consulta [Solución de problemas de acceso a Studio](/es/users/troubleshooting/access).

## Los usuarios o los tokens desaparecen después de reiniciar

**Síntoma:** Con la autenticación activada, faltan cuentas, sesiones o metadatos de tokens de API después de reemplazar un contenedor o reiniciar el proceso.

**Causa probable:** El directorio de SQLite no es duradero, la ruta configurada cambió o el directorio de la base de datos no permite escritura.

**Comprobación:** Confirma `FRAMEKIT_DATABASE_PATH`; de forma predeterminada es `.framekit-data/framekit.sqlite`, relativo al directorio de trabajo del proceso. En la imagen Docker canónica es `/data/framekit.sqlite`.

**Solución:** Monta como almacenamiento duradero el directorio que contiene la base de datos y asegúrate de que el usuario del runtime pueda escribir en él. No uses `:memory:` cuando el estado deba sobrevivir a un reinicio. En modo abierto no necesitas SQLite para el acceso.

## Las solicitudes autenticadas mediante cookies fallan detrás de un proxy

**Síntoma:** Una mutación del navegador devuelve `403` aunque el usuario haya iniciado sesión.

**Causa probable:** El `Origin` de la solicitud no coincide con el origen público que el servidor deriva del protocolo y el host reenviados.

**Comprobación:** Confirma que el proxy reenvíe de forma coherente el esquema HTTPS y el host públicos, y que el navegador envíe el `Origin` público.

**Solución:** Corrige la configuración de reenvío del proxy. No desactives las comprobaciones del mismo origen ni incluyas una cookie de sesión en una URL. Para llamadas de imágenes del lado del servidor, usa un token Bearer cuando una sesión de navegador no sea adecuada. Consulta [Seguridad y proxies inversos](/es/users/deployment/security-and-reverse-proxies).

## Las imágenes remotas fallan solo después del despliegue

**Síntoma:** Una imagen remota se renderiza localmente, pero falla en producción.

**Causa probable:** El proceso de producción no tiene el nombre de host exacto en `FRAMEKIT_ALLOWED_IMAGE_HOSTS`, o la respuesta remota no supera las comprobaciones de HTTPS, rasterizado, tamaño o redirección.

**Comprobación:** Compara la lista de permitidos del entorno de ejecución con el nombre de host de la URL de la imagen e inspecciona la respuesta remota desde el entorno del servidor.

**Solución:** Establece los nombres de host exactos necesarios en el entorno de producción y vuelve a intentarlo con una imagen PNG, JPEG, WebP o GIF servida por HTTPS y dentro del límite de tamaño admitido. Consulta [Solución de problemas de renderizado](/es/users/troubleshooting/rendering).

## Las solicitudes de renderizado no funcionan entre procesos

**Síntoma:** Un despliegue puede servir Studio, pero una solicitud de renderizado falla cuando la ruta de la solicitud cruza los límites de un proceso o contenedor.

**Causa probable:** La capacidad de renderizado, el estado del navegador y el estado temporal del renderizado son locales al proceso que gestiona la solicitud.

**Comprobación:** Confirma que el despliegue use el proceso de Node de larga duración compatible por contenedor y que la API de imágenes y la ruta privada de renderizado lleguen a ese mismo proceso.

**Solución:** Mantén la solicitud de la API y su transferencia privada de renderizado en el mismo proceso de larga duración. Coloca HTTPS y la limitación de solicitudes delante de ese proceso, tal como se describe en [Desplegar FrameKit](/es/users/deployment).
