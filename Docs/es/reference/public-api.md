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
y el [issue #13 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/13).

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

### `@mauriciodmo/framekit/client`

El punto de entrada de cliente proporciona el adaptador para la página privada
de renderizado. `createRenderClient(templates)` cierra sobre el registro
generado del consumidor y devuelve el componente de renderizado del cliente.
Mantén la llamada a la factory en un módulo local del consumidor marcado con
`'use client'`:

```tsx
'use client'

import { createRenderClient } from '@mauriciodmo/framekit/client'
import { templates } from '@framekit/generated/templates'

export const RenderClient = createRenderClient(templates)
```

**Exportaciones del entorno de ejecución**

| Exportación           | Descripción                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `createRenderClient`  | `createRenderClient(templates: readonly TemplateRegistryEntry[])`; devuelve un componente de renderizado del cliente respaldado por el registro proporcionado |

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
| `TemplateCanvas`       | Componente React que renderiza una plantilla con sus dimensiones exactas       |
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

Proporciona el componente `FrameKitStudio`, que combina el editor y la navegación en una interfaz de estudio completa, junto con utilidades de localización y la superficie autenticada de Ajustes.

Su componente principal recibe `{ templates: readonly TemplateRegistryEntry[], brands?: readonly FrameKitStudioBrand[], user?: StudioUser }` o
`{ templates?: readonly TemplateRegistryEntry[], brands: readonly FrameKitStudioBrand[], user?: StudioUser }`;
se requiere al menos un catálogo y el catálogo omitido se reemplaza por un
array vacío. El uso directo de catálogos sigue siendo válido sin `user`; la
página autenticada generada pasa el DTO seguro `StudioUser`.

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
migrarse. La vista previa y el renderizado usan valores tipados confirmados; los
botones actuales de Download y Copy usan el exportador del navegador, validan
los datos confirmados actuales antes de producir la salida y enfocan el primer
control inválido.

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
| `FrameKitStudioSection`  | Unión de secciones autenticadas de Studio: `"editor" \| "brand" \| "settings"` |
| `StudioUser`             | DTO seguro del usuario autenticado con `id`, `username` y `role: "admin" \| "user"`; no contiene contraseñas ni secretos de tokens |
| `FrameKitLocale`         | Tipo de locale utilizado dentro del estudio                       |
| `FrameKitStudioMessages` | Tipo de catálogo de mensajes para cadenas de interfaz del estudio |

`FrameKitBrandCatalog` es un componente interno y no se exporta desde este
punto de entrada ni desde una ruta de exportación del paquete; no forma parte
de la API pública. Los valores generados `brands`, `brandManifest` y
`brandRegistry` del proyecto tampoco son exportaciones del paquete.

La generación de código también escribe `src/generated/framekit/studio-client.tsx`.
Este binding exclusivo del cliente importa `StudioUser`, los `templates` y
`brands` generados, y renderiza `FrameKitStudio` con el `user` autenticado. Se
regenera con `framekit generate` (y con los comandos que generan
automáticamente); no se debe editar a mano. La sección `/settings` usa este DTO
seguro para cambios de cuenta, cambios de contraseña, logout y creación,
consulta y revocación de tokens propios. Los administradores también ven los
controles para crear, actualizar y eliminar usuarios, restablecer contraseñas y
consultar o revocar metadata de tokens. El secreto de un token nuevo se muestra
una sola vez. Ocultar los controles administrativos a usuarios normales es solo
presentación; la autorización del servidor sigue siendo la autoridad. El idioma
de la interfaz y el tema siguen bajo Apariencia, de forma independiente de las
keys de variante de las plantillas.

---

### `@mauriciodmo/framekit/studio/root`

**Exportaciones del entorno de ejecución**

| Exportación          | Descripción                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FrameKitStudioRoot` | Componente de servidor que inicia el estudio; debe usarse únicamente en componentes de servidor o layouts. No importar en código del lado del cliente. |
| `createStudioPage`   | Crea una página autenticada de Next.js para `/editor`, `/brand` y `/settings`, pasando el usuario seguro de la sesión a un binding cliente |
| `createLoginPage`    | Crea la página `/login` y redirige a `/editor` cuando la sesión ya está autenticada |

Firma: `FrameKitStudioRoot({ children, htmlClassName? }: { children: React.ReactNode, htmlClassName?: string })`. Emite el shell completo `<html>`, `<head>` y `<body>`, por lo que un layout raíz que lo use no debe anidar otro shell de documento.

`createStudioPage(StudioClient)` acepta un componente cliente con la forma
`{ user: StudioUser }`. Valida la sección, redirige una sesión ausente o inválida
a `/login` y admite `/editor`, `/brand` y `/settings` (con segmentos opcionales de
slug). `createLoginPage()` muestra el formulario de login y redirige una sesión
autenticada a `/editor`. Ambas factories se exportan desde
`@mauriciodmo/framekit/studio/root`.

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
en `public/framekit/templates`.

Las funciones de codegen escriben el artefacto del proyecto
`src/generated/framekit/brands.ts`, que contiene `brands`, `brandManifest` y
`brandRegistry`. Ese archivo es output generado y no es una exportación de un
punto de entrada publicado de `@mauriciodmo/framekit`; no debe editarse a
mano. Consulta la [referencia del catálogo de componentes de marca](./brand-catalog.md)
para el contrato de descubrimiento y su uso en `/brand`.

---

### `@mauriciodmo/framekit/server`

El punto de entrada de servidor es una fachada exclusiva de Node.js/servidor
para el handler implementado de Acceso de Studio de la Fase 4 y los contratos
existentes de renderizado de imágenes autenticados por API key: configuración y
autenticación, el handler de acceso de Studio, el handler público de imágenes,
preparación de inputs de imagen, trabajos temporales, renderizado PNG en
navegador y el handoff privado de la página de renderizado. La migración de la
API de imágenes autenticada y de Download/Copy server-side de la Fase 6 sigue
pendiente. No se debe importar en bundles del navegador.

**Exportaciones del entorno de ejecución**

| Exportación            | Descripción                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `parseImageApiConfig`  | `parseImageApiConfig(env: NodeJS.ProcessEnv): ImageApiConfig`; analiza la configuración de la API de imágenes |
| `authenticateBearer`   | `authenticateBearer(authorization: string \| null \| undefined, expectedToken: string): boolean`; comprueba un valor de autorización contra un token Bearer esperado con coincidencia exacta |
| `createFrameKitApiHandler` | `createFrameKitApiHandler(templates): (request: Request) => Promise<Response>`; compone las rutas de acceso y la ruta canónica de imágenes bajo `/api/framekit` |
| `createStudioAccessHandler` | `createStudioAccessHandler(): (request: Request) => Promise<Response>`; crea el handler autenticado de sesiones y de gestión de tokens/usuarios de Studio |
| `ImageRenderError`     | `new ImageRenderError(failure: ImageRenderFailure)`; tipo de error con un código público estable y serialización segura |
| `createImageHandler`   | `createImageHandler(templates): (request: Request) => Promise<Response>`; crea el handler autenticado de la API de imágenes PNG |
| `prepareRenderInputs`  | `prepareRenderInputs(options)`; valida los datos de la solicitud y prepara inputs de imagen locales, data URLs y remotos permitidos para renderizar |
| `renderTemplateImage`  | `renderTemplateImage(options): Promise<Buffer>`; renderiza un payload resuelto mediante la página privada y devuelve bytes PNG |
| `createRenderJob`      | `createRenderJob(payload: ResolvedRenderPayload, options?): CreatedRenderJob`; crea un identificador y un token temporales para un trabajo privado de renderizado |
| `loadRenderRequest`    | `loadRenderRequest(id: string, token: string, options?): ResolvedRenderPayload \| undefined`; resuelve el payload de un trabajo privado válido |
| `deleteRenderJob`      | `deleteRenderJob(id: string, options?): void`; elimina un trabajo privado de renderizado |
| `createRenderPage`     | `createRenderPage(RenderClient)`; crea el handoff privado de página de servidor que valida el token de renderizado y pasa el payload resuelto al componente cliente |

#### Handler API unificado de FrameKit

`createFrameKitApiHandler(templates)` es la factory de integración de la
aplicación para el namespace sin versión `/api/framekit`. Delega las rutas de
acceso en `createStudioAccessHandler()` y `POST /api/framekit/images/render` en
`createImageHandler(templates)`. El consumidor generado y el Studio de primera
parte montan esta factory desde un único adapter catch-all en
`src/app/api/framekit/[...action]/route.ts` y exportan `GET`, `POST`, `PATCH` y
`DELETE`.

La acción de imágenes continúa exigiendo `Authorization: Bearer
<FRAMEKIT_API_KEY>` y no requiere un header `Origin`. Las mutaciones de acceso
conservan la autenticación por sesión y la protección de `Origin` del mismo
origen. Las rutas desconocidas devuelven `404`; los métodos no admitidos para la
acción de imágenes devuelven `405` con `Allow: POST`. La ruta anterior
`/api/v1/images` no tiene adapter mantenido y devuelve `404`.

#### Handler de acceso de Studio

`createStudioAccessHandler()` devuelve el handler de Node.js para estas rutas:

```text
POST  /api/framekit/login                 POST  /api/framekit/logout
GET/PATCH /api/framekit/account            POST  /api/framekit/account/password
GET/POST /api/framekit/tokens              DELETE /api/framekit/tokens/:id
GET/POST /api/framekit/users               PATCH/DELETE /api/framekit/users/:id
POST  /api/framekit/users/:id/password     GET  /api/framekit/users/:id/tokens
```

Móntalo desde una ruta exclusiva del servidor y expón los métodos usados arriba.
El login establece la cookie `framekit_session`; las operaciones de cuenta,
contraseña, tokens y usuarios requieren una sesión autenticada. Los usuarios
normales gestionan su propia cuenta y sus tokens, mientras que los
administradores también gestionan usuarios, consultan la metadata de tokens de
cualquier usuario y revocan cualquier token. Las respuestas de login, cuenta y
creación/actualización de usuarios solo exponen los campos seguros de
`StudioUser`: `id`, `username` y `role`; la lista administrativa de usuarios
añade `active`, `createdAt` y `updatedAt`. Ninguna respuesta expone hashes de
contraseñas, secretos de sesión, hashes de tokens ni secretos de tokens ya
devueltos. Crear un token devuelve su secreto completo una sola vez; las
respuestas posteriores contienen únicamente metadata segura y el almacenamiento
contiene únicamente el hash y esa metadata. La búsqueda Bearer de tokens API
calcula el hash de la credencial acotada y no vacía, la acepta solo si el token
no está revocado y su propietario está activo, y actualiza `lastUsedAt` cuando
tiene éxito. No exige el prefijo `fk_` de los tokens generados, por lo que
admite credenciales heredadas importadas. Un `FRAMEKIT_API_KEY` heredado no vacío
se importa como token únicamente durante el bootstrap del primer usuario y no
se sincroniza después.

Las operaciones protegidas de cuenta, tokens y gestión de usuarios devuelven
`401` cuando falta la sesión o no es válida; las credenciales de login inválidas
también devuelven `401`. Logout es idempotente: devuelve `200` y expira la cookie
incluso sin una sesión válida. El handler devuelve `403` para operaciones
prohibidas de usuarios normales o entre orígenes en solicitudes inseguras, `404`
para objetivos desconocidos o inaccesibles y `405` para métodos no admitidos.
Devuelve `409` para nombres de usuario duplicados o intentos de eliminar,
desactivar o degradar al último administrador activo. Las solicitudes inseguras
requieren la comprobación de `Origin` del mismo origen descrita en la guía de
migración.

La UI de acceso de Studio de la Fase 5 está disponible mediante las factories de
página autenticada anteriores. Download/Copy actuales siguen siendo del
navegador; la API de imágenes autenticada y Download/Copy server-side de la Fase
6 siguen pendientes. El handler clásico de imágenes con API key se monta en
`POST /api/framekit/images/render` mediante el adapter unificado.

`parseImageApiConfig` exige `FRAMEKIT_API_KEY` no vacío y
`FRAMEKIT_INTERNAL_ORIGIN`. El origen interno debe ser un origen HTTP de
loopback (`localhost`, `127.0.0.1` o `[::1]` como host IPv6), con un puerto
numérico válido opcional, sin una ruta distinta de `/` y sin query, fragmento ni
credenciales. El esquema HTTP se acepta sin distinguir mayúsculas de
minúsculas. `FRAMEKIT_ALLOWED_IMAGE_HOSTS` es opcional: acepta nombres de host
DNS separados por comas, recorta y convierte a minúsculas cada entrada, ignora
las entradas vacías y deduplica el resultado; un valor vacío o compuesto solo
por comas produce un conjunto vacío. Cada nombre debe tener como máximo 253
caracteres y usar la forma de nombre de host DNS. Se rechazan literales IP,
comodines, puntos finales, puertos, rutas, queries y fragmentos. Las opciones
opcionales `FRAMEKIT_MAX_CONCURRENT_RENDERS` y
`FRAMEKIT_RENDER_TIMEOUT_MS` tienen valores predeterminados de `2` y `30000` ms,
respectivamente, y solo aceptan strings de dígitos decimales en los rangos
inclusivos `1..32` y `1..120000` ms. Se rechazan signos, puntos decimales,
exponentes, espacios en blanco, cero y valores superiores al límite
correspondiente.
Si la configuración falta o es inválida, lanza `ImageRenderError` con el
código `api_not_configured`.

`authenticateBearer(authorization, expectedToken)` solo acepta un valor exacto
`Bearer <token>`: el esquema `Bearer` no distingue mayúsculas de minúsculas,
pero debe haber exactamente un espacio, un token no vacío sin espacios en
blanco ni comas y ningún carácter adicional. La comparación del token sí
distingue mayúsculas de minúsculas. Los valores de autorización ausentes o
malformados devuelven `false`.

**Exportaciones de tipos**

| Tipo                         | Descripción                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `ImageApiConfig`             | Configuración analizada que contiene la clave de API y la configuración de ejecución de render     |
| `ImageRenderRequest`         | Forma de solicitud con `template`, `variant` opcional y datos opcionales                             |
| `ImageRenderRuntimeConfig`   | Configuración de ejecución con origen loopback, hosts de imagen permitidos, concurrencia y timeout |
| `ResolvedRenderPayload`      | Datos de render resueltos y serializables con template, variante, datos, assets, width y height     |
| `CreatedRenderJob`           | Identificador y token de trabajo privado devueltos por `createRenderJob`                          |
| `RenderJobTestOptions`       | Sobrescrituras opcionales del reloj y la fuente de identificadores para tests deterministas       |
| `ImageRenderErrorCode`       | Unión pública de códigos: `invalid_request`, `unauthorized`, `template_not_found`, `request_too_large`, `unsupported_image`, `invalid_template_data`, `image_host_not_allowed`, `image_fetch_failed`, `api_not_configured`, `render_capacity_exhausted`, `render_timeout`, `render_failed` |
| `ImageRenderFailure`         | Forma para construir errores con `code`, `message`, `fields` opcional y `cause` opcional           |
| `ApiTokenMetadata`            | Metadata segura de un token de API: `id`, `name`, `tokenPrefix`, `createdAt`, `lastUsedAt` y `revokedAt`; nunca contiene el secreto del token |
| `CreatedApiToken`             | `ApiTokenMetadata` más `token`; el token completo se devuelve únicamente al crear un token |

`ImageRenderError` conserva un `cause` opcional en la instancia del error, pero
`toSafeFailure()` y `toJSON()` lo omiten. Por tanto, la serialización JSON solo
contiene `code`, `message` y, cuando existe, `fields`; `cause` no es enumerable.
`fields` solo se admite con el código `invalid_template_data` y debe ser un
objeto no nulo que no sea un array.

`createImageHandler(templates)` recibe un registro generado y devuelve un
handler de solicitudes para Node.js. El consumidor generado canónico lo monta
mediante `createFrameKitApiHandler(templates)` en
`POST /api/framekit/images/render` con `runtime = 'nodejs'` y
`dynamic = 'force-dynamic'`. Las solicitudes usan esta forma JSON:

```json
{ "template": "example", "variant": "en", "data": {} }
```

La ruta exige `Authorization: Bearer <FRAMEKIT_API_KEY>`, resuelve y valida la
plantilla seleccionada, prepara los inputs de imagen permitidos y devuelve los
bytes PNG directamente. Las respuestas exitosas son `200 image/png`; los
fallos contienen las propiedades JSON estables `error`, `message` y
`fields` opcional. El handler lee `FRAMEKIT_API_KEY`,
`FRAMEKIT_INTERNAL_ORIGIN` y las opciones de entorno opcionales
`FRAMEKIT_ALLOWED_IMAGE_HOSTS`, `FRAMEKIT_MAX_CONCURRENT_RENDERS` y
`FRAMEKIT_RENDER_TIMEOUT_MS`.

Una solicitud real usando la plantilla generada `example` es:

```http
POST /api/framekit/images/render HTTP/1.1
Authorization: Bearer framekit-smoke-api-key
Content-Type: application/json

{"template":"example","variant":"en","data":{"hero":"https://framekit-smoke.test/image.png"}}
```

El hostname remoto debe ser una entrada exacta de
`FRAMEKIT_ALLOWED_IMAGE_HOSTS` (en este ejemplo, `framekit-smoke.test`). Las URLs de
imágenes remotas deben usar HTTPS y pueden incluir un query string para URLs
firmadas de CDN, pero no pueden contener puerto, credenciales, fragmento ni
literal IP. Node.js las descarga antes de crear el trabajo de render. Chromium recibe el data URL resultante y no puede acceder a una red
externa arbitraria. La verificación TLS debe permanecer activa; un certificado
privado de prueba solo puede suministrarse mediante `NODE_EXTRA_CA_CERTS` en el
proceso del smoke o su montaje equivalente en el contenedor.

Las respuestas exitosas son bytes PNG sin envolver con estado `200`,
`Content-Type: image/png`, `Cache-Control: no-store`,
`X-Content-Type-Options: nosniff`,
`Content-Disposition: inline; filename="example.png"` y un `Content-Length`
coincidente. El cuerpo debe ser no vacío, comenzar con la firma PNG de ocho
bytes, contener `IHDR` en el offset `12` y contener las dimensiones declaradas
`1200x800` como enteros big-endian en los offsets `16` y `20`. Las respuestas de
error son JSON sin cache con `error`, `message` y `fields` únicamente cuando la
validación canónica de datos de plantilla produjo errores por field.

| Error | HTTP | Significado |
| --- | ---: | --- |
| `invalid_request` | 400 | JSON, forma, variante o input inválido |
| `unauthorized` | 401 | Token Bearer ausente o incorrecto |
| `template_not_found` | 404 | Plantilla autenticada desconocida |
| `request_too_large` | 413 | Request o imagen decodificada sobre su límite |
| `unsupported_image` | 415 | MIME/firma de imagen no compatible o inconsistente |
| `invalid_template_data` | 422 | Falló la validación de fields de la plantilla |
| `image_host_not_allowed` | 422 | Host remoto fuera del allowlist exacto |
| `image_fetch_failed` | 502 | No se pudo descargar de forma segura la imagen permitida |
| `api_not_configured` | 503 | Falta configuración de ejecución requerida |
| `render_capacity_exhausted` | 503 | La capacidad de render local del proceso está llena |
| `render_timeout` | 504 | Expiró el plazo end-to-end de render |
| `render_failed` | 500 | El renderizado falló inesperadamente |

Los límites iniciales son un body codificado de solicitud de 12 MB, 8 MB
decodificados por imagen, dos contextos de render simultáneos por proceso
Node.js, un plazo end-to-end de 30 segundos, un TTL de dos minutos para trabajos
en memoria, tres redirects remotos y un único PNG con las dimensiones de la
plantilla y device scale factor `1`. La API está pensada para un proceso Node.js
único de larga duración; no tiene modo serverless/Edge, endpoint público de
trabajos asíncronos, base de datos, cola ni output de render persistente.

El E2E de Playwright del repositorio ejercita un render PNG autenticado con
Chromium real. Las suites Vitest enfocadas cubren autenticación, política de
imágenes remotas, límites y limpieza. `pnpm smoke:docker -- <versión>` valida la
imagen Docker generada durante el release con una versión exacta publicada de
FrameKit; consulta [Pruebas y Distribución](../development/testing-and-distribution.md).

El handoff privado de trabajo/página permanece separado de esta API pública.
El headless shell de Chromium debe instalarse explícitamente con
`framekit browser install` antes de servir solicitudes de renderizado.

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

### Paleta de colores publicada

Después de importar la hoja de estilos, los consumidores pueden sobrescribir
estas 15 variables numéricas de paleta:

```text
--color-fk-forest-100 ... --color-fk-forest-400
--color-fk-mint-100 ... --color-fk-mint-300
--color-fk-sage-100 ... --color-fk-sage-400
--color-fk-ivory-100 ... --color-fk-ivory-400
```

Generan las utilities correspondientes, como `bg-fk-forest-300` y
`text-fk-sage-400`. La paleta se comparte entre todas las superficies y estados
de Studio/editor; no existen variables públicas específicas para botones,
indicadores de carga, toggles o pickers.

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
| `@mauriciodmo/framekit/client`                           | Cliente            | Factory exclusiva del cliente para el adaptador de la página privada de renderizado                                                                  |
| `Markdown`                                               | Servidor o cliente | Componente React puro; la implementación no usa APIs exclusivas del navegador                                                                         |
| `FrameKitStudioRoot`                                     | Servidor           | Utiliza `next/headers` para APIs de nivel de solicitud; debe usarse únicamente en componentes de servidor o layouts                                   |
| Puntos de entrada de `@mauriciodmo/framekit/dev`         | Servidor           | El servidor de desarrollo, el descubrimiento de plantillas, la generación de código y la vigilancia de archivos son operaciones del lado del servidor |
| Punto de entrada `@mauriciodmo/framekit/server`          | Servidor           | Símbolos de configuración, autenticación, preparación de imágenes, trabajos de render y renderizado exclusivos de Node.js/servidor; no incluir en bundles del navegador |

---

## Propiedades del Paquete

- **Sistema de módulos**: Solo ESM (`"type": "module"` en `package.json`). No existe exportación CommonJS.
- **Archivos publicados**: `bin/`, `dist/`, `README.md`, `LICENSE`
- **CLI**: `bin/framekit.js` es el punto de entrada para el ejecutable de línea de comandos `framekit`

[English](../../en/reference/public-api.md) · [Issue #13 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/13)
