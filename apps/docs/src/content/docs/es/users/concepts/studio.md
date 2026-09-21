---
title: FrameKit Studio
description: Comprende las rutas, la estructura de navegación, el estado del editor, la persistencia y el flujo de exportación de Studio.
sidebar:
  order: 4
---

FrameKit Studio es la interfaz del navegador para explorar plantillas generadas y componentes de marca, editar datos de plantilla, previsualizar el resultado y producir una salida PNG. Consume los manifiestos de plantillas y marcas generados; no reemplaza las definiciones de origen bajo `src/templates/` o `src/brand/`.

## Límite de acceso

Studio tiene dos modos de acceso controlados únicamente por
`FRAMEKIT_AUTH_ENABLED`:

- En el modo abierto, cuando la variable falta o es `false`, `/editor` y
  `/brand` se renderizan sin sesión, `/login` redirige a `/editor` y
  `/settings` responde como no encontrado. La API de acceso no existe y el
  renderizado de imágenes no necesita credenciales.
- Cuando la variable es `true`, `/login` es el punto de entrada público. Un
  inicio de sesión correcto crea la sesión `framekit_session` que usa Studio, y
  las secciones de Studio requieren una sesión válida antes de que se renderice
  el cliente:

- `/editor` y `/editor/<template-slug>` para plantillas;
- `/brand` y `/brand/<brand-slug>` para vistas previas de componentes de marca; y
- `/settings` para los ajustes de cuenta y acceso.

En el modo autenticado, una solicitud no autenticada a una sección protegida
redirige a `/login`, y una sesión válida que visita `/login` redirige a
`/editor`. Una sección desconocida produce un 404 en lugar de un estado de
Studio.

La URL raíz del proyecto generado redirige a `/editor`. Consulta [crear un proyecto](/es/users/getting-started/create-project) o [integrar un proyecto existente](/es/users/getting-started/existing-project) para ver la configuración de la ruta y del layout raíz.

## Estructura de navegación

La estructura rodea las secciones disponibles de Studio. Su barra lateral proporciona:

- una pestaña Plantillas que enlaza a `/editor`;
- una pestaña Marca que enlaza a `/brand`;
- carpetas anidadas y enlaces creados a partir de los manifiestos generados;
- un control para contraer y expandir; y
- un menú de apariencia para el idioma de la interfaz, el tema y `/settings` cuando la autenticación está activada.

Las entradas de plantillas y marcas usan sus segmentos del manifiesto como carpetas y se ordenan por su título visible. La entrada seleccionada permanece visible cuando sus carpetas están contraídas. Si una nueva entrada de origen no está visible, vuelve a generar el proyecto antes de editar la salida generada. Consulta [estructura del proyecto](/es/users/getting-started/project-structure) para ver los archivos generados.

## Plantillas y componentes de marca

La sección Plantillas carga una definición de plantilla validada y abre el editor. Una plantilla posee su lienzo fijo, campos, contenido, variantes, assets y función `render`. Por ello, el editor tiene controles editables, una vista previa de lienzo de tamaño fijo, comportamiento de restablecimiento y acciones PNG.

La sección Marca carga una vista previa de marca y su descripción de catálogo. Es una vista de catálogo de solo lectura: muestra la vista previa del componente reutilizable y orientación sobre el código fuente, pero no expone campos de plantilla, variantes, restablecimiento ni acciones de exportación. Los componentes de marca siguen siendo código fuente del proyecto que las plantillas pueden consumir. Consulta [componentes de marca](/es/users/concepts/brand-components) para conocer su contrato de descubrimiento.

## Variantes e idioma de la interfaz

Son conceptos separados:

- Una variante de plantilla es una clave propiedad de la plantilla en `content`. El selector de variantes cambia el contenido y el valor `variant` proporcionado a `render`. `variants.labels` cambia el texto mostrado en ese selector.
- El idioma de la interfaz cambia las etiquetas y los mensajes propios de Studio. Los idiomas actuales de la interfaz son inglés y español. El valor inicial proviene de la cookie `locale` o de `Accept-Language`, y un idioma no compatible recae en español.

Las claves de variantes como `en` o `es` no son metadatos de idioma por sí mismas. Son claves de plantilla normales, a menos que la lógica de renderizado de la plantilla les dé un significado. Consulta [contenido y variantes](/es/users/concepts/templates/content-and-variants) para conocer las reglas de resolución del lado de la plantilla.

## Tema

Usa el menú de apariencia para cambiar entre los temas claro y oscuro. Studio aplica inmediatamente la clase `dark` al documento y guarda la elección en la cookie `theme`. Si no hay una elección guardada, el tema inicial sigue el esquema de color preferido del navegador.

Cambiar el idioma de la interfaz actualiza los mensajes de Studio, el idioma del documento y la cookie `locale`. No cambia la variante de plantilla seleccionada.

## Estados del editor

Studio carga de forma diferida las plantillas y las vistas previas de marca desde sus manifiestos generados. El estado visible depende de la ruta y del resultado de la carga:

| Estado | Significado |
| --- | --- |
| Vacío | `/editor` o `/brand` todavía no tiene una entrada seleccionada. |
| Cargando | Se está cargando la plantilla o la vista previa de marca seleccionada. |
| Listo | El editor de plantillas o el catálogo de marca puede renderizarse. |
| No encontrado | El slug no está presente en el manifiesto generado correspondiente. |
| No válido | Una definición de plantilla no supera la validación o ya no coincide con las dimensiones de su registro. |
| Error de carga | No se pudo cargar el módulo seleccionado. |

