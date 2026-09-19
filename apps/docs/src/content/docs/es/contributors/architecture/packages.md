---
title: Arquitectura de paquetes
description: Consulta qué responsabilidad tiene cada workspace de FrameKit y qué puntos de entrada públicos del paquete forman su contrato.
---

# Arquitectura de paquetes

El repositorio separa el código reutilizable del runtime de las aplicaciones de
primera parte, el scaffolding y la documentación. Los manifiestos de los
paquetes son la fuente de verdad sobre las responsabilidades, los binarios, las
dependencias y las exportaciones públicas.

## Responsabilidades de los workspaces

| Workspace | Responsabilidad | Estado público |
| --- | --- | --- |
| `packages/framekit/` | Modelo compartido de plantillas, componentes de Editor y Studio, runtime de servidor/acceso, codegen, servidor de desarrollo y CLI `framekit`. | Público como `@mauriciodmo/framekit`. |
| `packages/create-framekit/` | Creador de proyectos `create-framekit`, integración con gestores de paquetes, comando de actualización de skills y plantilla canónica para consumidores generados. | Público como `@mauriciodmo/create-framekit`. |
| `apps/studio/` | Integración de Next.js de primera parte, rutas de la aplicación, plantillas y recursos. | Aplicación privada. |
| `apps/docs/` | Integración de Astro, Starlight y Mermaid, y contenido de documentación publicado. | Workspace privado. |

La plantilla canónica forma parte de `packages/create-framekit/`, pero el
runtime que utiliza es el paquete público `@mauriciodmo/framekit`. El Studio de
primera parte usa el mismo paquete público mediante la dependencia del
workspace.

## Límite de `@mauriciodmo/framekit`

El manifiesto publica el runtime reutilizable como un paquete ESM con el
binario `framekit`. La [referencia de la API del paquete para usuarios](/es/users/reference/package-api)
enumera sus puntos de entrada compatibles y responsabilidades; esta página se
centra en las responsabilidades y los límites de importación.

Las API exclusivas de Node pertenecen a los puntos de entrada de servidor y
herramientas; los puntos de entrada de cliente no importan la fachada de
servidor. El cliente de Studio generado usa el punto de entrada de Studio,
mientras que el cliente de renderizado generado usa el punto de entrada de
cliente.

## `@mauriciodmo/create-framekit`

Este paquete publica el binario `create-framekit` y el directorio canónico
`template/`. Su implementación:

- valida el runtime de Node.js y, cuando se selecciona, la versión de pnpm;
- copia la plantilla a un directorio nuevo y cambia el nombre de su `_gitignore`;
- elimina `pnpm-workspace.yaml` cuando se selecciona npm;
- opcionalmente instala las dependencias, ejecuta la aprobación de pnpm y genera el catálogo inicial; y
- opcionalmente inicializa Git y actualiza las skills de la plantilla oficial.

El proyecto generado importa FrameKit desde sus puntos de entrada de paquete e
importa sus registros generados mediante el alias del proyecto
`@framekit/generated/*`. Esto mantiene el código del consumidor independiente
del árbol de código fuente interno del paquete. Consulta la [estructura del proyecto](/es/users/getting-started/project-structure)
para conocer la estructura del consumidor generado y la [referencia del creador](/es/users/reference/cli/create-framekit)
para consultar su contrato de comando dirigido a usuarios.
