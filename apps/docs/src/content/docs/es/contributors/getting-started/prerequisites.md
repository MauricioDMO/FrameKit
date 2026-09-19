---
title: Requisitos previos para colaboradores
description: Comprueba los requisitos de instalación de Node.js, pnpm y el repositorio para el desarrollo de FrameKit.
---

# Requisitos previos para colaboradores

FrameKit es un monorepo privado de pnpm. Comienza desde la raíz del repositorio y usa las versiones declaradas en el `package.json` de la raíz:

- Node.js `>=22.13.0`.
- pnpm `>=11.14.0`.

La raíz también fija el gestor de paquetes con `packageManager: "pnpm@11.14.0"`. El workspace incluye `apps/*` y `packages/*` mediante `pnpm-workspace.yaml`.

## Instalar dependencias

Desde la raíz del repositorio, instala las dependencias resueltas por el lockfile:

```bash
pnpm install --frozen-lockfile
```

Esta es la ruta de instalación para un checkout limpio del workspace. Después de la instalación, `pnpm check:runtime` puede verificar el contrato de versiones del runtime, de los manifiestos, de la documentación y de CI del repositorio.

## Continuar

Sigue [desarrollo local](/es/contributors/getting-started/local-development) para compilar el paquete público e iniciar Studio de primera parte. En su lugar, para una aplicación generada, usa [primeros pasos para usuarios](/es/users/getting-started).
