---
title: Errores de la API de imágenes
description: Gestiona los estados y códigos de error estables que devuelve el endpoint de renderizado de imágenes de FrameKit.
sidebar:
  order: 4
---

El endpoint de imágenes devuelve errores JSON con esta forma:

```json
{
  "error": "invalid_template_data",
  "message": "Template data is invalid",
  "fields": {
    "title": {
      "code": "required"
    }
  }
}
```

`fields` solo se incluye para `invalid_template_data` cuando hay detalles de campos seguros disponibles. El servidor omite las causas internas y no expone secretos en los cuerpos de respuesta. Usa `error` y el estado HTTP para el procesamiento programático, no `message`.

## Referencia de estados y códigos

| Estado | Código | Significado |
| ---: | --- | --- |
| `400` | `invalid_request` | La estructura JSON, el tipo de contenido, la plantilla, la variante o los metadatos de la solicitud no son válidos. |
| `401` | `unauthorized` | No se proporcionó una sesión válida del mismo origen ni un token de API válido. La respuesta incluye `WWW-Authenticate: Bearer`. |
| `404` | `template_not_found` | El slug de la plantilla solicitada no está en el registro generado. |
| `405` | `method_not_allowed` | El dispatcher de imágenes solo acepta `POST` y envía `Allow: POST`. |
| `413` | `request_too_large` | El cuerpo JSON supera los 12,000,000 bytes o una imagen preparada supera los 8,000,000 bytes. |
| `415` | `unsupported_image` | La fuente no es compatible, su tipo MIME y su firma de archivo no coinciden, o la URL de imagen enviada inicialmente usa un esquema distinto de HTTP(S), como `ftp:` o `file:`. |
| `422` | `invalid_template_data` | Los datos no cumplen el contrato de campos y variantes de la plantilla seleccionada. |
| `422` | `image_host_not_allowed` | Una URL de imagen HTTP o HTTPS válida no está permitida por la política de hosts de imágenes. Esto incluye una URL HTTP o un hostname HTTPS que no está en la lista de permitidos configurada; los esquemas distintos de HTTP(S), como `ftp:` y `file:`, en la URL enviada inicialmente devuelven `unsupported_image`. |
| `502` | `image_fetch_failed` | No se pudo obtener una imagen remota permitida o esta no devolvió una respuesta válida. |
| `503` | `api_not_configured` | `PORT` o un valor de configuración del renderizado de imágenes no es válido. |
| `503` | `render_capacity_exhausted` | El proceso ya tiene el número máximo configurado de renderizados activos. La respuesta incluye `Retry-After: 1`. |
| `504` | `render_timeout` | La solicitud superó `FRAMEKIT_RENDER_TIMEOUT_MS`. |
| `500` | `render_failed` | La plantilla, la página de renderizado, el navegador o la captura de pantalla fallaron inesperadamente. |

La distinción entre los esquemas `ftp:` y `file:` se aplica a la URL de imagen enviada inicialmente. Si un servidor remoto redirige a un destino no válido o no permitido, la obtención de esa redirección puede terminar en `502 image_fetch_failed`; el rechazo por la política de hosts sigue siendo `422 image_host_not_allowed` cuando el código lo clasifica de esa manera.

Todos los errores de imagen usan `Cache-Control: no-store` y `Content-Type: application/json`.

## Gestión por parte del cliente

1. Gestiona `401` comprobando la credencial y el estado de su propietario. Un encabezado Bearer no válido no recurre a una cookie de sesión.
2. Gestiona `400`, `415` y `422` como correcciones de la solicitud o de los datos de la plantilla. Para `invalid_template_data`, usa `fields` cuando esté presente.
3. Gestiona `413` reduciendo el tamaño del JSON o de la entrada de imagen.
4. Gestiona `502` comprobando HTTPS, la lista de hosts permitidos, la respuesta remota y las reglas de redirección.
5. Gestiona la capacidad de `503` con reintentos acotados y limitación externa; no reintentes un error de configuración hasta que se corrija el entorno.
6. Gestiona `504` comprobando la plantilla y el entorno de ejecución del navegador; después, ajusta el tiempo de espera dentro de su rango compatible solo cuando el renderizado realmente necesite más tiempo.

Después de validar la configuración del renderizado de imágenes, la autenticación ocurre antes del análisis de la solicitud, la búsqueda de la plantilla, las obtenciones remotas y la reserva del navegador. Corrige un `401` antes de diagnosticar el cuerpo o la ruta de renderizado.