Dentro del editor, los datos de campo no válidos aparecen junto a su campo. El editor también muestra un error de datos cuando no se pueden producir los datos resueltos de la plantilla. Durante la descarga o copia, el editor entra en un estado de generación, desactiva la acción de exportación y la vuelve a activar cuando termina la solicitud.

## Campos

El editor crea controles a partir del registro `fields` de la definición cargada. Los tipos de campo actuales se asignan a estos controles:

- `text`: un área de texto multilínea;
- `number`: un campo de entrada numérica nativo o un control deslizante de rango;
- `boolean`: un interruptor;
- `choice`: un selector con las opciones declaradas;
- `color`: un selector de color y un campo de texto hexadecimal; y
- `image`: una vista previa de imagen, con un control de carga durante el desarrollo cuando las cargas están disponibles.

La definición es propietaria de las etiquetas, los valores predeterminados, las opciones y las restricciones de validación. El editor conserva los valores en sus tipos de ejecución declarados e informa de los errores de validación en lugar de convertir los valores no válidos. Consulta [campos de plantilla](/es/users/concepts/templates/fields) para conocer el contrato de autoría.

## Persistencia local y restablecimiento

Studio guarda la variante seleccionada y las ediciones del usuario en el `localStorage` del navegador bajo `framekit:<slug>:v2`. El slug de la plantilla aísla una plantilla de otra, y los datos guardados de cada variante mantienen separada una variante de otra. Estas ediciones sobreviven a una recarga de la página. El estado abierto o cerrado de las carpetas de navegación se conserva por separado.

Este es un estado del editor local del navegador, no un cambio en el código fuente de la plantilla ni un registro de proyecto compartido. Studio solo lee y escribe la clave `v2`; no tiene comportamiento de migración ni de compatibilidad para datos `v1`. Los datos guardados se tratan como no confiables: los registros con formato incorrecto se ignoran, y las variantes, los campos o los valores de ejecución no válidos desconocidos se omiten de forma segura. La edición continúa en memoria si no se puede leer o escribir en el almacenamiento local.

Los borradores numéricos incompletos o no válidos permanecen en el control numérico. No sustituyen el último valor numérico confirmado ni se usan para la vista previa local, la exportación PNG o la persistencia confirmada.

El botón de restablecimiento junto al selector de variantes elimina las ediciones del usuario para la variante activa. Después, vuelve a resolver esa variante a partir de los valores predeterminados de sus campos y del contenido. No restablece otras variantes ni cambia la variante seleccionada.

## Vista previa y zoom

La vista previa de plantilla comienza ajustada a su área disponible y vuelve a calcular ese ajuste cuando cambia el tamaño del contenedor. Sus controles proporcionan:

- `100%` para el tamaño real del lienzo;
- `Fit to view` para un ajuste responsive centrado;
- `Ctrl` más la rueda del ratón para aplicar zoom centrado en el puntero; y
- arrastrar con el puntero para desplazar el lienzo.

El zoom personalizado está limitado entre el 10 % y el 400 %. El catálogo de marca tiene su propia vista previa desplazable y no usa los controles de lienzo de campos del editor de plantillas.

## Cargas de imágenes durante el desarrollo

Las cargas de imágenes están habilitadas por el servidor de desarrollo de FrameKit para los campos de imagen. El control de carga envía `POST /framekit/assets`, un endpoint exclusivo de ese servidor y disponible únicamente mientras `pnpm framekit dev` está en ejecución o mientras se ejecuta su equivalente `pnpm dev` del proyecto generado. No está disponible desde un comando arbitrario `pnpm dev` o `next dev` que no ejecute FrameKit. El editor no muestra el control de carga en producción. Selecciona un archivo PNG, JPEG, WebP o GIF desde un campo de imagen.

El scope del campo determina el destino: un campo `variant` usa el directorio de la variante seleccionada, mientras que un campo `common` usa `assets/common`. El servidor de desarrollo valida la imagen, acepta archivos de hasta 8 MB, reemplaza el asset correspondiente del campo, regenera el manifiesto y vuelve a cargar Studio. Las cargas requieren una solicitud del mismo origen; el modo abierto no necesita sesión, mientras que el modo autenticado requiere una sesión válida de Studio del mismo origen. Consulta [usar recursos de imagen](/es/users/guides/use-image-assets) para conocer el layout de origen y las reglas de scope.

## Salida PNG respaldada por servidor

La vista previa del navegador es local. Descargar PNG y Copiar PNG usan el servidor y envían `POST /api/framekit/images/render`; en el modo abierto la solicitud no necesita credenciales, mientras que el modo autenticado usa la sesión del mismo origen. En ambos modos, el renderizador del servidor resuelve la definición y los assets, valida los datos y devuelve un PNG en lugar de usar la vista previa del navegador como origen de la exportación.

Descargar guarda la imagen devuelta como un archivo PNG. Copiar escribe los datos `image/png` devueltos en el portapapeles del navegador y requiere compatibilidad del portapapeles con imágenes. Si la validación falla, Studio marca los campos afectados y enfoca el primero; si falla el renderizado o la compatibilidad del portapapeles, muestra el estado de error de exportación localizado.

Para conocer los contratos completos de definición, campos, contenido y assets, continúa en la [referencia de plantillas](/es/users/reference/template).
