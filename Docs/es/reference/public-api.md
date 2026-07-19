# Referencia de la API Pública

## Puntos de Entrada y Exportaciones

### `@mauriciodmo/framekit` (raíz)

El punto de entrada raíz proporciona la API del entorno de ejecución central para definir, validar y renderizar plantillas, junto con todos los tipos asociados.

**Exportaciones del entorno de ejecución**

| Exportación                  | Descripción                                                                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineTemplate`             | Define una plantilla con campos, renderizado aware de locale y resolución de datos                                                                                                             |
| `defineTemplateBase`         | Define la estructura base de una plantilla sin la configuración completa de la misma                                                                                                           |
| `fields`                     | Colección de constructores de descriptores de campo (`fields.text`, `fields.textarea`, `fields.color`, `fields.url`, `fields.number`)                                                          |
| `Markdown`                   | Renderiza contenido markdown compatible con formato en línea y listas opcionales                                                                                                               |
| `validateTemplateData`       | Valida los datos de una plantilla contra su definición                                                                                                                                         |
| `validateTemplateDefinition` | Valida la integridad estructural de una definición de plantilla                                                                                                                                |
| `resolveTemplateData`        | `resolveTemplateData(definition: TemplateDefinition, locale: string, edits: Record<string, string>): Record<string, string>`; aplica defaults -> contenido del locale -> ediciones del usuario |
| `getLocales`                 | `getLocales(definition: TemplateDefinition): string[]`; devuelve las claves de `definition.content`                                                                                            |
| `getDefaultValues`           | `getDefaultValues(fields: Record<string, FieldDescriptor>): Record<string, string>`; extrae los defaults de los campos                                                                         |

**Exportaciones de tipos**

| Tipo                          | Descripción                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `TemplateFieldKind`           | Tipo de unión discriminada para tipos de campo: `"text"` \| `"textarea"` \| `"color"` \| `"url"` \| `"number"` |
| `BaseFieldDescriptor`         | Forma base compartida por todos los descriptores de campo                                                      |
| `FieldDescriptor`             | Unión de descriptores de campo completa para todos los tipos de campo                                          |
| `TextFieldDescriptor`         | Descriptor para campos de texto                                                                                |
| `TextareaFieldDescriptor`     | Descriptor para campos de área de texto                                                                        |
| `ColorFieldDescriptor`        | Descriptor para campos de color                                                                                |
| `UrlFieldDescriptor`          | Descriptor para campos de URL                                                                                  |
| `NumberFieldDescriptor`       | Descriptor para campos numéricos                                                                               |
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

Su componente principal recibe `{ templates: readonly FrameKitStudioTemplate[] }`.

**Exportaciones del entorno de ejecución**

| Exportación         | Descripción                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| `FrameKitStudio`    | Componente React que compone la experiencia completa del estudio       |
| `frameKitMessages`  | Catálogo de mensajes predefinidos para cadenas de interfaz del estudio |
| `getFrameKitLocale` | Recupera el locale actual desde el contexto del estudio                |

**Exportaciones de tipos**

| Tipo                     | Descripción                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `FrameKitStudioTemplate` | Tipo de plantilla limitado al contexto del estudio                |
| `FrameKitLocale`         | Tipo de locale utilizado dentro del estudio                       |
| `FrameKitStudioMessages` | Tipo de catálogo de mensajes para cadenas de interfaz del estudio |

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
| `createTemplateModule` | Genera un módulo de plantilla a partir de una definición de plantilla                |
| `writeTemplateModule`  | Escribe un módulo de plantilla generado en disco                                     |
| `watchTemplates`       | Observa archivos de plantillas en busca de cambios y ejecuta devoluciones de llamada |
| `getServerOptions`     | Resuelve las opciones de configuración del servidor                                  |

**Exportaciones de tipos**

| Tipo                 | Descripción                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `DevServer`          | Tipo de instancia del servidor de desarrollo                     |
| `DevServerOptions`   | Opciones para crear un servidor de desarrollo                    |
| `DiscoveredTemplate` | Plantilla descubierta durante el escaneo del sistema de archivos |
| `TemplateWatcher`    | Instancia de vigilancia devuelta por `watchTemplates`            |

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
| Utilidades de exportación PNG                            | Navegador          | Dependen del DOM, `document.fonts` y la biblioteca `modern-screenshot`, que requiere APIs del navegador                                               |

---

## Propiedades del Paquete

- **Sistema de módulos**: Solo ESM (`"type": "module"` en `package.json`). No existe exportación CommonJS.
- **Archivos publicados**: `bin/`, `dist/`, `README.md`, `LICENSE`
- **CLI**: `bin/framekit.js` es el punto de entrada para el ejecutable de línea de comandos `framekit`

[English](../../en/reference/public-api.md)
