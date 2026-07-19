# Studio

Studio es el editor visual de plantillas de FrameKit. Permite navegar por un catálogo de plantillas, editar contenido en cualquier variante de idioma admitida, obtener una vista previa de los resultados y exportar imágenes PNG finales, todo directamente en el navegador.

## Navegación

Las plantillas se organizan en la barra lateral a partir de la ruta de su slug. Cada segmento de la ruta se convierte en un nivel de carpeta, de modo que un slug como `social/instagram/post` crea una carpeta `Social` que contiene una subcarpeta `Instagram` con una plantilla `Post` en su interior. Los prefijos de ruta compartidos producen jerarquías de carpetas compartidas automáticamente.

Dentro de cada carpeta, los elementos se ordenan alfabéticamente por título. Los nombres de las carpetas se humanizan a partir de los segmentos de sus slugs (por ejemplo, `instagram-post` se convierte en "Instagram Post").

Al seleccionar una plantilla se navega a `/editor/<slug>`. Las carpetas en la barra lateral se pueden expandir y colapsar, y comienzan expandidas. La plantilla actualmente abierta se marca con `aria-current="page"` para accesibilidad.

## Idioma del diseño vs. Idioma de la interfaz

Studio distingue entre dos aspectos separados del idioma:

El **idioma del diseño** (etiquetado como "Idioma del diseño" en la interfaz) se refiere a qué variante de contenido de la plantilla se está editando. Las plantillas pueden definir claves de idioma arbitrarias — `en`, `es`, `fr` o cualquier cadena — y cada idioma mantiene su propio conjunto de valores de campo. Al cambiar el idioma del diseño se borran todos los mensajes de error de validación que se estén mostrando.

El **idioma de la interfaz** controla el idioma de las etiquetas, botones y mensajes propios de Studio. Está limitado a `en` (inglés) o `es` (español). Al cambiarlo se actualiza el estado de React, el atributo `lang` del elemento `<html>` y se guarda una cookie `locale` con vigencia de un año.

El idioma de la interfaz se resuelve en este orden: la cookie `locale` → la cabecera `Accept-Language` → si la cabecera comienza con `en` se usa inglés → de lo contrario se recurre al español como alternativa.

## Edición de campos

Cada campo de una plantilla se renderiza según su tipo: campo de texto, área de texto, campo numérico, selector de color o campo de URL. El tipo de entrada específico se determina a partir de la definición del campo.

Los campos obligatorios se validan al intentar exportar. Los campos opcionales pasan la validación cuando se dejan vacíos.

Los campos numéricos respetan las restricciones `min` y `max` definidas en la plantilla. Los campos URL aceptan URL absolutas que comienzan con `http://` o `https://`, así como rutas relativas a la raíz que comienzan con `/`.

## Persistencia

Todas las ediciones se almacenan en `localStorage` del navegador bajo la clave `framekit:<slug>:v1`. Cada slug de plantilla tiene su propia entrada de almacenamiento aislada, y los datos también están aislados por idioma dentro de esa entrada.

El estado almacenado con formato incorrecto se descarta de forma segura y el editor comienza desde cero. Las ediciones almacenadas para idiomas o campos que ya no existen se ignoran. No hay sincronización con el servidor, ni cuenta, ni colaboración: todo permanece en el navegador del usuario.

## Restablecer

El botón Restablecer elimina las ediciones solo para el idioma actualmente seleccionado de la plantilla actual. No borra otros idiomas ni otras plantillas.

## Vista previa y zoom

El área de vista previa muestra la plantilla en sus dimensiones declaradas. Al cargarse, se escala para adaptarse al espacio disponible, con un tope del 100% para que la plantilla completa siempre sea visible. La escala mínima es del 10%.

El zoom se controla manteniendo **Ctrl** y girando la rueda del ratón. El zoom se centra en la posición del puntero. El rango de zoom es del 10% al 400%.

Cuando se hace zoom más allá de los bordes del contenedor, se puede desplazar arrastrando el área de vista previa. El cursor de mano indica el modo de desplazamiento; durante el arrastre cambia a mano con dedos.

Dos botones se encuentran en la esquina inferior derecha de la vista previa: **Tamaño real** restaura la escala al 100%, y **Ajustar** readapta la plantilla al contenedor. El autoajuste ante cambios de tamaño de la ventana solo ocurre mientras la vista previa está en modo ajustar; las posiciones de zoom manual se conservan al cambiar el tamaño.

## Exportación PNG

El botón Exportar valida los datos resueltos actuales antes de hacer cualquier otra cosa. Si algún campo no pasa la validación, el primer campo inválido recibe el foco y la exportación se detiene. Una vez superada la validación, el navegador espera a que las fuentes terminen de cargar mediante `document.fonts.ready`, y luego captura la plantilla exactamente en su `ancho×alto` declarado a escala 1 usando `modern-screenshot`.

El navegador descarga entonces un archivo PNG. El nombre del archivo usa el slug de la plantilla con `/` reemplazado por `-` (por ejemplo, `social/instagram/post` se convierte en `social-instagram-post.png`).

La exportación se ejecuta íntegramente en el navegador. No hay renderizado en el servidor, ni opciones de formato, ni controles de escala o DPI en la versión alfa.

## Tema

Studio aplica un tema claro u oscuro. El tema inicial se lee de la cookie `theme` o, si no existe, de la preferencia `prefers-color-scheme` del navegador. Un pequeño script en línea se ejecuta antes de que React se hidrate para aplicar la clase correcta a `<html>` y evitar un destello del tema incorrecto.

El tema se puede cambiar a través del panel de Ajustes. La preferencia se almacena en una cookie con vigencia de un año para que persista entre sesiones.

## Estados

Studio muestra diferentes estados según lo que esté ocurriendo:

- **Vacío** — no hay ninguna plantilla seleccionada. Este es el estado inicial en `/editor`.
- **Cargando** — se está cargando una plantilla. Se muestra mientras la importación dinámica está en curso.
- **Inválido** — la definición de la plantilla no pasó la validación en tiempo de ejecución. La plantilla no se puede editar.
- **Error de carga** — no se pudo cargar la plantilla, por ejemplo una importación dinámica fallida.
- **No encontrado** — la URL no coincide con ningún slug de plantilla. Se trata de un 404 visual dentro del editor, no de un error HTTP 404.

---

[English](../../en/guides/studio.md)
