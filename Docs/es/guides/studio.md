# Studio

Studio es el espacio de trabajo visual de FrameKit. Permite navegar por un catálogo de plantillas, editar contenido en cualquier variante admitida, obtener una vista previa de los resultados y exportar imágenes PNG finales. También ofrece un catálogo para consultar previews de componentes de marca reutilizables. Ambos flujos se ejecutan en el navegador. Para las plantillas, Studio consume el `TemplateRegistryEntry` generado; sus metadatos validados y su loader diferido son el contrato del catálogo.

## Navegación

Studio tiene dos rutas principales: `/editor` para editar plantillas y `/brand` para catalogar componentes de marca. La barra lateral permite cambiar entre ellas; cada ruta tiene su propio árbol de navegación.

Las plantillas se organizan en una barra lateral compacta a partir de los `segments` de cada entrada del registro. Cada segmento no final de la ruta se convierte en un nivel de carpeta y el segmento final en el elemento de plantilla, de modo que un slug como `social/instagram/post` crea una carpeta `Social` que contiene una subcarpeta `Instagram` con una plantilla `Post` en su interior. Los prefijos de ruta compartidos producen jerarquías de carpetas compartidas automáticamente.

Dentro de cada carpeta, los elementos se ordenan alfabéticamente por título. Los nombres de las carpetas se humanizan a partir de los segmentos de sus slugs (por ejemplo, `instagram-post` se convierte en "Instagram Post").

Al seleccionar una plantilla se navega a `/editor/<slug>`. La navegación usa `entry.meta.title` para el elemento de plantilla y para el encabezado del editor seleccionado; Studio nunca deriva esos títulos visibles del slug. Las carpetas son compactas, se pueden expandir y colapsar, comienzan expandidas y su estado de expansión se guarda en el navegador. Las líneas verticales de alcance, solo de carpetas, aparecen junto a los grupos de hijos de carpetas expandidas, no junto a los enlaces de plantilla. Las pestañas de ruta usan Tabler `IconStack2` para Plantillas y `IconTag` para Marca. La ruta y la plantilla seleccionadas, así como el foco del teclado, mantienen la accesibilidad mediante `aria-current="page"`, `aria-expanded` y estilos de foco visibles. Este árbol solo sirve para navegar; no tiene búsqueda ni filtros.

### Catálogo de marca

La ruta `/brand` usa la misma estructura de barra lateral basada en slugs. Al seleccionar un componente de marca se navega a `/brand/<slug>`; por ejemplo, el componente actual `communication/hero` está disponible en `/brand/communication/hero`. El título y las carpetas de la barra lateral proceden de los metadatos de marca generados, y la navegación es independiente de la navegación de plantillas.

En tiempo de ejecución, cada entrada de marca generada contiene el slug, el título, los segmentos de la ruta, la descripción y un loader para su preview. Studio usa el título y los segmentos para la navegación, y el título y la descripción para el catálogo. El título se deriva del último segmento del directorio, mientras que la descripción procede del primer párrafo de prosa del README del componente. Consulta la guía de [Componentes de marca](./brand-components.md) y la [Referencia del catálogo de marca](../reference/brand-catalog.md) para conocer las reglas de authoring y descubrimiento.

Cuando una ruta de marca tiene un slug coincidente, Studio ejecuta el loader de esa entrada. El loader generado importa `preview.tsx`; Studio toma su exportación por defecto como preview y la renderiza en el catálogo. El catálogo muestra el título generado en la cabecera, la etiqueta `Brand`, el preview en el área de vista previa, la descripción del README en un panel lateral y una indicación que hace referencia a `component.tsx`. Un preview puede importar y renderizar el componente reutilizable, como hace el `preview.tsx` actual de `communication/hero`.

El catálogo de marca sirve para catalogar y comprobar visualmente los previews, no para editar el código ni las props del componente. No ofrece fields de plantilla, edición de variantes, validación de definiciones de plantilla ni el flujo de exportación PNG de plantillas. Las plantillas que reutilizan un componente de marca se siguen editando y renderizando desde `/editor`, donde la plantilla contenedora define sus dimensiones, fields, contenido, assets y comportamiento de exportación.

## Variante vs. idioma de la interfaz

