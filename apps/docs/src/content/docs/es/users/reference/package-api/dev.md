---
title: API del paquete de desarrollo
description: Utiliza las utilidades avanzadas de desarrollo del lado del servidor y generación de código de FrameKit.
sidebar:
  order: 8
---

**Importación:** `@mauriciodmo/framekit/dev`  
**Entorno:** herramientas; estas utilidades operan sobre el sistema de archivos del proyecto y el servidor de desarrollo.

Esta es una superficie avanzada de herramientas, no un requisito para la mayoría de los consumidores. Exporta `createDevServer`, auxiliares de descubrimiento de plantillas y marcas, auxiliares de generación de código, `watchTemplates` y `getServerOptions`, junto con sus tipos públicos de herramientas.

## Ejemplo mínimo

```ts
import { createDevServer } from '@mauriciodmo/framekit/dev'

const server = await createDevServer({
  projectRoot: process.cwd(),
  hostname: 'localhost',
  port: 3000
})

await server.close()
```

`createDevServer` genera el registro del proyecto antes de iniciar el servidor de desarrollo de Next.js y supervisa las rutas de plantillas y marcas para detectar cambios. La CLI pública es la interfaz normal compatible para este flujo de trabajo.

## Restricciones de los paquetes y del tiempo de ejecución

Este punto de entrada realiza operaciones de Node.js sobre el sistema de archivos, los procesos y el servidor. Mantenlo fuera de los bundles del navegador y úsalo únicamente en herramientas de desarrollo o compilación. Prefiere [`framekit dev`](/es/users/reference/cli/framekit) a menos que necesites integrar las utilidades de nivel inferior.

Consulta [crear una plantilla](/es/users/guides/create-template), [estructura del proyecto](/es/users/getting-started/project-structure) y la [API del paquete de servidor](/es/users/reference/package-api/server).
