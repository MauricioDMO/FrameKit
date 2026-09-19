---
title: Seguridad y proxies inversos
description: Protege las sesiones de FrameKit, los tokens de API, las imágenes remotas, el renderizado de Chromium y la exposición pública mediante proxies.
sidebar:
  order: 4
---

Lee esta página antes de exponer Studio o la API de imágenes a una red pública. La aplicación de FrameKit comprueba la autenticación y la autorización, pero HTTPS, la limitación de intentos de inicio de sesión y la política del proxy siguen siendo responsabilidades del despliegue.

## Lista de comprobación para la exposición pública

- Termina HTTPS en el proxy inverso o el balanceador de carga y reenvía las solicitudes al proceso de Node de larga duración.
- Aplica limitación de solicitudes al tráfico de inicio de sesión en el proxy o el balanceador de carga.
- Establece un `FRAMEKIT_ADMIN_PASSWORD` seguro antes del primer inicio de sesión en una base de datos vacía.
- Mantén las cookies `framekit_session` y los secretos completos de tokens `fk_` fuera de los registros, las URL, los bundles del navegador, el DOM renderizado y el código del cliente.
- Monta el directorio de SQLite de forma persistente cuando el estado de las cuentas y los tokens deba sobrevivir a los reinicios.
- Mantén el proceso y el runtime de Chromium en la configuración compatible de Node y del contenedor.

## Límites de las sesiones y los tokens

La cookie `framekit_session` es `HttpOnly` y `SameSite=Lax`; las respuestas de producción añaden `Secure`. Las mutaciones autenticadas mediante cookie requieren un `Origin` del mismo origen. El servidor verifica la sesión actual, la actividad de la cuenta, el rol y la propiedad del token, en lugar de basarse en si Studio muestra un control.

La autenticación Bearer solo se acepta en `POST /api/framekit/images/render`. El token de API completo se devuelve únicamente al crearlo. Las listas posteriores de tokens y las vistas de administrador muestran metadatos y un prefijo corto, nunca el secreto recuperable. El propietario inactivo de un token no puede autenticarse con un token que no se haya revocado; al reactivar al propietario, vuelve a estar disponible.

Si una solicitud de imagen contiene una cabecera `Authorization`, esta tiene prioridad. Un valor Bearer mal formado o no válido devuelve `401` incluso cuando también está presente una cookie de sesión válida. No envíes ambas credenciales como estrategia alternativa.

## Comportamiento del proxy del mismo origen

Para las mutaciones autenticadas mediante cookie, el `Origin` del navegador debe coincidir con el origen que el servidor deriva de la URL de la solicitud y de la información confiable del protocolo/host reenviada. Configura el proxy para que el host y el esquema HTTPS públicos se reenvíen de forma coherente. No permitas que las cabeceras de reenvío proporcionadas arbitrariamente por el cliente redefinan el origen público.

Las solicitudes Bearer procedentes de una integración confiable del lado del servidor no necesitan una cookie de sesión ni un `Origin` del navegador, pero siguen necesitando un token válido, activo y no revocado. Usa una variable de entorno del lado del servidor o un gestor de secretos para ese token.

## Restricciones de entrada de imágenes

El renderizador solo acepta las siguientes fuentes de imagen:

- rutas relativas a la raíz que comiencen por `/assets/` o `/framekit/templates/`;
- data URLs con `image/png`, `image/jpeg`, `image/webp` o `image/gif` y una firma rasterizada coincidente; y
- URL HTTPS cuyos nombres de host coincidan exactamente con los de `FRAMEKIT_ALLOWED_IMAGE_HOSTS`.

El renderizador rechaza HTTP, literales de IP, hosts de loopback, credenciales en la autoridad, puertos explícitos no predeterminados, barras invertidas, fragmentos, traversal, SVG suministrado mediante data URL o respuesta remota, firmas MIME no válidas y redirecciones no seguras. Las rutas relativas a la raíz pueden apuntar a assets SVG. `https://host:443` se normaliza y se acepta como HTTPS sin puerto. Las descargas remotas se realizan en Node antes de que Chromium reciba la imagen preparada. Las redirecciones se vuelven a validar y están limitadas a tres. Cada imagen proporcionada mediante data URL o descargada de forma remota está limitada a 8,000,000 bytes y el cuerpo de la solicitud JSON a 12,000,000 bytes.

Una ruta de un recurso o un bundle del cliente pueden ser públicos. Ninguno es un lugar para credenciales ni otros datos confidenciales. Los recursos públicos no deben tratarse como secretos solo porque los use una plantilla.

## Aislamiento del renderizado

La API de imágenes valida primero la configuración de renderizado y después autentica, antes de analizar la entrada, buscar plantillas, obtener imágenes remotas o reservar capacidad del navegador. Cada renderizado usa un token de trabajo temporal para la página privada de renderizado interno. La capa de enrutamiento del navegador permite solicitudes HTTP(S) únicamente al origen de renderizado interno, recursos mediante data URL y el WebSocket HMR local durante el desarrollo; la navegación principal solo puede ser la navegación de renderizado esperada y las navegaciones no relacionadas se bloquean. La página y el contexto se cierran durante la limpieza. No publiques la página privada de renderizado como una API pública de renderizado independiente.

## Cargas solo para desarrollo

`POST /framekit/assets` existe únicamente en el servidor de desarrollo de FrameKit para reemplazar recursos de plantillas desde Studio. Requiere una sesión válida del mismo origen y solo escribe en espacios de nombres de recursos de plantillas permitidos. No es una ruta bajo `/api/framekit/**` y no debe tratarse como un endpoint de carga de producción.

## Límites de la topología

La topología inicial compatible es un proceso de Node de larga duración por contenedor. El estado del navegador, la capacidad de renderizado y los trabajos de renderizado son locales al proceso; los trabajos de renderizado se pierden al reiniciar y no forman una cola compartida. No coloques la API en un modelo de ejecución serverless ni añadas réplicas que dependan de un estado de renderizado en curso compartido sin un diseño de coordinación compatible por separado.
