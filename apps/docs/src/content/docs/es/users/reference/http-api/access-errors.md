---
title: Errores de la API de acceso
description: Gestiona los estados y códigos de error estables que devuelve la API de acceso de FrameKit.
sidebar:
  order: 6
---

Los errores de acceso usan esta forma JSON y `Cache-Control: no-store`:

```json
{
  "error": "invalid_request",
  "message": "Invalid request"
}
```

Usa el estado HTTP y el código `error` para el procesamiento programático, no el
`message` legible para humanos. Los códigos de acceso estables son:

| Estado | Código | Significado |
| ---: | --- | --- |
| `400` | `invalid_request` | El cuerpo de la solicitud, el tipo de contenido, la codificación de contenido o el valor de la operación no son válidos. |
| `401` | `unauthorized` | La solicitud no tiene una sesión válida o las credenciales proporcionadas no son válidas. |
| `403` | `forbidden` | La sesión no tiene permiso para realizar la operación o una mutación no es del mismo origen. |
| `404` | `not_found` | La ruta de acceso está desactivada o el recurso solicitado no existe. |
| `405` | `method_not_allowed` | La ruta no acepta el método de solicitud. La respuesta incluye `Allow`. |
| `409` | `conflict` | El nombre de usuario entra en conflicto con otro existente o la operación eliminaría al último administrador activo. |
| `413` | `request_too_large` | Un cuerpo JSON de acceso supera 64 KiB. |
| `500` | `internal_error` | Se produjo un error inesperado en el servidor. |
| `503` | `service_unavailable` | La configuración de bootstrap del acceso no está disponible o no es válida. |

El controlador devuelve `404 not_found` para las rutas de acceso cuando
`FRAMEKIT_AUTH_ENABLED` no está definido o es `false`. No dependas de los
mensajes de excepciones internas; usa el estado y el código `error`.
