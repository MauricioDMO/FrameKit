---
title: Administrar usuarios
description: Crea y administra usuarios de Studio, roles, contraseñas, actividad y acceso a tokens.
sidebar:
  order: 6
---

Solo un administrador puede usar la sección **Usuarios** en los ajustes de Studio. Consulta [Administrar tu cuenta y tus tokens](/es/users/guides/manage-account-and-tokens) para conocer los flujos de la cuenta personal, la sesión y los tokens.

## 1. Entender los roles

FrameKit tiene dos roles:

| Rol | Acceso |
| --- | --- |
| `user` | Iniciar sesión, actualizar su propia cuenta, cambiar su propia contraseña y crear, listar o revocar sus propios tokens de API. |
| `admin` | Todo el acceso de `user`, además de listar usuarios, crear usuarios, editar usuarios, activar y desactivar usuarios, restablecer contraseñas, eliminar usuarios, inspeccionar los metadatos o revocar los tokens de otro usuario. |

La sección Usuarios está oculta para un `user`, pero la visibilidad solo es una comodidad de la interfaz. El servidor comprueba de nuevo el rol y la propiedad en cada operación, por lo que un usuario que no sea administrador no puede obtener acceso a la gestión de usuarios enviando una solicitud directa.

## 2. Crear un usuario

En **Ajustes > Usuarios**, introduce un nombre de usuario y una contraseña temporal, elige `user` o `admin` y selecciona **Crear usuario**. Las cuentas nuevas están activas inmediatamente. El rol predeterminado es `user` cuando no se selecciona el rol de administrador.

Los nombres de usuario deben contener entre 3 y 64 letras ASCII, números, `.`, `_` o `-`. Conservan las mayúsculas y minúsculas introducidas y deben ser únicos sin distinguir entre mayúsculas y minúsculas. Las contraseñas deben tener entre 12 y 256 bytes UTF-8. Las contraseñas se aceptan al crear un usuario, restablecer su contraseña o cambiar tu propia contraseña; no se devuelven en la lista de usuarios ni en los detalles de usuario.

## 3. Editar un usuario

Cada fila de usuario muestra el nombre de usuario, el rol y el estado activo o inactivo. Un administrador puede cambiar el nombre de usuario, el rol y el estado activo, y después seleccionar **Guardar cambios**.

- Un nombre de usuario no válido o duplicado deja al usuario existente sin cambios.
- Desactivar un usuario elimina todas las sesiones de ese usuario. El usuario no puede iniciar sesión mientras esté inactivo y sus tokens de API dejan de autenticarse temporalmente.
- Reactivar un usuario no vuelve a crear las sesiones. El usuario debe iniciar sesión de nuevo, mientras que los tokens de API que no se hayan revocado vuelven a poder usarse.
- Los cambios de rol se aplican en las comprobaciones de autorización posteriores del servidor. Cambiar tu propio rol no cierra la sesión por sí mismo; degradarte elimina el acceso de administrador en las comprobaciones posteriores.

## 4. Restablecer una contraseña

Introduce una contraseña nueva en la fila del usuario y selecciona **Restablecer contraseña**. Un administrador no necesita la contraseña actual del usuario. La contraseña nueva debe tener entre 12 y 256 bytes UTF-8.

Restablecer una contraseña invalida todas las sesiones de ese usuario y conserva sus tokens de API. Restablecer tu propia contraseña termina la sesión actual y te devuelve a `/login`; vuelve a iniciar sesión con la contraseña nueva.

## 5. Inspeccionar y revocar tokens de usuario

Selecciona **Ver tokens** en la fila de un usuario para ver los metadatos de sus tokens. El secreto completo del token nunca se muestra allí. Los metadatos incluyen el nombre, el prefijo corto del token, las horas de creación y del último uso, y el estado activo o revocado.

Un administrador puede seleccionar **Revocar** para revocar el token de otro usuario y confirmar la acción. El token deja de autenticarse, mientras que sus metadatos de revocación siguen disponibles para su revisión. Un `user` solo puede ver y revocar sus propios tokens.

## 6. Eliminar un usuario

Selecciona **Eliminar usuario** y confirma. La eliminación borra el usuario, todas sus sesiones y todos sus tokens de API. Eliminar tu propia cuenta termina la sesión actual y te devuelve a `/login`.

## 7. Mantener un administrador activo

El servidor siempre protege al último administrador activo. Rechaza cada una de estas acciones cuando dejaría al sistema sin un administrador activo:

- eliminar al último administrador activo;
- desactivar al último administrador activo; o
- cambiar el rol del último administrador activo de `admin` a `user`.

La acción se rechaza sin cambiar la cuenta. Si queda otro administrador activo, un administrador puede realizar la misma acción, incluso en su propia cuenta.

## 8. Confiar en la autorización del servidor

La interfaz no concede permisos. Cada acción relacionada con usuarios, contraseñas, estado de actividad y tokens se autoriza en el servidor usando la sesión actual y el estado de usuario almacenado. Un control visible no demuestra que una operación esté permitida, y la ausencia de un control no es la única protección contra el acceso no autorizado.
