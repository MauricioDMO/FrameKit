---
title: Solucionar problemas de acceso a Studio
description: Diagnostica problemas de inicio de sesión, sesiones, roles, cuentas, contraseñas, nombres de usuario y acceso a tokens.
sidebar:
  order: 6
---

Usa [Gestionar tu cuenta y tus tokens](/es/users/guides/manage-account-and-tokens) para los flujos de la cuenta personal y los tokens, y [Gestionar usuarios](/es/users/guides/manage-users) para los flujos de administración.

## El inicio de sesión redirige de nuevo a la página de inicio de sesión

**Síntoma:** Abrir `/editor`, `/brand` o `/settings` redirige a `/login`, o el formulario de inicio de sesión indica que las credenciales no son válidas.

**Causa probable:** Falta la cookie de sesión, ha caducado, no es válida o pertenece a un usuario inactivo; el usuario o la contraseña enviados también pueden ser incorrectos.

**Comprobación:** Vuelve a iniciar sesión con las credenciales actuales y confirma que el servidor puede leer la base de datos configurada. Las credenciales desconocidas, con formato incorrecto, incorrectas e inactivas producen intencionadamente el mismo resultado no autenticado.

**Solución:** Vuelve a `/login` e inicia sesión de nuevo. Si la cuenta está inactiva o se restableció la contraseña, pide a un administrador que restaure el acceso o usa la contraseña actual.

## El primer inicio de sesión falla en una base de datos nueva

**Síntoma:** El primer inicio de sesión devuelve un error de servicio no disponible en una base de datos vacía.

**Causa probable:** Falta `FRAMEKIT_ADMIN_PASSWORD` o no es válida, o `FRAMEKIT_ADMIN_USERNAME` no cumple las reglas de las cuentas.

**Comprobación:** Confirma los valores del entorno de ejecución antes de volver a intentarlo. La contraseña debe tener entre 12 y 256 bytes UTF-8; el nombre de usuario opcional tiene `admin` como valor predeterminado y debe contener entre 3 y 64 letras ASCII, números, `.`, `_` o `-`.

**Solución:** Define valores válidos en el entorno de ejecución y vuelve a intentar el primer inicio de sesión. Estos valores solo crean el primer administrador; cambiarlos más adelante no reemplaza a un usuario existente. Consulta [Configuración](/es/users/reference/configuration).

## Una sesión deja de funcionar después de un cambio en la cuenta

**Síntoma:** Una página de Studio abierta anteriormente rechaza una acción posterior o envía al usuario a la página de inicio de sesión.

**Causa probable:** La sesión actual se invalida al cerrar sesión; todas las sesiones se invalidan al cambiar la contraseña, restablecerla un administrador o desactivar o eliminar la cuenta. Las sesiones también caducan después de 30 días.

**Comprobación:** Vuelve a `/login` y autentícate de nuevo con las credenciales actuales.

**Solución:** Inicia sesión de nuevo. Si la cuenta está inactiva o se eliminó, un administrador debe restaurarla o crearla de nuevo.

## Un usuario no puede acceder a una acción de administrador

**Síntoma:** Las acciones de gestión de usuarios devuelven un error de acceso prohibido o no están visibles.

**Causa probable:** Solo un administrador activo puede listar y gestionar usuarios, cambiar el rol o el estado activo de otro usuario, restablecer la contraseña de otro usuario, eliminar un usuario o consultar los metadatos de los tokens de otro usuario y revocar esos tokens.

**Comprobación:** Confirma el rol y el estado activo de la cuenta con la que has iniciado sesión.

**Solución:** Inicia sesión con una cuenta de administrador activa para realizar acciones de administración. Los usuarios aún pueden gestionar su propia cuenta, contraseña y tokens. No trates un control oculto como un límite de autorización.

## Un token de API ya no autentica

**Síntoma:** Una solicitud del lado del servidor que usa `Authorization: Bearer <token>` devuelve un error de no autorizado.

**Causa probable:** El token se revocó, su propietario está inactivo o la solicitud usa un secreto truncado. El token completo solo se muestra cuando se crea.

**Comprobación:** Usa el secreto completo original, confirma que el token no está revocado y confirma que su propietario está activo.

**Solución:** Revoca el token inutilizable y crea uno nuevo en los ajustes de Studio. Guarda el secreto completo en el gestor de secretos del servicio que realiza la llamada, no en un bundle del navegador, una URL, una plantilla o un registro. Consulta [Renderizar imágenes con la API](/es/users/guides/render-images-with-the-api).
