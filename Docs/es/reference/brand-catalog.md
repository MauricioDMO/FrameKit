# Catálogo de componentes de marca

FrameKit descubre componentes de marca en `src/brand`, genera un catálogo con
metadatos y carga su `preview.tsx` bajo demanda en Studio. Esta referencia
describe el contrato que implementan el descubrimiento, el codegen y la ruta
`/brand`.

## Contrato de descubrimiento

### Requisitos del escaneo

`findBrandComponents(brandDirectory)` recibe el directorio que se debe
recorrer. El codegen lo invoca con el `src/brand` del proyecto. Si ese
directorio no existe, el resultado es un catálogo vacío (`[]`).

El recorrido es recursivo y aplica estas reglas a cada entrada:

- Solo se recorren directorios.
- Se ignoran los directorios cuyo nombre comienza por `.` o `_`.
- Los demás nombres de directorio deben cumplir
  `^[a-z0-9]+(?:-[a-z0-9]+)*$`: segmentos ASCII en minúsculas, con dígitos y
  guiones simples entre grupos alfanuméricos. Por ejemplo, `social-card` y
  `v2` son válidos; `Social-Card`, `_internal`, `social_card` y
  `social--card` no lo son. Un segmento inválido detiene el escaneo con un
  error.
- Un directorio que contiene `component.tsx` se considera una hoja. No se
  recorren sus subdirectorios.
- Cada hoja debe tener `preview.tsx` y `README.md`. El descubridor comprueba
  que ambas rutas existan; no valida aquí el contenido de `component.tsx`, el
  export de React del preview ni un formato general del README. Sí lee el
  README para extraer `description` según las reglas siguientes.

El `slug` es la unión de los segmentos con `/`. El `title` solo humaniza el
último segmento: separa sus guiones, pone en mayúscula la primera letra de
cada palabra y las une con espacios. El resultado descubierto contiene:

```ts
{
  slug: string
  title: string
  segments: string[]
  absolutePath: string
  description: string
}
```

El catálogo final se ordena por `slug` mediante `localeCompare`.

### Extracción de `description`

La descripción se obtiene del primer párrafo elegible de `README.md`:

1. Se divide por saltos de línea (`LF` o `CRLF`) y se aplica `trim` a cada
   línea.
2. Una línea vacía termina el párrafo actual y devuelve ese párrafo si ya
   había texto.
3. También termina el párrafo actual y omite esa línea una línea que comienza
   por `#`, por tres acentos graves, una lista no ordenada que coincide con
   `- ` o `* `, o una lista ordenada que coincide con un número seguido de `.`
   o `)` y un espacio.
