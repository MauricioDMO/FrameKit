---
title: API HTTP
description: Comprende la API HTTP autenticada de FrameKit para la gestión del acceso y el renderizado de PNG en el servidor.
sidebar:
  order: 1
---

FrameKit expone un controlador HTTP de Node.js para el acceso a Studio y el renderizado síncrono de PNG. En el proyecto canónico, móntalo desde la ruta catch-all del App Router en `/api/framekit/[...action]` y mantén esa ruta en el runtime de Node.js. La [integración con un proyecto existente](/es/users/getting-started/existing-project) muestra la configuración completa de la ruta.

El dispatcher solo expone las rutas documentadas en esta sección. `POST /api/framekit/images/render` es el endpoint de imágenes. Las demás rutas gestionan la sesión de Studio, la cuenta, los tokens de API y los usuarios.

## Elige una referencia

- [API de acceso](/es/users/reference/http-api/access): autenticación de sesión, operaciones de cuenta, tokens de API y gestión de usuarios administradores.
- [API de renderizado de imágenes](/es/users/reference/http-api/image-render): estructura de la solicitud, autenticación, entradas de imagen y respuesta PNG.
- [Errores de la API de imágenes](/es/users/reference/http-api/errors): códigos de estado y códigos de error estables para los clientes.

## Reglas comunes de respuesta

Las respuestas de acceso son JSON y utilizan `Cache-Control: no-store`. Los errores de imagen también son JSON y utilizan `Cache-Control: no-store`; una respuesta de imagen correcta es un PNG con la misma directiva de caché. Los clientes deben basarse en el código documentado de `error` en lugar de analizar los mensajes legibles para humanos.

La API es síncrona. Una solicitud de renderizado valida primero la configuración, se autentica antes de analizar la solicitud o buscar recursos, resuelve la plantilla y sus datos, inicia el renderizado de Chromium en el servidor y devuelve los bytes del PNG en la misma respuesta.

## Límite de seguridad

La cookie de sesión es para el acceso a Studio desde el mismo origen. Un token de API Bearer solo se acepta en el endpoint de renderizado de imágenes. No incluyas un token en una URL, un bundle del navegador, el DOM renderizado ni el código del cliente. Lee [Seguridad y proxies inversos](/es/users/deployment/security-and-reverse-proxies) antes de exponer públicamente el controlador.
