# Studio

Studio es el espacio de trabajo visual de FrameKit. Permite navegar por un catálogo de plantillas, editar contenido en cualquier variante admitida, obtener una vista previa de los resultados y exportar imágenes PNG finales. También ofrece un catálogo para consultar previews de componentes de marca reutilizables. Ambos flujos se ejecutan en el navegador.

## Navegación

Studio tiene dos rutas principales: `/editor` para editar plantillas y `/brand` para catalogar componentes de marca. La barra lateral permite cambiar entre ellas; cada ruta tiene su propio árbol de navegación.

Las plantillas se organizan en la barra lateral a partir de la ruta de su slug. Cada segmento de la ruta se convierte en un nivel de carpeta, de modo que un slug como `social/instagram/post` crea una carpeta `Social` que contiene una subcarpeta `Instagram` con una plantilla `Post` en su interior. Los prefijos de ruta compartidos producen jerarquías de carpetas compartidas automáticamente.

Dentro de cada carpeta, los elementos se ordenan alfabéticamente por título. Los nombres de las carpetas se humanizan a partir de los segmentos de sus slugs (por ejemplo, `instagram-post` se convierte en "Instagram Post").

Al seleccionar una plantilla se navega a `/editor/<slug>`. Las carpetas en la barra lateral se pueden expandir y colapsar, y comienzan expandidas. La plantilla actualmente abierta se marca con `aria-current="page"` para accesibilidad.

### Catálogo de marca

La ruta `/brand` usa la misma estructura de barra lateral basada en slugs. Al seleccionar un componente de marca se navega a `/brand/<slug>`; por ejemplo, el componente actual `communication/hero` está disponible en `/brand/communication/hero`. El título y las carpetas de la barra lateral proceden de los metadatos de marca generados, y la navegación es independiente de la navegación de plantillas.

En tiempo de ejecución, cada entrada de marca generada contiene el slug, el título, los segmentos de la ruta, la descripción y un loader para su preview. Studio usa el título y los segmentos para la navegación, y el título y la descripción para el catálogo. El título se deriva del último segmento del directorio, mientras que la descripción procede del primer párrafo de prosa del README del componente. Consulta la guía de [Componentes de marca](./brand-components.md) y la [Referencia del catálogo de marca](../reference/brand-catalog.md) para conocer las reglas de authoring y descubrimiento.

Cuando una ruta de marca tiene un slug coincidente, Studio ejecuta el loader de esa entrada. El loader generado importa `preview.tsx`; Studio toma su exportación por defecto como preview y la renderiza en el catálogo. El catálogo muestra el título generado en la cabecera, la etiqueta `Brand`, el preview en el área de vista previa, la descripción del README en un panel lateral y una indicación que hace referencia a `component.tsx`. Un preview puede importar y renderizar el componente reutilizable, como hace el `preview.tsx` actual de `communication/hero`.

El catálogo de marca sirve para catalogar y comprobar visualmente los previews, no para editar el código ni las props del componente. No ofrece fields de plantilla, edición de variantes, validación de definiciones de plantilla ni el flujo de exportación PNG de plantillas. Las plantillas que reutilizan un componente de marca se siguen editando y renderizando desde `/editor`, donde la plantilla contenedora define sus dimensiones, fields, contenido, assets y comportamiento de exportación.

## Variante de contenido vs. idioma de la interfaz

Studio distingue entre dos aspectos separados del idioma:

La **variante de contenido** (etiquetada como "Variante de contenido" en la interfaz) se refiere a qué entrada de contenido de la plantilla se está editando. Las plantillas pueden definir keys de variante arbitrarias — `en`, `es`, `fr` o cualquier cadena — y cada variante mantiene su propio conjunto de valores de field. Al cambiar la variante se borran todos los mensajes de error de validación que se estén mostrando.

El **idioma de la interfaz** controla el idioma de las etiquetas, botones y mensajes propios de Studio. Está limitado a `en` (inglés) o `es` (español). Al cambiarlo se actualiza el estado de React, el atributo `lang` del elemento `<html>` y se guarda una cookie `locale` con vigencia de un año.

El idioma de la interfaz se resuelve en este orden: la cookie `locale` → la cabecera `Accept-Language` → si la cabecera comienza con `en` se usa inglés → de lo contrario se recurre al español como alternativa.

## Edición de campos

Cada campo de una plantilla se renderiza según su tipo: campo de texto
multilínea, campo numérico, select nativo de opciones, selector de color o vista
previa/upload de imagen.
El tipo de entrada específico se determina a partir de la definición del campo.

Los campos obligatorios se validan al intentar exportar. Los campos opcionales pasan la validación cuando se dejan vacíos.

Los campos numéricos respetan las restricciones `min` y `max` definidas en la plantilla. Los campos de imagen pueden previsualizar assets de la plantilla o imágenes desde `public/assets` mediante rutas desde la raíz. Los campos choice conservan el orden declarado y rechazan valores fuera del conjunto con `invalid_choice`; no usan comportamiento de campo obligatorio.

## Persistencia

Todas las ediciones se almacenan en `localStorage` del navegador bajo la clave `framekit:<slug>:v2`. Cada slug de plantilla tiene su propia entrada de almacenamiento aislada, y los datos también están aislados por variante de contenido dentro de esa entrada. La entrada antigua `v1` se ignora en lugar de migrarse.

El estado almacenado con formato incorrecto se descarta de forma segura y el editor comienza desde cero. Las ediciones almacenadas para variantes o fields que ya no existen se ignoran. No hay sincronización con el servidor, ni cuenta, ni colaboración: todo permanece en el navegador del usuario.

## Restablecer

El botón Restablecer elimina las ediciones solo para la variante actualmente seleccionada de la plantilla actual. No borra otras variantes ni otras plantillas.

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

- **Vacío** — no hay ningún elemento seleccionado. `/editor` pide seleccionar una plantilla; `/brand` pide seleccionar un componente de marca. Si el catálogo correspondiente está vacío, la barra lateral muestra su mensaje localizado de que no hay elementos.
- **Cargando** — se está cargando la entrada de plantilla o de marca seleccionada mientras su loader dinámico está en curso. El flujo de marca usa una etiqueta de carga específica para componentes.
- **Inválido** — solo una definición de plantilla puede entrar en este estado: falló la validación en tiempo de ejecución y no se puede editar. El preview de marca no pasa por la validación de definiciones de plantilla.
- **Error de carga** — el loader de una entrada rechazó la carga, por ejemplo tras fallar una importación dinámica. Studio muestra el `String(error)` resultante en un estado de mensaje; esta guía no promete un texto de error localizado para este caso.
- **No encontrado** — la URL no coincide exactamente con un slug del catálogo activo. Studio muestra un 404 visual localizado y un enlace de vuelta a `/editor` o `/brand`; no es un error HTTP 404.

---

[English](../../en/guides/studio.md)