Studio distingue entre dos aspectos separados del idioma:

La **variante** (etiquetada como "Variante" en la interfaz) se refiere a qué entrada de contenido de la plantilla se está editando. Para un estado de editor nuevo, la selección inicial es exactamente `definition.variants.default`. Las plantillas pueden definir keys de variante arbitrarias — `en`, `es`, `fr` o cualquier cadena — y cada variante mantiene su propio conjunto de valores de field. Las opciones siguen el orden de las keys del contenido. Cuando existe `variants.labels`, el texto de una opción es `definition.variants.labels?.[key] ?? key`; sin una etiqueta, se muestra la propia key. Al resolver datos, una variante desconocida es un error y nunca se sustituye silenciosamente por otra; una selección persistida inválida se descarta y un estado nuevo usa el default declarado. Al cambiar la variante se borran todos los mensajes de error de validación que se estén mostrando.

El **idioma de la interfaz** controla el idioma de las etiquetas, botones y mensajes propios de Studio. Está limitado a `en` (inglés) o `es` (español). Es independiente de las variantes de plantilla: cambiarlo no cambia la variante seleccionada. Al cambiarlo se actualiza el estado de React, el atributo `lang` del elemento `<html>` y se guarda una cookie `locale` con vigencia de un año.

El idioma de la interfaz se resuelve en este orden: la cookie `locale` → la cabecera `Accept-Language` → si la cabecera comienza con `en` se usa inglés → de lo contrario se recurre al español como alternativa.

## Edición de campos

Cada uno de los seis tipos de field tiene un control fijo, elegido a partir de la definición:

- `text` usa un textarea multilínea y almacena un string.
- `number` usa el input numérico o el slider de rango nativo declarado y almacena un número finito.
- `choice` usa un select nativo y almacena su opción string declarada.
- `boolean` usa un checkbox nativo y almacena `true` o `false`.
- `color` usa el selector de color y almacena un string.
- `image` usa el control de preview/upload de assets del proyecto y almacena un string de origen del asset cuando se resuelve.

Los borradores del input numérico son locales al control numérico. Un borrador incompleto, como un valor vacío, no entra en los datos confirmados del editor, por lo que el preview sigue usando el último valor numérico confirmado. El preview y el render solo consumen datos tipados resueltos y confirmados; no usan una caché global del último preview válido.

Los campos obligatorios se validan al intentar exportar o copiar. Los campos opcionales pasan la validación cuando se dejan vacíos.

Los campos numéricos respetan sus restricciones declaradas `min`, `max` y `step`. Los campos de imagen pueden previsualizar assets de la plantilla o imágenes desde `public/assets` mediante rutas desde la raíz; Studio en desarrollo también ofrece la ruta de upload del proyecto. Los campos choice conservan el orden declarado y rechazan valores fuera del conjunto con `invalid_choice`; los campos boolean rechazan strings equivalentes con `invalid_boolean`.

## Persistencia

Todas las ediciones se almacenan en `localStorage` del navegador bajo la clave exacta `framekit:<slug>:v2`. Cada slug de plantilla tiene su propia entrada de almacenamiento aislada, y los datos también están aislados por variante dentro de esa entrada. Studio no lee el estado `v1` ni realiza una migración desde v1.

El JSON almacenado con formato incorrecto, un valor almacenado de nivel superior que no sea un objeto o una variante seleccionada que no sea válida para la definición se descartan de forma segura y el editor comienza desde cero. Las entradas de variante obsoletas o malformadas, los fields desconocidos, los valores con tipos incorrectos y los números persistidos inválidos se ignoran. Durante una actualización en vivo de la definición, el estado se reajusta a la definición actualizada: se conservan las variantes reconocidas y los fields con tipos de ejecución aceptados, se elimina la información obsoleta y la variante seleccionada se conserva si sigue siendo válida o se restablece a `definition.variants.default` en caso contrario. La persistencia es local al navegador; no ofrece sincronización con servidor, cuentas ni colaboración.

## Restablecer

El botón Restablecer elimina las ediciones solo para la variante actualmente seleccionada de la plantilla actual. No borra otras variantes ni otras plantillas.

## Vista previa y zoom

