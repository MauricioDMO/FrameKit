---
title: Solucionar problemas de Studio
description: Diagnostica problemas de selección, carga, edición, subida, exportación y vista previa adaptable de Studio.
sidebar:
  order: 5
---

Usa [Usar Studio](/es/users/guides/use-studio) para el flujo normal y [FrameKit Studio](/es/users/concepts/studio) para conocer las superficies compatibles de Studio.

## Falta una plantilla o una marca en la barra lateral

**Síntoma:** Una plantilla o marca esperada no aparece en Studio.

**Causa probable:** No se descubrió el origen, la generación falló o la entrada pertenece al otro catálogo.

**Comprobación:** Confirma el directorio de origen y ejecuta:

```bash
pnpm framekit check
pnpm framekit generate
```

**Solución:** Corrige el origen en `src/templates/` o `src/brand/` y vuelve a generar. No edites los manifiestos generados. Consulta [Estructura del proyecto](/es/users/getting-started/project-structure), [Registro generado](/es/users/troubleshooting/generated-registry) y la [referencia del catálogo de marcas](/es/users/reference/brand-catalog).

## Una entrada seleccionada está cargando, no se encuentra, no es válida o no está disponible

**Síntoma:** Una plantilla o marca seleccionada sigue cargando, muestra que no se encuentra o muestra un mensaje de error de carga o de definición no válida.

**Causa probable:** El slug de la ruta no coincide con la entrada generada, la importación del módulo falla o una plantilla ya no coincide con sus dimensiones o definición generadas.

**Comprobación:** Abre la entrada desde la barra lateral, inspecciona el error del servidor de desarrollo y ejecuta `pnpm framekit check` seguido de `pnpm framekit generate`.

**Solución:** Usa la entrada generada exacta, corrige la importación o definición de origen indicada, vuelve a generar y recarga Studio. Las rutas de plantillas y las rutas de marcas usan catálogos separados.

## Se rechaza una edición o la exportación vuelve a un campo

**Síntoma:** Un campo muestra un mensaje de validación o la exportación PNG no termina.

**Causa probable:** El valor no cumple el contrato del campo o la variante seleccionada ya no es válida para la definición actual.

**Comprobación:** Verifica los valores obligatorios, las longitudes y los límites y pasos de los números, los valores de las opciones, los booleanos, los colores, los valores de imagen y la variante seleccionada. Consulta [Campos de plantilla](/es/users/concepts/templates/fields) y [Contenido y variantes](/es/users/concepts/templates/content-and-variants).

**Solución:** Corrige el campo indicado, selecciona una variante declarada y vuelve a intentar la exportación. Si cambió la definición de origen, ejecuta `pnpm framekit check` y `pnpm framekit generate` antes de recargar.

## Un restablecimiento o una recarga restaura un valor inesperado

**Síntoma:** Una edición anterior vuelve después de recargar o un valor desaparece después de un cambio en la definición.

**Causa probable:** Studio restaura desde el almacenamiento local del navegador las ediciones válidas de la plantilla y la variante seleccionada; los valores que ya no coinciden con la definición actual se descartan.

**Comprobación:** Selecciona la plantilla y la variante afectadas y compara el valor restaurado con los valores predeterminados y el contenido actual de la plantilla.

**Solución:** Usa el control de restablecimiento para la variante activa y recarga Studio. El restablecimiento solo elimina las ediciones de la variante activa y no edita `template.tsx`. Si el almacenamiento no está disponible o está lleno, continúa en memoria y resuelve el problema de almacenamiento del navegador antes de esperar que las ediciones sobrevivan a una recarga.

## La carga de imágenes no está disponible o falla

**Síntoma:** Falta el control de carga o una carga de imagen muestra un error.

**Causa probable:** El campo seleccionado no es un campo de imagen, el servidor de desarrollo de FrameKit no está en ejecución, la sesión no es válida o el archivo no es compatible o supera los 8 MB.

**Comprobación:** Inicia el servidor de desarrollo de FrameKit, confirma que el usuario tiene la sesión iniciada y comprueba el tipo y el tamaño del archivo.

**Solución:** Ejecuta:

```bash
pnpm framekit dev
```

Usa un PNG, JPEG, WebP o GIF de 8 MB como máximo. Corrige el recurso de origen o el scope del campo y deja que Studio vuelva a generar la salida del proyecto. Consulta [Usar recursos de imagen](/es/users/guides/use-image-assets).

## Falla la descarga o copia del PNG

**Síntoma:** **Descargar PNG** o **Copiar PNG** muestra un fallo.

**Causa probable:** La descarga necesita datos válidos, una sesión activa y un renderizador del lado del servidor operativo. La copia también necesita que el navegador admita la escritura de `image/png` en el portapapeles.

**Comprobación:** Corrige los mensajes de validación de campos, confirma que la sesión está activa e intenta **Descargar PNG**. Si la descarga funciona pero la copia falla, comprueba la compatibilidad del navegador con el portapapeles.

**Solución:** Usa **Descargar PNG** cuando la compatibilidad con el portapapeles no esté disponible. Para errores del servidor, del navegador o de la entrada de imagen, sigue [Solucionar problemas de renderizado de imágenes](/es/users/troubleshooting/rendering).

## La previsualización se recorta en una ventana estrecha

**Síntoma:** El lienzo es más grande que la ventana disponible o deja de estar centrado después de cambiar el tamaño.

**Causa probable:** La previsualización muestra el tamaño de lienzo declarado o un zoom personalizado obsoleto en lugar de ajustarse al contenedor actual.

**Comprobación:** Observa el control de previsualización y el tamaño de la ventana; las dimensiones del lienzo no cambian con la ventana.

**Solución:** Elige **Ajustar** después de cambiar el tamaño. Usa **100%** solo para inspeccionar el tamaño real del lienzo. Estos controles afectan a la vista del editor, no a la definición de origen ni a las dimensiones del PNG.
