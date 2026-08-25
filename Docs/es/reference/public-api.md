# Referencia de la API Pública

## Puntos de Entrada y Exportaciones

### `@mauriciodmo/framekit` (raíz)

El punto de entrada raíz proporciona la API central de tiempo de ejecución para definir, validar y renderizar plantillas, junto con todos los tipos asociados.

La definición canónica usa `meta`, `width`, `height`, `fields`, `variants`,
`content` con solo valores de fields y
`render({ data, assets, variant, width, height })`. Consulta el [contrato de
plantilla](./template-contract.md) para conocer la forma completa y su frontera
entre Studio y el futuro renderizado de servidor. `meta` exige un `title` no
vacío y solo acepta además `description`, `marketingDescription` y `tags`. El
[Plan Futuro #3](../../Plans/Future/issue-03-template-metadata.md) define este
contrato de metadata.

**Exportaciones del entorno de ejecución**

| Exportación                  | Descripción                                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineTemplate`             | Define y valida la forma canónica de plantilla sin versión, con metadata, fields, variantes, contenido y una función de renderizado                                                                                           |
| `defineTemplateBase`         | Define y valida la base de una plantilla sin una función de renderizado                                                                                                                                                         |
| `fields`                     | Colección de constructores de descriptores de campo (`fields.text`, `fields.textarea`, `fields.color`, `fields.number`, `fields.image`)                                                                                |
| `Markdown`                   | Renderiza contenido markdown compatible con formato en línea y listas opcionales                                                                                                                                                |
| `validateTemplateBase`       | Valida la forma canónica sin exigir una función de renderizado                                                                                                                                                                  |
| `validateTemplateData`       | Valida los datos de una plantilla contra su definición                                                                                                                                                                          |
| `validateTemplateDefinition` | Valida la integridad estructural de una definición de plantilla                                                                                                                                                                 |
| `resolveTemplateData`        | `resolveTemplateData(definition, variant, edits, assets?)`; aplica valores predeterminados -> contenido de variante -> ediciones y luego assets de imagen |
| `getLocales`                 | `getLocales(definition: TemplateDefinition): string[]`; devuelve las keys de variante de `definition.content`                                                                                                                    |
| `getDefaultValues`           | `getDefaultValues(fields: Record<string, FieldDescriptor>): Record<string, string>`; extrae los valores predeterminados de los campos                                                                                           |

**Exportaciones de tipos**

| Tipo                          | Descripción                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `TemplateFieldKind`           | Tipo de unión discriminada para tipos de campo: `"text"` \| `"textarea"` \| `"color"` \| `"number"` \| `"image"` |
| `ImageFieldScope`             | Alcance de un campo de imagen: `"common"` \| `"variant"`                                                        |
| `BaseFieldDescriptor`         | Forma base compartida por todos los descriptores de campo                                                      |
| `FieldDescriptor`             | Unión de descriptores de campo completa para todos los tipos de campo                                          |
| `TextFieldDescriptor`         | Descriptor para campos de texto                                                                                |
| `TextareaFieldDescriptor`     | Descriptor para campos de área de texto                                                                        |
| `ColorFieldDescriptor`        | Descriptor para campos de color                                                                                |
| `NumberFieldDescriptor`       | Descriptor para campos numéricos                                                                               |
| `ImageFieldDescriptor`        | Descriptor para campos de imagen respaldados por el proyecto                                                  |
| `TemplateAssetManifest`       | Mapas generados de URLs de assets comunes y por variante                                                      |
| `TemplateMeta`                | Objeto exacto de metadata con `title` obligatorio y `description`, `marketingDescription` y `tags` opcionales |
| `TemplateVariants`             | Variante de contenido predeterminada y labels de visualización opcionales                                  |
| `TemplateContent`              | Registro por variante con valores de fields                                                             |
| `TemplateContentEntry`        | Registro parcial de valores de fields para una variante                                                 |
| `TemplateBase`                | Tipo base para una plantilla que contiene definiciones de campos                                               |
| `TemplateDefinition`          | Definición completa de plantilla que combina la estructura base con la configuración                           |
| `TemplateRenderProps`         | Propiedades pasadas a la función de renderizado de una plantilla                                               |
| `InferTemplateData<T>`        | Tipo utilitario que extrae la forma de los datos a partir de una definición de plantilla                       |
| `TemplateDataValidationError` | Tipo de error devuelto cuando la validación de datos de una plantilla falla                                    |

---

### `@mauriciodmo/framekit/editor`

Proporciona el componente `FrameKitEditor` y las utilidades de navegación asociadas para la experiencia de edición dentro de la aplicación.

**Exportaciones del entorno de ejecución**

| Exportación            | Descripción                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `FrameKitEditor`       | Componente React que renderiza la interfaz de edición de plantillas            |
| `FrameKitNavigation`   | Componente React que renderiza el árbol de navegación de plantillas            |
| `humanizeSegment`      | Convierte un segmento de ruta en una etiqueta legible                          |
| `manifestToNavigation` | Convierte un manifiesto de plantillas en una estructura de árbol de navegación |

**Exportaciones de tipos**

| Tipo                       | Descripción                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `EditorMessages`           | Tipo de catálogo de mensajes para cadenas de interfaz del editor      |
| `TemplateManifestEntry`    | Entrada en un manifiesto de plantillas                                |
| `TemplateNavigationFolder` | Nodo de navegación que representa una carpeta                         |
| `TemplateNavigationItem`   | Nodo de navegación que representa un elemento de plantilla individual |
| `TemplateNavigationNode`   | Tipo de unión que cubre todos los tipos de nodos de navegación        |

---

### `@mauriciodmo/framekit/studio`

Proporciona el componente `FrameKitStudio`, que combina el editor y la navegación en una interfaz de estudio completa, junto con utilidades de localización.

Su componente principal recibe `{ templates: readonly FrameKitStudioTemplate[], brands?: readonly FrameKitStudioBrand[] }`. `brands` es opcional y, si se omite, se usa un catálogo vacío.

**Exportaciones del entorno de ejecución**

| Exportación         | Descripción                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| `FrameKitStudio`    | Componente React que compone la experiencia completa del estudio                                       |
| `frameKitMessages`  | Catálogo de mensajes predefinidos para cadenas de interfaz del estudio                                 |
| `getFrameKitLocale` | Resuelve una configuración regional compatible a partir de un valor de configuración regional opcional |

**Exportaciones de tipos**

| Tipo                     | Descripción                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `FrameKitStudioTemplate` | Tipo de plantilla limitado al contexto del estudio                |
| `FrameKitStudioBrand`    | Entrada de catálogo de marca con `slug: string`, `title: string`, `segments: string[]`, `description: string` y `load: () => Promise<{ default: unknown }>` |
| `FrameKitLocale`         | Tipo de locale utilizado dentro del estudio                       |
| `FrameKitStudioMessages` | Tipo de catálogo de mensajes para cadenas de interfaz del estudio |

`FrameKitBrandCatalog` es un componente interno y no se exporta desde este
punto de entrada; no forma parte de la API pública.

---

### `@mauriciodmo/framekit/studio/root`

**Exportaciones del entorno de ejecución**

| Exportación          | Descripción                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FrameKitStudioRoot` | Componente de servidor que inicia el estudio; debe usarse únicamente en componentes de servidor o layouts. No importar en código del lado del cliente. |

Firma: `FrameKitStudioRoot({ children }: { children: React.ReactNode })`. Emite el shell completo `<html>`, `<head>` y `<body>`, por lo que un layout raíz que lo use no debe anidar otro shell de documento.

---

### `@mauriciodmo/framekit/dev`

Utilidades avanzadas del lado del servidor para flujos de trabajo de desarrollo, incluyendo la creación de servidores de desarrollo, descubrimiento de plantillas, generación de código y vigilancia de archivos. Estos puntos de entrada son exclusivamente del lado del servidor.

**Exportaciones del entorno de ejecución**

| Exportación            | Descripción                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `createDevServer`      | Crea una instancia de servidor de desarrollo                                         |
| `findTemplates`        | Escanea el sistema de archivos en busca de módulos de plantillas                     |
| `findBrandComponents`  | Descubre recursivamente componentes de marca en un directorio                       |
| `createTemplateModule` | Genera un módulo de plantillas a partir de plantillas descubiertas                   |
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
| `TemplateWatcher`    | Instancia de vigilancia devuelta por `watchTemplates`            |

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

[English](../../en/reference/public-api.md)
