---
title: Gestionar tu cuenta y tus tokens
description: Inicia sesión en Studio, actualiza tu cuenta, gestiona las sesiones y crea o revoca tokens de API.
sidebar:
  order: 5
---

Usa esta guía desde la página de **Ajustes** de Studio. Consulta [Usar Studio](/es/users/guides/use-studio) para conocer el flujo completo de Studio y [FrameKit Studio](/es/users/concepts/studio) para conocer el modelo de acceso.

## 1. Iniciar sesión en Studio

Abre `/login` e introduce tu usuario y contraseña. Un inicio de sesión correcto establece una cookie de sesión `framekit_session`. La sesión dura 30 días y protege las secciones `/editor`, `/brand` y `/settings`.

En una base de datos de cuentas vacía, el primer inicio de sesión crea un único administrador activo. Define `FRAMEKIT_ADMIN_PASSWORD` antes de iniciar sesión. `FRAMEKIT_ADMIN_USERNAME` es opcional y su valor predeterminado es `admin`. Una vez que existe un usuario, cambiar estos valores no reemplaza ni restablece los usuarios existentes.

Las credenciales incorrectas, desconocidas, no válidas o inactivas producen un inicio de sesión no autenticado. No se acepta una sesión de un usuario inactivo o eliminado, aunque el navegador todavía conserve su cookie anterior.

## 2. Actualizar tu cuenta

La sección Cuenta muestra tu usuario y tu rol.

### Cambiar tu usuario

Introduce un usuario nuevo y selecciona **Guardar usuario**. Los nombres de usuario:

- contienen entre 3 y 64 letras ASCII, números, `.`, `_` o `-`;
- conservan las mayúsculas y minúsculas que introduzcas; y
- deben ser únicos sin distinguir mayúsculas de minúsculas.

La sesión actual sigue siendo utilizable después de cambiar correctamente el usuario y Studio actualiza la identidad mostrada. Un usuario duplicado o no válido se rechaza sin cambiar la cuenta.

### Cambiar tu contraseña

Introduce la contraseña actual y una contraseña nueva, y selecciona **Cambiar contraseña**. La contraseña nueva debe tener entre 12 y 256 bytes UTF-8.

La contraseña actual se comprueba antes del cambio. Una comprobación fallida mantiene intactas las sesiones existentes. Un cambio correcto invalida todas las sesiones de la cuenta, incluida la sesión del navegador que envió el cambio, y Studio te devuelve a `/login`. Los tokens de API se conservan.

## 3. Cerrar sesión

Selecciona **Cerrar sesión** en la sección Cuenta. Studio invalida la sesión actual, hace caducar su cookie de sesión y vuelve a `/login`. Puedes cerrar sesión de forma segura varias veces, incluso cuando el navegador no tiene una cookie de sesión utilizable.

## 4. Gestionar tokens de API

La sección de tokens de API está disponible para todos los usuarios que hayan iniciado sesión.

### Crear un token

Introduce un nombre y selecciona **Crear token**. El nombre se recorta y debe contener entre 1 y 80 caracteres. Los tokens nuevos comienzan por `fk_`.

Studio muestra el secreto completo solo en la confirmación de creación correcta. Cópialo antes de cerrar la confirmación: el valor completo no se devuelve cuando los tokens se enumeran más adelante y no se puede recuperar. Las listas posteriores muestran metadatos seguros:

- el nombre del token y un prefijo `fk_` corto;
- las horas de creación y de último uso; y
- el estado activo o revocado, incluida la hora de revocación cuando corresponda.

Trata el token completo como un secreto y guárdalo en la integración del lado del servidor que lo utilice. El endpoint actual de renderizado de imágenes del lado del servidor (`POST /api/framekit/images/render`) acepta el token completo como credencial Bearer. Un token funciona solo mientras no esté revocado y su propietario esté activo; cada uso correcto actualiza su hora de último uso.

Desactivar temporalmente al propietario impide que todos los tokens no revocados de ese usuario se autentiquen. Reactivar al propietario vuelve a permitir el uso de esos tokens. Cambiar la contraseña no revoca los tokens de API.

### Revocar un token

Selecciona **Revocar** y confirma. La revocación impide que el token se autentique y conserva sus metadatos, incluido el estado revocado, visibles en la lista. El token no se puede restaurar desde Ajustes. Un usuario normal solo puede revocar sus propios tokens; un administrador también puede consultar y revocar el token de otro usuario desde la sección Usuarios.

## 5. Entender tu rol

Studio muestra tu rol actual en la sección Cuenta. Tanto las cuentas `user` como `admin` pueden gestionar su propia cuenta y sus tokens de API. Los administradores también pueden gestionar usuarios y sus metadatos de tokens; consulta [Gestionar usuarios](/es/users/guides/manage-users).

Los controles de Ajustes no son el límite de seguridad. El servidor comprueba la sesión actual, el rol y la actividad de la cuenta, y aplica las reglas de propiedad del token cuando corresponde en cada operación. Ocultar un control exclusivo de administradores en la interfaz no concede acceso, y una solicitud directa no puede eludir una comprobación de autorización del lado del servidor.
