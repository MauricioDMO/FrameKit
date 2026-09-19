---
title: Solución de problemas de plantillas y recursos
description: Diagnostica problemas de descubrimiento y definición de plantillas y de recursos de imagen.
sidebar:
  order: 3
---

## No se encuentran plantillas

**Síntoma:** La generación indica que no se encontraron plantillas o Studio muestra un catálogo de plantillas vacío.

**Causa probable:** Falta `src/templates/`, está vacío o no contiene ningún directorio con un archivo `template.tsx`.

**Comprobación:** Confirma que `src/templates/` existe y contiene al menos un directorio de plantilla con un `template.tsx` cuya exportación predeterminada sea la definición de la plantilla.

**Solución:** Añade una plantilla válida en `src/templates/` y ejecuta:

```bash
pnpm framekit check
pnpm framekit generate
```

Consulta [Crea tu primera plantilla](/es/users/getting-started/first-template) y la [referencia de plantillas](/es/users/reference/template).

## La generación informa de un segmento de ruta no válido

**Síntoma:** La generación informa de un segmento de plantilla o de directorio de marca no válido.

**Causa probable:** El nombre de un directorio descubierto no está en kebab-case en minúsculas. Los segmentos válidos contienen letras minúsculas, números y guiones simples entre ellos. Los directorios que comienzan por `.` o `_` se ignoran.

**Comprobación:** Inspecciona todos los directorios que puedan descubrirse bajo `src/templates/` o `src/brand/`.

**Solución:** Cambia el nombre del directorio problemático, por ejemplo, de `Hero-Section` a `hero-section`, y vuelve a ejecutar `pnpm framekit generate`.

## La validación de la plantilla falla

**Síntoma:** `pnpm framekit check` o `pnpm framekit build` informa de un error de definición o de contenido de la plantilla.

**Causa probable:** La definición, los valores de los campos, las claves de variante o el contenido resuelto no cumplen el contrato de la plantilla.

**Comprobación:** Ejecuta `pnpm framekit check` y usa la ruta de la plantilla y la regla indicadas para identificar el valor no válido.

**Solución:** Corrige la definición de origen o la variante de contenido y ejecuta `pnpm framekit check`, seguido de `pnpm framekit generate` cuando hayan cambiado los archivos descubiertos. Usa [Campos de plantilla](/es/users/concepts/templates/fields) y [Contenido y variantes](/es/users/concepts/templates/content-and-variants).

## Falta un recurso de plantilla o no cambia

**Síntoma:** Un campo de imagen no puede mostrar un recurso, o Studio sigue mostrando un archivo anterior.

**Causa probable:** El archivo está fuera de los directorios de recursos descubiertos, tiene un nombre de archivo o una extensión no compatibles, su nombre base no coincide con la clave del campo o está en un ámbito o variante que no corresponde, está anidado en un subdirectorio o no se ha actualizado la salida generada.

**Comprobación:** Conserva los archivos compartidos directamente en `assets/common` y los archivos de variante directamente en `assets/<variant>`. Los nombres de los directorios de variante deben comenzar por una letra o un número y pueden contener letras, números, `_` o `-`. Los nombres de archivo de los recursos deben comenzar por una letra o un número y pueden contener letras, números, `.`, `_` o `-`; las extensiones de imagen descubiertas compatibles son `.avif`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg` y `.webp`, sin distinguir mayúsculas y minúsculas.

**Solución:** Mueve o cambia el nombre del archivo de origen y ejecuta:

```bash
pnpm framekit generate
```

No edites `src/generated/framekit/` ni `public/framekit/`. Consulta [Usar recursos de imagen](/es/users/guides/use-image-assets).

## Un directorio de recursos informa de duplicados o subdirectorios

**Síntoma:** La generación informa de recursos duplicados o indica que los recursos no pueden tener subdirectorios.

**Causa probable:** Dos archivos de imagen de un directorio de recursos tienen el mismo nombre base o un recurso se colocó en un directorio anidado.

**Comprobación:** Compara los nombres de archivo después de quitar sus extensiones y enumera el contenido de cada directorio `common` o de variante.

**Solución:** Conserva un archivo por clave de recurso directamente dentro de `assets/common` o `assets/<variant>`, cambia los nombres base duplicados y vuelve a ejecutar `pnpm framekit generate`.
