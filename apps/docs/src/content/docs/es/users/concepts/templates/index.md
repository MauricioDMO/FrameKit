---
title: Plantillas
description: Comprende cómo FrameKit descubre, valida, resuelve y renderiza plantillas definidas en código.
sidebar:
  order: 1
  hidden: true
---

Una plantilla de FrameKit es una función de renderizado React definida en código, junto con los metadatos, las dimensiones, los campos, el contenido, las variantes y los recursos que proporcionan sus entradas. Las plantillas se encuentran en `src/templates/` y se descubren a partir de directorios que contienen un archivo `template.tsx`.

## Conceptos de las plantillas

- [Definición de plantilla](/es/users/concepts/templates/definition) — la estructura requerida, los metadatos, las dimensiones y el límite de renderizado.
- [Contenido y variantes](/es/users/concepts/templates/content-and-variants) — las claves de contenido propias de la plantilla, las etiquetas y la precedencia de los datos.
- [Campos](/es/users/concepts/templates/fields) — los seis tipos de campos editables y sus restricciones.
- [Recursos](/es/users/concepts/templates/assets) — imágenes locales de la plantilla, imágenes públicas, descubrimiento y manifiestos.
- [Registro generado](/es/users/concepts/templates/generated-registry) — los metadatos generados y los cargadores diferidos.
- [Renderizado](/es/users/concepts/templates/rendering) — los valores tipados que se proporcionan a `render`.

## Guías de autoría

- [Crear una plantilla](/es/users/guides/create-template) — escribe una definición completa en línea.
- [Separar una definición de plantilla](/es/users/guides/split-template-definition) — separa los datos de la definición de un componente React más complejo.
- [Usar recursos de imagen](/es/users/guides/use-image-assets) — añade imágenes comunes, de variante y públicas.

Para consultar el contrato completo independiente de la versión y el comportamiento de validación, consulta la [referencia de plantillas](/es/users/reference/template).
