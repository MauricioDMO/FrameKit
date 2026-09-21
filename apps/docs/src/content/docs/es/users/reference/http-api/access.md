---
title: API de acceso
description: Referencia de las rutas de acceso de FrameKit y su contrato HTTP común.
sidebar:
  order: 2
---

La API de acceso solo existe cuando `FRAMEKIT_AUTH_ENABLED=true`. En el modo
abierto, todas las rutas de acceso devuelven `404 not_found`. Cuando está
activada, la API usa la cookie `framekit_session`. Iniciar sesión crea la
cookie; cerrar sesión, cambiar la contraseña, desactivar y eliminar una cuenta
pueden hacer que caduque. La cookie es `HttpOnly`, `SameSite=Lax`, está limitada
a `/` y dura 30 días. En producción también tiene `Secure`.

## Contrato común

Los cuerpos de las solicitudes de acceso son objetos JSON de un máximo de 64
KiB. Usa `Content-Type: application/json`; se acepta un charset UTF-8 opcional y
solo se acepta la codificación de contenido `identity`. Los objetos de solicitud
usan las claves exactas de cada operación. Las respuestas son JSON con
`Cache-Control: no-store`.

Las mutaciones autenticadas mediante cookie requieren un `Origin` que coincida
con el origen de la solicitud. El servidor también valida la información de
origen reenviada cuando la aplicación está detrás de un proxy. Una cookie válida
por sí sola no autoriza una mutación entre orígenes. Las rutas de acceso no
aceptan tokens Bearer.

El servidor realiza la autorización independientemente de la visibilidad de la
interfaz de Studio. Un `user` no puede obtener acceso de administrador llamando
directamente a la ruta. Un administrador puede inspeccionar y revocar los
metadatos del token de otro usuario, pero el secreto completo nunca vuelve a
devolverse.

## Mapa de rutas

| Operación | Autenticación | Requisito de mismo origen |
| --- | --- | --- |
| `POST /api/framekit/login` | Sin sesión existente; se verifican las credenciales | Sí |
| `POST /api/framekit/logout` | La cookie se borra sea utilizable o no | Sí |
| `GET /api/framekit/account` | Sesión iniciada | No se comprueba `Origin` en el controlador |
| `PATCH /api/framekit/account` | Sesión iniciada | Sí |
| `POST /api/framekit/account/password` | Sesión iniciada y contraseña actual | Sí |
| `GET /api/framekit/tokens` | Sesión iniciada; tokens propios | No se comprueba `Origin` en el controlador |
| `POST /api/framekit/tokens` | Sesión iniciada; crea un token propio | Sí |
| `DELETE /api/framekit/tokens/:id` | Sesión iniciada; propietario o administrador | Sí |
| `GET /api/framekit/users` | Sesión de administrador | No se comprueba `Origin` en el controlador |
| `POST /api/framekit/users` | Sesión de administrador | Sí |
| `PATCH /api/framekit/users/:id` | Sesión de administrador | Sí |
| `DELETE /api/framekit/users/:id` | Sesión de administrador | Sí |
| `POST /api/framekit/users/:id/password` | Sesión de administrador | Sí |
| `GET /api/framekit/users/:id/tokens` | Administrador o sesión del usuario objetivo | No se comprueba `Origin` en el controlador |

Consulta las páginas específicas para conocer los detalles de solicitudes y respuestas:

- [Endpoints de cuenta](/es/users/reference/http-api/account)
- [Endpoints de tokens](/es/users/reference/http-api/tokens)
- [Endpoints de gestión de usuarios](/es/users/reference/http-api/users)
- [Errores de acceso](/es/users/reference/http-api/access-errors)
