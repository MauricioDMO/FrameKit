---
title: Autenticación y acceso
description: Elige entre modo abierto o autenticado, configura el acceso inicial a Studio y administra cuentas y tokens de API.
---

FrameKit admite dos modos de acceso controlados por `FRAMEKIT_AUTH_ENABLED`.

## Modo abierto

Cuando `FRAMEKIT_AUTH_ENABLED` no está definido o es `false`, `/editor` y `/brand` están disponibles sin sesión, `/login` redirige a `/editor`, `/settings` y la API de acceso no existen, y el renderizado de imágenes no requiere credenciales.

Usa el modo abierto solo en entornos locales o internos de confianza. Define `FRAMEKIT_AUTH_ENABLED=true` antes de exponer un despliegue a una red no confiable.

## Modo autenticado

Define:

```bash
FRAMEKIT_AUTH_ENABLED=true
FRAMEKIT_ADMIN_PASSWORD='replace-with-a-strong-password'
```

`FRAMEKIT_ADMIN_USERNAME` es opcional y su valor predeterminado es `admin`.

Con una base de datos vacía, el primer inicio de sesión correcto crea el administrador inicial. Después de ese bootstrap, los usuarios y las credenciales se administran desde Settings en Studio en lugar de variables de entorno.

El modo autenticado protege `/editor`, `/brand` y `/settings` mediante la cookie `framekit_session`. Los tokens de API son credenciales separadas pensadas para integraciones externas, como el renderizado de imágenes desde servidor.

## Administrar cuenta y tokens

Los usuarios autenticados pueden actualizar su propia cuenta, cambiar su contraseña, cerrar sesión y crear o revocar sus propios tokens de API.

Consulta [Administrar tu cuenta y tokens](/es/users/guides/manage-account-and-tokens) para el flujo completo.

Los administradores también pueden crear, editar, desactivar, restablecer y eliminar usuarios, inspeccionar metadatos de sus tokens y revocar tokens de otros usuarios.

Consulta [Administrar usuarios](/es/users/guides/manage-users) para los flujos de administración.

## Persistencia en despliegue

El modo autenticado almacena usuarios, sesiones y metadatos de tokens de API en SQLite de forma predeterminada. En despliegues Docker, persiste `/data` y conserva `FRAMEKIT_DATABASE_PATH=/data/framekit.sqlite` salvo que configures intencionalmente otra ubicación.

Consulta [Despliegue](/es/users/deployment) y [Docker y persistencia](/es/users/deployment/docker-and-persistence) para la configuración de producción.
