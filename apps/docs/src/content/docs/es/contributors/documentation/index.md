---
title: Mantenimiento de la documentación
description: Mantén actualizada y enfocada la documentación publicada para contribuidores de FrameKit, separada de las operaciones del repositorio.
---

# Mantenimiento de la documentación

Esta sección es para los contribuidores que mantienen la documentación publicada de FrameKit
bajo `apps/docs/src/content/docs/`. Su responsabilidad principal es mantener cada página útil
para una audiencia y una tarea, sin convertir los planes del repositorio ni las skills de los
agentes en orientación pública del producto.

## Elige la guía de mantenimiento

| Página | Responsabilidad principal |
| --- | --- |
| [Escritura y estructura](/es/contributors/documentation/writing-and-structure) | Añadir o revisar páginas, elegir fuentes autoritativas y mantener alineadas las rutas y las entradas de la barra lateral. |
| [Traducciones y Mermaid](/es/contributors/documentation/translations-and-mermaid) | Mantener la fuente editorial en inglés, preparar la traducción posterior al español y usar diagramas solo cuando aclaren las relaciones. |

Empieza con [primeros pasos para contribuidores](/es/contributors/getting-started) si estás
configurando el repositorio. Usa [desarrollo local](/es/contributors/getting-started/local-development)
para los comandos del workspace de documentación y mantén los contratos dirigidos a consumidores en la [documentación
para usuarios](/es/users/).

## Mantén separados el contenido publicado y el operativo

Las páginas publicadas se encuentran en `apps/docs/src/content/docs/`. `Docs/Plans/` contiene
registros de las fases de implementación y documentación, mientras que `Docs/skills/` contiene
la fuente mantenida de las skills del repositorio y de los proyectos generados. Esos directorios
permanecen fuera del sitio publicado; no los muevas al árbol de documentación ni uses el texto de
planes históricos como orientación actual del producto.

Cuando las fuentes discrepen, da preferencia a los manifiestos de paquetes actuales, la implementación,
las pruebas y la plantilla canónica de consumidor. Trata la documentación histórica fuera del árbol
publicado únicamente como contexto de migración. Omite cualquier comando, ruta, importación, archivo o
comportamiento que no pueda verificarse en el repositorio actual.

## Mantén acotadas las responsabilidades de las páginas

Asigna a cada página una audiencia principal y una responsabilidad principal. Enlaza con la página
propietaria de un procedimiento en lugar de copiarlo en otra guía. Las páginas para contribuidores
explican la propiedad y el mantenimiento del repositorio; las páginas para usuarios explican cómo
crear con FrameKit.

La [guía de desarrollo para contribuidores](/es/contributors/development) conecta la implementación,
la verificación, la distribución, las versiones y el trabajo de documentación. Úsala para encontrar
un propietario existente antes de añadir otra página.
