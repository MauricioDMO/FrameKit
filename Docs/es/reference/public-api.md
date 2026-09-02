# Referencia de la API Pública

## Puntos de Entrada y Exportaciones

### `@mauriciodmo/framekit` (raíz)

El punto de entrada raíz proporciona la API central de tiempo de ejecución para definir, validar y renderizar plantillas, junto con todos los tipos asociados.

La definición canónica usa `meta`, `width`, `height`, `fields`, `variants`,
`content` con solo valores de fields y
`render({ data, assets, variant, width, height })`. Consulta el [contrato de
plantilla](./template-contract.md) para conocer la forma completa. `meta` exige un `title` no
vacío y puede incluir `description`, `marketingDescription` y `tags`. El
[issue #3 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/3) define este
contrato de metadata.

El contrato semántico de fields está definido por el [issue #5 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/5).
El contrato del field choice está definido por el [issue #6 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/6).
El contrato del field boolean está definido por el [issue #7 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/7).
El contrato del field number está definido por el [issue #8 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/8).

`field.number` exige un `defaultValue` numérico finito, no acepta `required` y
admite el control nativo `input` por defecto o el control nativo `slider` cuando
se proporcionan límites `min` y `max` finitos explícitos. Cualquier límite
`min` o `max` proporcionado debe ser finito y estar ordenado, y `step` debe ser
finito y positivo; su valor predeterminado es `1` con semántica numérica/de rango nativa. El contenido, las
ediciones, los datos resueltos y las props de renderizado de number son numbers
finitos. Los strings numéricos se rechazan sin conversión y un draft local
incompleto del editor no es render data.

**Exportaciones del entorno de ejecución**

| Exportación                  | Descripción                                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineTemplate`             | Define y valida la forma canónica de plantilla sin versión, con metadata, fields, variantes, contenido y una función de renderizado                                                                                           |
| `defineTemplateBase`         | Define y valida la base de una plantilla sin una función de renderizado                                                                                                                                                         |
| `field`                      | Colección de constructores de descriptores de campo (`field.text`, `field.color`, `field.number`, `field.image`, `field.choice`, `field.boolean`)                                                                  |
| `Markdown`                   | Renderiza contenido markdown compatible con formato en línea y listas opcionales                                                                                                                                                |
| `validateTemplateBase`       | Valida la forma canónica sin exigir una función de renderizado                                                                                                                                                                  |
| `validateTemplateData`       | Valida los datos de una plantilla contra su definición                                                                                                                                                                          |
| `validateTemplateDefinition` | Valida la integridad estructural de una definición de plantilla                                                                                                                                                                 |
| `resolveTemplateData`        | `resolveTemplateData(definition, variant, edits, assets?)`; aplica valores predeterminados -> contenido de variante -> ediciones y luego assets de imagen |
| `getVariants`                | `getVariants(definition: TemplateBase): string[]`; devuelve las keys de variante de `definition.content`                                                                                                                           |
| `getDefaultValues`           | `getDefaultValues(fields: Record<string, FieldDescriptor>): Record<string, string \| number \| boolean>`; extrae los valores predeterminados de los campos                                                         |

**Exportaciones de tipos**

| Tipo                          | Descripción                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `TemplateFieldKind`           | Tipo de unión discriminada para tipos de campo: `"text"` \| `"color"` \| `"number"` \| `"image"` \| `"choice"` \| `"boolean"`       |
| `ImageFieldScope`             | Alcance de un campo de imagen: `"common"` \| `"variant"`                                                        |
| `BaseFieldDescriptor`         | Forma base compartida por los descriptores de fields text, color e image                                  |
| `FieldDescriptor`             | Unión de descriptores de campo completa para todos los tipos de campo                                          |
| `TextFieldDescriptor`         | Descriptor para campos de texto multilínea, con `minLength` y `maxLength` opcionales                         |
| `ColorFieldDescriptor`        | Descriptor para campos de color                                                                                |
| `NumberFieldDescriptor`       | Descriptor para campos numéricos con default numérico finito obligatorio, límites y step finitos opcionales, y control input/slider nativo                              |
| `ImageFieldDescriptor`        | Descriptor para campos de imagen respaldados por el proyecto                                                  |
| `ChoiceFieldDescriptor`       | Descriptor para opciones string ordenadas de conjunto cerrado y un valor predeterminado obligatorio          |
| `BooleanFieldDescriptor`      | Descriptor para valores binarios con un default booleano opcional (`false` si se omite); Studio usa un checkbox nativo |
| `TemplateAssetManifest`       | Mapas generados de URLs de assets comunes y por variante                                                      |
| `TemplateMeta`                | Objeto exacto de metadata con `title` obligatorio y `description`, `marketingDescription` y `tags` opcionales |
| `TemplateVariants`             | Variante de contenido predeterminada y labels de visualización opcionales                                  |
| `TemplateContent`              | Registro por variante con valores de fields                                                             |
| `TemplateContentEntry`        | Registro parcial de valores de fields para una variante                                                 |
| `TemplateBase`                | Tipo base para una plantilla que contiene definiciones de campos                                               |
| `TemplateDefinition`          | Definición completa de plantilla que combina la estructura base con la configuración                           |
| `TemplateRenderProps`         | Propiedades pasadas a la función de renderizado, incluidos numbers finitos para fields number                |
| `TemplateRegistryEntry`       | Entrada canónica del registro generado de plantillas, con metadata, dimensiones, variantes, assets y un loader dinámico |
| `InferTemplateData<T>`        | Tipo utilitario que extrae la forma de los datos a partir de una definición de plantilla                       |
| `TemplateDataValidationError` | Tipo de error devuelto cuando la validación de datos de una plantilla falla                                    |

---

### Registro generado de plantillas

El comando opcional `framekit generate` escribe el módulo local del proyecto
`src/generated/framekit/templates.ts`. Su única exportación de tiempo de
ejecución es `templates: TemplateRegistryEntry[]`:

```ts
export const templates: TemplateRegistryEntry[] = [
  {
    slug,
    segments,
    meta,
    width,
    height,
    variants,
    variantKeys,
    assets,
    load: () => import("..."),
  },
]
```

Cada entrada contiene `slug`, `segments`, metadata `meta` validada, `width`,
`height`, `variants`, `variantKeys` en el orden de declaración, `assets` y el
loader dinámico `load`, cuya promesa resuelve un módulo con la definición de la
plantilla como exportación predeterminada. El título de la plantilla es
`meta.title`; no existe un campo `title` en el nivel superior. Esta salida es
generada localmente en el proyecto, no una exportación de un punto de entrada
publicado del paquete. `meta.title` proporciona la etiqueta de navegación de
Studio y el encabezado del editor seleccionado; cuando están presentes, Studio
también muestra `description`, `marketingDescription` y `tags` opcionales. Las
dimensiones, variantes, manifest de assets y loader lazy del registro atraviesan
el límite de carga de Studio. Consulta el [issue #12 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/12)
y el [plan del contrato canónico de Studio](../../Plans/Future/issue-13-studio-canonical-contract.md).

`framekit generate` es el comando explícito de regeneración puntual; escribe
`src/generated/framekit/templates.ts` y `src/generated/framekit/brands.ts`.
`framekit dev` los genera inicialmente y los
regenera cuando cambian rutas bajo `src/templates` o `src/brand`. `framekit
check` genera primero, luego valida cada definición y los datos resueltos para
cada variante de contenido con sus assets descubiertos. `framekit build`
ejecuta `check` antes del build de producción y, si tiene éxito, copia los
assets públicos y estáticos de Next al build standalone. `framekit start` no
genera; requiere un build standalone de producción y arranca su servidor.

---

### `@mauriciodmo/framekit/editor`

Proporciona el componente `FrameKitEditor` y las utilidades de navegación asociadas para la experiencia de edición dentro de la aplicación.

`FrameKitEditor` recibe el `template: TemplateRegistryEntry` canónico, además de
la `definition` cargada y `messages` (y el `sidebarCollapsed` opcional). La entrada
del registro proporciona el `slug` y los `assets` del editor; los callers no pasan
props separadas de `slug` ni `assets`.

**Exportaciones del entorno de ejecución**

| Exportación            | Descripción                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `FrameKitEditor`       | Componente React que renderiza la interfaz de edición de plantillas            |
| `FrameKitNavigation`   | Componente React que renderiza el árbol de navegación de plantillas            |
| `humanizeSegment`      | Convierte un segmento de ruta en una etiqueta legible                          |
| `manifestToNavigation` | Convierte entradas de registro de plantillas o marcas en una estructura de árbol de navegación |

**Exportaciones de tipos**

| Tipo                       | Descripción                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `EditorMessages`           | Tipo de catálogo de mensajes para cadenas de interfaz del editor      |
| `TemplateNavigationFolder` | Nodo de navegación que representa una carpeta                         |
| `TemplateNavigationItem`   | Nodo de navegación que representa un elemento de plantilla individual |
| `TemplateNavigationNode`   | Tipo de unión que cubre todos los tipos de nodos de navegación        |

---

### `@mauriciodmo/framekit/studio`

Proporciona el componente `FrameKitStudio`, que combina el editor y la navegación en una interfaz de estudio completa, junto con utilidades de localización.

Su componente principal recibe `{ templates: readonly TemplateRegistryEntry[], brands?: readonly FrameKitStudioBrand[] }` o
`{ templates?: readonly TemplateRegistryEntry[], brands: readonly FrameKitStudioBrand[] }`;
se requiere al menos un catálogo y el catálogo omitido se reemplaza por un
array vacío.

El array generado `templates` se puede pasar directamente a `FrameKitStudio`, sin
un adaptador:

```tsx
import { templates } from './generated/framekit/templates'
import { FrameKitStudio } from '@mauriciodmo/framekit/studio'

<FrameKitStudio templates={templates} />
```

Studio comienza con `definition.variants.default`. Las keys de variante son keys
genéricas de contenido, no identificadores de idioma; las labels de las opciones
usan `definition.variants.labels?.[key] ?? key`. El locale de interfaz de Studio es
una configuración EN/ES independiente y no selecciona ni cambia una variante.

Los seis controles integrados de fields conservan los valores tipados: text usa un
`textarea` nativo, choice un `select` nativo, boolean un checkbox nativo, number
su input numérico o de rango nativo declarado, color su control de color e image su
control de assets del proyecto. Los strings siguen siendo strings, los numbers
siguen siendo numbers finitos y los booleanos siguen siendo booleanos. Los drafts
numéricos temporales permanecen dentro del control number y no se pasan a la
función de renderizado de la plantilla.

Las ediciones del editor se persisten por plantilla y variante bajo
`framekit:<slug>:v2`. El estado anterior se invalida intencionalmente en lugar de
migrarse. La vista previa y el renderizado usan valores tipados confirmados; la
descarga y la copia validan los datos confirmados actuales antes de producir la
salida y enfocan el primer control inválido.

**Exportaciones del entorno de ejecución**

| Exportación         | Descripción                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| `FrameKitStudio`    | Componente React que compone la experiencia completa del estudio                                       |
| `frameKitMessages`  | Catálogo de mensajes predefinidos para cadenas de interfaz del estudio                                 |
| `getFrameKitLocale` | Resuelve una configuración regional compatible a partir de un valor de configuración regional opcional |

**Exportaciones de tipos**

| Tipo                     | Descripción                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `FrameKitStudioBrand`    | Entrada de catálogo de marca con `slug: string`, `title: string`, `segments: string[]`, `description: string` y `load: () => Promise<{ default: unknown }>` |
| `FrameKitLocale`         | Tipo de locale utilizado dentro del estudio                       |
| `FrameKitStudioMessages` | Tipo de catálogo de mensajes para cadenas de interfaz del estudio |

`FrameKitBrandCatalog` es un componente interno y no se exporta desde este
punto de entrada ni desde una ruta de exportación del paquete; no forma parte
de la API pública. Los valores generados `brands`, `brandManifest` y
`brandRegistry` del proyecto tampoco son exportaciones del paquete.

---

### `@mauriciodmo/framekit/studio/root`

**Exportaciones del entorno de ejecución**

| Exportación          | Descripción                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FrameKitStudioRoot` | Componente de servidor que inicia el estudio; debe usarse únicamente en componentes de servidor o layouts. No importar en código del lado del cliente. |

Firma: `FrameKitStudioRoot({ children, htmlClassName? }: { children: React.ReactNode, htmlClassName?: string })`. Emite el shell completo `<html>`, `<head>` y `<body>`, por lo que un layout raíz que lo use no debe anidar otro shell de documento.

---

### `@mauriciodmo/framekit/dev`

Utilidades avanzadas del lado del servidor para flujos de trabajo de desarrollo, incluyendo la creación de servidores de desarrollo, descubrimiento de plantillas, generación de código y vigilancia de archivos. Estos puntos de entrada son exclusivamente del lado del servidor.

**Exportaciones del entorno de ejecución**

| Exportación            | Descripción                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `createDevServer`      | Crea una instancia de servidor de desarrollo                                         |
| `findTemplates`        | Escanea el sistema de archivos en busca de módulos de plantillas                     |
| `findBrandComponents`  | Descubre recursivamente componentes de marca en un directorio                       |
| `collectTemplateSummaries` | Carga y valida resúmenes serializables de plantillas                         |
| `createTemplateModule` | Genera el código fuente del módulo de registro a partir de plantillas descubiertas |
| `createBrandModule`    | Genera un módulo de catálogo de marca a partir de componentes descubiertos           |
| `writeTemplateModule`  | Escribe en disco los módulos generados de plantillas y de marca                      |
| `watchTemplates`       | Observa plantillas, assets y `src/brand` en busca de cambios y ejecuta callbacks     |
| `getServerOptions`     | Resuelve las opciones de configuración del servidor                                  |

**Exportaciones de tipos**

| Tipo                 | Descripción                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `DevServer`          | Tipo de instancia del servidor de desarrollo                     |
| `DevServerOptions`   | Opciones para crear un servidor de desarrollo                    |
| `DiscoveredTemplate` | Plantilla descubierta durante el escaneo del sistema de archivos |
| `DiscoveredBrandComponent` | Componente de marca descubierto, con slug, segmentos, ruta absoluta y descripción |
| `TemplateSummary`    | Metadatos serializables usados por el codegen             |
| `TemplateWatcher`    | Instancia de vigilancia devuelta por `watchTemplates`            |

`createTemplateModule(templates, { outputDirectory, assetsBySlug, summariesBySlug })`
devuelve el código fuente del registro generado de plantillas. Usa el `slug` y
los `segments` de cada plantilla descubierta, el resumen y el manifest de assets
proporcionados (o un manifest vacío) y un loader lazy para el módulo de la
plantilla; lanza un error si falta el resumen de una plantilla.
`writeTemplateModule` descubre las plantillas y marcas, recopila resúmenes y
assets, escribe ambos módulos generados y sincroniza los assets de plantillas
en `public/__framekit/templates`.

Las funciones de codegen escriben el artefacto del proyecto
`src/generated/framekit/brands.ts`, que contiene `brands`, `brandManifest` y
`brandRegistry`. Ese archivo es output generado y no es una exportación de un
punto de entrada publicado de `@mauriciodmo/framekit`; no debe editarse a
mano. Consulta la [referencia del catálogo de componentes de marca](./brand-catalog.md)
para el contrato de descubrimiento y su uso en `/brand`.

---

### `@mauriciodmo/framekit/styles.css`

Importa esta hoja de estilos en el layout de Next.js o en el archivo CSS global para aplicar los estilos base de FrameKit:

```css
@import "@mauriciodmo/framekit/styles.css";
```

O mediante un enlace CSS en el layout:

```tsx
import "@mauriciodmo/framekit/styles.css";
```

---

## Dependencias Paralelas

Las dependencias paralelas de FrameKit son:

- **Next.js**: `>=16 <17`
- **React** y **React DOM**: `>=19 <20`

Estas son dependencias paralelas. El paquete emitirá una advertencia durante la instalación si las versiones instaladas no satisfacen las restricciones, pero la instalación no se bloqueará.

---

## Idoneidad en Navegador vs. Servidor

| Exportación                                              | Lado               | Razón                                                                                                                                                 |
| -------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FrameKitEditor`, `FrameKitStudio`, `FrameKitNavigation` | Cliente            | Componentes React interactivos que gestionan estado y responden a la entrada del usuario                                                              |
| `Markdown`                                               | Servidor o cliente | Componente React puro; la implementación no usa APIs exclusivas del navegador                                                                         |
| `FrameKitStudioRoot`                                     | Servidor           | Utiliza `next/headers` para APIs de nivel de solicitud; debe usarse únicamente en componentes de servidor o layouts                                   |
| Puntos de entrada de `@mauriciodmo/framekit/dev`         | Servidor           | El servidor de desarrollo, el descubrimiento de plantillas, la generación de código y la vigilancia de archivos son operaciones del lado del servidor |

---

## Propiedades del Paquete

- **Sistema de módulos**: Solo ESM (`"type": "module"` en `package.json`). No existe exportación CommonJS.
- **Archivos publicados**: `bin/`, `dist/`, `README.md`, `LICENSE`
- **CLI**: `bin/framekit.js` es el punto de entrada para el ejecutable de línea de comandos `framekit`

[English](../../en/reference/public-api.md) · [Issue #13 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/13)
