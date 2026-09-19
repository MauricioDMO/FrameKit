---
title: API de acceso
description: Referencia de los endpoints de sesión, cuenta, tokens y gestión administrativa de usuarios de FrameKit.
sidebar:
  order: 2
---

La API de acceso utiliza la cookie `framekit_session`. Iniciar sesión crea la cookie; cerrar sesión, cambiar la contraseña, desactivar y eliminar una cuenta pueden hacer que caduque. La cookie es `HttpOnly`, `SameSite=Lax`, está limitada a `/` y dura 30 días. En producción también tiene `Secure`.

Todos los cuerpos de las solicitudes de acceso son objetos JSON de un máximo de 64 KiB. Usa `Content-Type: application/json`; solo se acepta la codificación de contenido identity. Los objetos de solicitud usan las claves exactas de cada operación. Las rutas de acceso no aceptan tokens Bearer.

## Autenticación y autorización

| Operación | Autenticación | Requisito de mismo origen |
| --- | --- | --- |
| `POST /api/framekit/login` | No requiere una sesión existente; se verifican las credenciales | Sí |
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

Para las mutaciones autenticadas mediante cookie, envía un `Origin` que coincida con el origen de la solicitud. El servidor también valida la información de origen reenviada cuando la aplicación está detrás de un proxy. Una cookie válida por sí sola no autoriza una mutación entre orígenes.

El servidor realiza estas comprobaciones independientemente de la visibilidad de la interfaz de Studio. Un `user` no puede obtener acceso de administrador llamando directamente a la ruta. Un administrador puede inspeccionar los metadatos del token de otro usuario y revocar ese token, pero el secreto completo del token nunca vuelve a devolverse.

## Inicio y cierre de sesión

### `POST /api/framekit/login`

Solicitud:

```json
{
  "username": "admin",
  "password": "your-password"
}
```

El cuerpo de la solicitud se lee antes de poder autenticar las credenciales. Si tiene éxito, la respuesta es `200` y devuelve el objeto de usuario seguro:

```json
{
  "id": "user-id",
  "username": "admin",
  "role": "admin"
}
```

La respuesta también establece `framekit_session`. Las credenciales inválidas, desconocidas o inactivas devuelven `401` sin indicar qué caso ocurrió. En una base de datos vacía, el controlador de inicio de sesión ejecuta `bootstrapUsers` antes de autenticar las credenciales enviadas; por tanto, el arranque no está condicionado a una comprobación correcta de las credenciales. Utiliza `FRAMEKIT_ADMIN_USERNAME` y `FRAMEKIT_ADMIN_PASSWORD`; consulta [Gestionar tu cuenta y tus tokens](/es/users/guides/manage-account-and-tokens).

### `POST /api/framekit/logout`

Devuelve `200` con:

```json
{
  "status": "ok"
}
```

La respuesta hace caducar `framekit_session`. Repetir el cierre de sesión es seguro cuando no existe una sesión utilizable.

## Rutas de la cuenta

### `GET /api/framekit/account`

Requiere una sesión y devuelve el objeto de usuario seguro con `id`, `username` y `role`.

### `PATCH /api/framekit/account`

Requiere una sesión y una solicitud de mutación del mismo origen. El cuerpo exacto de la solicitud es:

```json
{
  "username": "new-name"
}
```

La respuesta es `200` con el objeto de usuario seguro actualizado. Los nombres de usuario tienen entre 3 y 64 letras ASCII, números, `.`, `_` o `-`, y deben ser únicos sin distinguir mayúsculas y minúsculas.

### `POST /api/framekit/account/password`

Requiere la sesión y la contraseña actuales:

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

La contraseña nueva debe tener entre 12 y 256 bytes UTF-8. Un cambio correcto devuelve `200`, `{ "status": "ok" }` y una cookie de sesión caducada. Invalida todas las sesiones de esa cuenta, pero no revoca los tokens de API.

## Rutas de tokens de API