El área de vista previa muestra la plantilla en sus dimensiones declaradas usando datos resueltos y confirmados. Al cargarse, se escala para adaptarse al espacio disponible, con un tope del 100% para que la plantilla completa siempre sea visible. La escala mínima es del 10%.

El zoom se controla manteniendo **Ctrl** y girando la rueda del ratón. El zoom se centra en la posición del puntero. El rango de zoom es del 10% al 400%.

Cuando se hace zoom más allá de los bordes del contenedor, se puede desplazar arrastrando el área de vista previa. El cursor de mano indica el modo de desplazamiento; durante el arrastre cambia a mano con dedos.

Dos botones se encuentran en la esquina inferior derecha de la vista previa: **Tamaño real** restaura la escala al 100%, y **Ajustar** readapta la plantilla al contenedor. El autoajuste ante cambios de tamaño de la ventana solo ocurre mientras la vista previa está en modo ajustar; las posiciones de zoom manual se conservan al cambiar el tamaño.

## Exportación PNG

Los botones Exportar y Copiar PNG validan los datos resueltos y confirmados actuales antes de hacer cualquier otra cosa. Si algún campo no pasa la validación, se muestran errores localizados, el primer campo inválido recibe el foco y la acción se detiene. Una vez superada la validación, Exportar espera a que las fuentes terminen de cargar mediante `document.fonts.ready`, y luego captura la plantilla exactamente en su `ancho×alto` declarado a escala 1 usando `modern-screenshot`; Copiar PNG coloca el PNG capturado en el portapapeles cuando es compatible.

Exportar descarga un archivo PNG en el navegador. El nombre del archivo usa el slug de la plantilla con `/` reemplazado por `-` (por ejemplo, `social/instagram/post` se convierte en `social-instagram-post.png`). Copiar PNG coloca la imagen capturada en el portapapeles en lugar de descargarla.

La exportación se ejecuta íntegramente en el navegador. No hay renderizado en el servidor, ni opciones de formato, ni controles de escala o DPI en la versión alfa.

## Tema

Studio aplica un tema claro u oscuro. El tema inicial se lee de la cookie `theme` o, si no existe, de la preferencia `prefers-color-scheme` del navegador. Un pequeño script en línea se ejecuta antes de que React se hidrate para aplicar la clase correcta a `<html>` y evitar un destello del tema incorrecto.

El tema se puede cambiar a través del panel de Ajustes. La preferencia se almacena en una cookie con vigencia de un año para que persista entre sesiones.

## Estados

Studio muestra diferentes estados según lo que esté ocurriendo:

- **Vacío** — no hay ningún elemento seleccionado. `/editor` pide seleccionar una plantilla; `/brand` pide seleccionar un componente de marca. Si el catálogo correspondiente está vacío, la barra lateral muestra su mensaje localizado de que no hay elementos.
- **Cargando** — se está cargando la entrada de plantilla o de marca seleccionada mientras su loader dinámico está en curso. El flujo de marca usa una etiqueta de carga específica para componentes.
- **Inválido** — solo una definición de plantilla puede entrar en este estado: falló la validación en tiempo de ejecución y no se puede editar. El preview de marca no pasa por la validación de definiciones de plantilla.
- **Error de carga** — el loader de una entrada rechazó la carga, por ejemplo tras fallar una importación dinámica. Los errores sin procesar del loader no se exponen; Studio muestra el mensaje localizado de error de carga de plantilla o de marca.
- **Error de datos** — los datos resueltos de la plantilla cargada no son válidos, por ejemplo por una variante o key de field desconocida o por un valor con el tipo incorrecto. Studio muestra su mensaje localizado de error de datos.
- **Error de upload** — falló un upload de imagen en Studio de desarrollo. El field afectado recibe el mensaje localizado de error de upload.
- **Error de exportación** — falló la captura PNG o la copia al portapapeles después de la validación. Studio muestra la alerta localizada de exportación; los fallos de validación siguen asociados a sus fields.
- **No encontrado** — la URL no coincide exactamente con un slug del catálogo activo. Studio muestra un 404 visual localizado y un enlace de vuelta a `/editor` o `/brand`; no es un error HTTP 404.

---

[English](../../en/guides/studio.md)