4. Las demás líneas se unen con espacios.
5. Antes de devolver el texto se quitan los destinos de enlaces Markdown
   (`[texto](destino)` queda como `texto`), además de los caracteres
   `` ` ``, `*`, `_` y `~`, y se aplica `trim`.

Si no queda descripción al final, el escaneo falla con `README sin descripción
en: <ruta>`. Un README que contiene un primer párrafo válido devuelve ese
párrafo aunque tenga contenido posterior.

Las reglas anteriores son requisitos del **escaneo**. El descubridor no
comprueba que el componente tenga props concretas, que `preview.tsx` exporte
un componente por defecto ni que el componente y el preview tengan una forma
determinada.

## Codegen y comportamiento posterior

`writeTemplateModule({ projectRoot })` descubre las plantillas y, además,
escanea `path.join(projectRoot, 'src', 'brand')`. Si no hay plantillas, la
operación falla antes de escribir los módulos; que no exista `src/brand` sí es
válido y produce un catálogo de marca vacío.

El codegen escribe, si el contenido cambió, estos archivos generados:

- `src/generated/framekit/brands.ts`: módulo de marca.
- `src/generated/framekit/templates.ts`: módulo de plantillas, generado en
  la misma operación.

El módulo de marca contiene:

- `brands`: array con `slug`, `title`, `segments`, `description` y `load`.
- `brandManifest`: los mismos metadatos, sin `load`.
- `brandRegistry`: objeto que asocia cada `slug` con su `load`.

Cada `load` es una importación dinámica del módulo `preview` de la hoja. La
ruta se calcula relativa a `src/generated/framekit`, se normalizan los
separadores a `/` y se añade `./` cuando hace falta.

Los archivos generados llevan el encabezado `Archivo generado
automáticamente. No modificar.`. No se deben editar manualmente
`src/generated/framekit/brands.ts` ni el resto del output generado: la fuente
editable es `src/brand/**` y la regeneración vuelve a escribir el catálogo.
El codegen usa `writeIfChanged`, por lo que no reescribe un módulo cuyo
contenido no cambió.

### Vigilancia y regeneración

`watchTemplates` observa `projectRoot/src` con `ignoreInitial: true`.

- Cualquier `add`, `unlink` o `change` dentro de `src/brand` solicita una
  regeneración.
- `addDir` y `unlinkDir` dentro de `src/brand` también la solicitan.
- Para plantillas, el watcher conserva sus reglas propias: los cambios de
  `template.tsx`, de `assets` y de directorios de plantillas solicitan
  regeneración.

El servidor de desarrollo genera una vez antes de iniciar Studio. Después,
el callback del watcher vuelve a ejecutar `writeTemplateModule`. Si llega otro
cambio mientras una generación está en curso, el servidor marca una
generación pendiente y ejecuta otra pasada al terminar la actual. Los errores
del watcher y de las regeneraciones programadas se envían al manejador de
errores del servidor; el error de la generación inicial se propaga al iniciar
el servidor.

## Runtime de Studio

`FrameKitStudio` recibe `templates` y el parámetro opcional `brands`. La
interfaz usa `/editor` para plantillas y reconoce `/brand` y cualquier ruta
que empiece por `/brand/` como navegación de marca. La ruta del componente es
el `slug` unido por `/`, por ejemplo `/brand/people/person-quote`.

### Estados del catálogo

- **Sin slug**: en `/brand` muestra el estado vacío de marca. La navegación
  muestra `No hay componentes de marca disponibles.` cuando el catálogo está
  vacío, y el área principal indica que se seleccione un componente.
- **Cargando**: al encontrar un `slug`, Studio busca una entrada con igualdad
  exacta, establece el estado `loading` y ejecuta su `load`. El estado usa la
  etiqueta localizada `Cargando componente...` (o su equivalente en inglés).
- **Listo**: cuando la carga termina, Studio toma `module.default` como el
  preview y entrega a `FrameKitBrandCatalog` el `title`, la `description`, el
  preview y los mensajes de marca. No se ejecuta una validación de definición
  equivalente a la de las plantillas.
- **No encontrado**: si no hay una entrada para el `slug`, la interfaz muestra
  el estado 404 de marca, con el mensaje localizado de componente no
  encontrado y un enlace de vuelta a `/brand`.
- **Error de carga**: si la promesa de `load` rechaza, se muestra el texto de
  `String(error)` en el estado de mensaje. El estado `invalid` pertenece a la
  validación de plantillas, no al preview de marca.

### `FrameKitBrandCatalog`

El componente interno de catálogo recibe exactamente:

```ts
{
  title: string
  description: string
  preview: ComponentType
  messages: {
    componentLabel: string
    previewLabel: string
    descriptionLabel: string
    editHint: string
  }
}
```

Renderiza el título, la etiqueta fija `Brand`, el preview dentro del área de
vista previa y la descripción en un panel lateral. También muestra
`component.tsx` y el texto de edición definido por `messages.editHint`. No
incluye un editor de código ni acciones para modificar el componente.

`FrameKitStudioBrand` sí es un tipo exportado por
`@mauriciodmo/framekit/studio`; `FrameKitBrandCatalog` no se reexporta desde
ese punto de entrada y no forma parte de la API pública del paquete. Para las
exportaciones públicas relacionadas, consulta la [referencia de API
pública](./public-api.md).