### `GET /api/framekit/tokens`

Devuelve un array de los metadatos de los tokens del usuario que ha iniciado sesión. Cada elemento contiene `id`, `name`, `tokenPrefix`, `createdAt`, `lastUsedAt` y `revokedAt`. El secreto completo no se incluye.

### `POST /api/framekit/tokens`

Crea un token con un cuerpo exacto del mismo origen:

```json
{
  "name": "image-renderer"
}
```

El nombre recortado debe tener entre 1 y 80 caracteres. Una respuesta correcta es `201` y contiene los metadatos más el campo `token`. El secreto completo del token, que comienza por `fk_`, solo se devuelve en esta respuesta. Guárdalo en el servidor antes de descartar la respuesta.

### `DELETE /api/framekit/tokens/:id`

Un propietario puede revocar uno de sus propios tokens. Un administrador puede revocar cualquier token. Una respuesta correcta es `200`, `{ "status": "ok" }`. La revocación mantiene disponibles los metadatos con `revokedAt` establecido y no se puede deshacer mediante la API.

## Rutas de gestión de usuarios

Todas las rutas de este grupo requieren una sesión de administrador. `GET /api/framekit/users/:id/tokens` es la excepción dentro de este grupo: un usuario normal puede leer los metadatos de los tokens de su propio ID, mientras que un administrador puede leer los metadatos de cualquier usuario.

### `GET /api/framekit/users`

Devuelve un array de los usuarios administrados. Cada elemento contiene:

```json
{
  "id": "user-id",
  "username": "editor",
  "role": "user",
  "active": true,
  "createdAt": 0,
  "updatedAt": 0
}
```

### `POST /api/framekit/users`

Crea un usuario activo. `username` y `password` son obligatorios; `role` es opcional y su valor predeterminado es `user`:

```json
{
  "username": "editor",
  "password": "a-strong-password",
  "role": "user"
}
```

La respuesta es `201` con el objeto de usuario seguro. Las contraseñas nunca se devuelven.

### `PATCH /api/framekit/users/:id`

El cuerpo debe contener al menos una de `username`, `role` o `active`, y solo puede contener esas claves:

```json
{
  "active": false
}
```

La respuesta es `200` con el objeto de usuario seguro actualizado. Desactivar un usuario elimina las sesiones de ese usuario e impide que sus tokens se autentiquen hasta que se reactive. El servidor rechaza una operación que eliminaría al último administrador activo.

### `DELETE /api/framekit/users/:id`

Elimina el usuario y devuelve `200`, `{ "status": "ok" }`. Se eliminan las sesiones y los tokens de API del usuario. No se puede eliminar al último administrador activo.

### `POST /api/framekit/users/:id/password`

Un administrador puede restablecer la contraseña de un usuario sin conocer la contraseña actual:

```json
{
  "password": "a-new-strong-password"
}
```

La respuesta es `200`, `{ "status": "ok" }`. Todas las sesiones de ese usuario se invalidan; los tokens de API se conservan.

### `GET /api/framekit/users/:id/tokens`

Devuelve los metadatos de los tokens del usuario objetivo sin ningún secreto completo de token. Un administrador puede solicitar cualquier usuario administrado. Un usuario normal solo puede solicitar su propio ID.

## Errores de acceso

Las respuestas de error usan `{ "error": "code", "message": "..." }` y `Cache-Control: no-store`. Los códigos de acceso estables son:

| Estado | Códigos |
| ---: | --- |
| `400` | `invalid_request` |
| `401` | `unauthorized` |
| `403` | `forbidden` |
| `404` | `not_found` |
| `405` | `method_not_allowed` |
| `409` | `conflict` |
| `413` | `request_too_large` |
| `500` | `internal_error` |
| `503` | `service_unavailable` |

El encabezado de respuesta `Allow` está presente cuando no coincide el método. No dependas de los mensajes internos de las excepciones; usa el estado y el código de `error`.
