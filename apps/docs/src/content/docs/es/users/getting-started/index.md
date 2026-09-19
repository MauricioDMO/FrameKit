---
title: Primeros pasos
description: Elige una ruta para configurar un proyecto de FrameKit, desde los requisitos previos hasta su primera plantilla.
sidebar:
  order: 1
---

Los proyectos de FrameKit son aplicaciones de Next.js con un registro de plantillas generado y un Studio respaldado por un servidor. Elige la ruta que mejor se adapte a tu punto de partida.

## Elige una ruta de configuración

- [Crear un proyecto](/es/users/getting-started/create-project) si vas a iniciar una aplicación nueva. `create-framekit` copia la plantilla canónica del proyecto y puede instalar las dependencias por ti.
- [Integrar un proyecto existente](/es/users/getting-started/existing-project) si ya tienes una aplicación de Next.js y quieres añadir FrameKit sin reemplazar el código de la aplicación.

Ambas rutas conducen al mismo modelo de trabajo:

1. Las plantillas se encuentran en `src/templates/`.
2. FrameKit genera `src/generated/framekit/` a partir de esas plantillas.
3. Studio usa los clientes generados y protege sus rutas con la capa de acceso de FrameKit.
4. [Tu primera plantilla](/es/users/getting-started/first-template) se valida antes de mostrarse en Studio.

## Requisitos

- Node.js `>=22.13.0`.
- pnpm `>=11.14.0` cuando uses pnpm. El creador de proyectos también admite npm para instalar un proyecto generado.
- Un proyecto existente debe usar Next.js `>=16 <17`, React `>=19 <20` y React DOM `>=19 <20`.

La plantilla generada fija versiones compatibles de Next.js y React. FrameKit comprueba el entorno de ejecución de Node.js antes de ejecutar sus comandos de CLI, y el creador de proyectos comprueba la versión de pnpm cuando se usa pnpm para la instalación.

## Después de configurar el proyecto

Lee [la estructura del proyecto](/es/users/getting-started/project-structure) antes de editar archivos generados. Luego sigue [la guía para crear tu primera plantilla](/es/users/getting-started/first-template) para añadir una plantilla con metadatos, una variante y un campo de texto editable.

No edites `src/generated/framekit/`, `public/framekit/` ni `.framekit/` manualmente. Son salidas que se pueden regenerar mediante los procesos de generación y compilación.
