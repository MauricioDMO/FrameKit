# Contrato de plantilla

Este documento describe el contrato de plantilla sin versión: el sistema de campos, el manejo de datos por variante, la frontera de renderizado y las reglas de validación compartidas por Studio y un futuro renderizador de servidor.

## Definición canónica

Cada plantilla usa una única forma pública. `meta` es un objeto exacto de
metadata y `variants.default` selecciona una de las entradas de `content`, que
solo contienen valores de fields.

```tsx
export default defineTemplate({
  meta: {
    title: 'Promoción cuadrada',
    description: 'Una imagen promocional para descuentos y ofertas de productos',
    marketingDescription: 'Presentar la oferta, mostrar su precio y motivar al cliente a comprar',
    tags: ['social', 'promoción'],
  },
  width: 1200,
  height: 630,
  fields: { title: fields.text({ label: 'Título' }) },
  variants: {
    default: 'en',
    labels: { en: 'English', es: 'Español' },
  },
  content: {
    en: { title: 'Hello' },
    es: { title: 'Hola' },
  },
  render({ data, assets, variant, width, height }) {
    return <article style={{ width, height }}>{data.title} ({variant})</article>
  },
})
```

La definición no tiene propiedad de versión ni una forma alternativa exclusiva
del editor. `render` recibe únicamente `data`, `assets`, `variant`, `width` y
`height`, por lo que la misma definición puede cruzar una futura frontera de
renderizado de servidor.

## Metadata De La Plantilla

`meta.title` es obligatorio y debe ser un string no vacío. `description` es
opcional y explica para qué sirve la plantilla; `marketingDescription` es
opcional y explica el objetivo concreto de comunicación; `tags` es opcional y
debe ser un array de strings. Estas son las únicas propiedades de metadata
aceptadas. Se rechazan `revision`, `status`, `keywords`, `order` y cualquier otra
propiedad. Una definición sin un `meta.title` válido falla la validación en lugar
de derivar un título desde su directorio.

Las reglas exactas de variantes se rastrean en el [issue #4](https://github.com/MauricioDMO/FrameKit/issues/4).

## Tipos de Campos

Las plantillas definen campos usando el objeto `fields` exportado desde `@mauriciodmo/framekit`. Cada campo tiene un `kind` que determina su comportamiento y las opciones que acepta.

### Opciones Base

Todos los tipos de campos comparten un conjunto común de opciones:

- `label` (string, obligatorio): Un nombre legible para el campo.
- `placeholder` (string, opcional): Texto provisional mostrado en campos vacíos.
- `required` (boolean, valor predeterminado: `true`): Indica si el campo debe tener un valor no vacío. Consulta la sección Requisito más abajo.
- `defaultValue` (string, opcional): Un valor por defecto usado cuando no hay otro valor disponible.

### `text`

Un campo de texto de una sola línea. Acepta solo las opciones base.

```typescript
fields.text({ label: 'Title', placeholder: 'Enter a title' })
```

### `textarea`

Un campo de texto multilínea. Acepta las mismas opciones que `text`.

```typescript
fields.textarea({ label: 'Description', placeholder: 'Write something...' })
```

### `number`

Un campo numérico. Acepta las opciones base más:

- `min` (number, opcional): El valor mínimo aceptable. Debe ser un número finito.
- `max` (number, opcional): El valor máximo aceptable. Debe ser un número finito.

**Importante:** A pesar de ser un campo `number`, el valor almacenado en los datos de la plantilla es siempre un **string**. Las restricciones `min` y `max` validan la interpretación numérica de ese string.

```typescript
fields.number({ label: 'Count', min: 0, max: 100 })
```

### `color`

Un campo selector de color. Acepta solo las opciones base. Los valores no vacíos deben ser colores hexadecimales de seis dígitos con el formato `#RRGGBB`.

```typescript
fields.color({ label: 'Background Color' })
```

### `image`

Un campo de imagen resuelve un asset de la plantilla o una imagen pública desde
`public` como una cadena URL para el navegador. El alcance predeterminado es
`variant`; usa `scope: 'common'` para una imagen compartida por todas las
variantes de contenido. Una imagen pública puede proporcionarse como
`defaultValue` o como valor de la variante, por ejemplo
`/assets/logos/brand.svg`.

```typescript
fields.image({ label: 'Hero image' })
fields.image({ label: 'Background', scope: 'common' })
```

Los archivos por variante usan la key del field como nombre base:

```text
src/templates/social-card/assets/en/hero.webp
src/templates/social-card/assets/common/background.webp
```

Los archivos públicos son servidos directamente por la aplicación. No se
descubren como assets comunes o por variante. Si Studio sube un reemplazo para
el mismo field, FrameKit crea un asset local de la plantilla y ese asset tiene
precedencia.

## Requisito

Los campos son **requeridos por defecto**. Configurar `required: false` hace que un campo sea opcional.

- **Campos opcionales** (`required: false`): Una cadena vacía pasa la validación.
- **Campos requeridos** (por defecto): Una cadena vacía después de eliminar espacios en blanco falla la validación.

El valor predeterminado es `true`, no `false`. Es una decisión deliberada porque la falta de datos obligatorios es un error más frecuente que exigir datos accidentalmente.

## Orden de Resolución de Datos

Cuando una plantilla se renderiza, los valores de los campos se resuelven a través de un orden específico. Esto determina lo que contiene el objeto `data` dentro de la función `render`:

1. **`defaultValue` del campo**: La opción `defaultValue` del campo, o `''` si no está configurada.
2. **Valores de variante de contenido**: Valores del objeto `content` de la plantilla para la variante seleccionada.
3. **Ediciones del usuario**: Valores que el usuario ha editado en el editor de Studio, que sobrescriben todo lo demás.

Para campos de imagen, un asset de la variante tiene prioridad, seguido por un
asset común. Si no existe un asset del proyecto, se usa la resolución normal de
valor predeterminado, contenido y edición del usuario.

Esto significa que las ediciones del usuario tienen precedencia sobre el contenido de la variante, que tiene precedencia sobre los valores por defecto de los campos.

### Resolución programática de datos

Usa `resolveTemplateData` para aplicar este orden de resolución:

```typescript
import { resolveTemplateData } from '@mauriciodmo/framekit'

const data = resolveTemplateData(definition, variant, edits)
```

- `definition`: La definición de la plantilla.
- `variant`: La clave de la variante de contenido a usar. Las variantes desconocidas y las keys de edición desconocidas producen un error accionable.
- `edits`: Un objeto de valores de campos editados por el usuario (el objeto vacío `{}` si no hay ediciones).

### Valores por Defecto

`getDefaultValues` devuelve solo los valores predeterminados de los campos (paso 1), sin aplicar contenido de la variante ni ediciones:

```typescript
import { getDefaultValues } from '@mauriciodmo/framekit'

const defaults = getDefaultValues(definition.fields)
// { fieldKey: definition.fields[fieldKey].defaultValue ?? '' }
```

### Variantes disponibles

`getLocales` devuelve las claves de variante definidas en el objeto `content` de la plantilla:

```typescript
import { getLocales } from '@mauriciodmo/framekit'

const variants = getLocales(definition) // por ejemplo, ['en', 'es']
```

Estas claves son strings arbitrarios elegidos por el autor de la plantilla. No están restringidos a códigos de idioma como `en` o `es`.

## Validación

FrameKit proporciona dos funciones de validación que verifican diferentes aspectos de una plantilla.

### Validación de Definición

`validateTemplateDefinition` verifica la estructura de una definición de plantilla:

- `width` y `height` deben ser enteros finitos positivos
- `meta` debe ser un objeto plano que solo contenga `title`, `description`, `marketingDescription` y `tags`; `title` debe ser no vacío y `tags` debe ser un array de strings
- `variants` debe ser un objeto plano; `variants.default` debe nombrar una entrada de contenido
- `fields.language` está reservado y no puede ser usado
- `content` debe tener al menos una entrada
- Cada entrada de contenido solo puede contener keys de fields declaradas y cada valor debe ser un string
- Las propiedades de nivel superior no soportadas, como `version`, son rechazadas
- `render` debe ser una función
- Las opciones de campo deben tener tipos válidos (por ejemplo, `min`/`max` solo en campos `number`, números finitos solamente)

```typescript
import { validateTemplateDefinition } from '@mauriciodmo/framekit'

const result = validateTemplateDefinition(definition)
if (!result.success) {
  console.error(result.error)
}
```

### Validación de Datos

`validateTemplateData` verifica los valores de los campos contra sus restricciones:

- Campos requeridos: una cadena vacía (tras eliminar los espacios en blanco) no supera la validación
- Campos `number`: el valor debe convertirse en un número finito; debe estar dentro de los límites `min`/`max`
- Campos `color`: los valores no vacíos deben ser colores hexadecimales de seis dígitos con el formato `#RRGGBB`

Los errores se retornan como objetos estructurados con códigos legibles por máquina, no strings localizados:

```typescript
import { validateTemplateData } from '@mauriciodmo/framekit'

const errors = validateTemplateData(definition, data)
// {
//   title: { code: 'required' },
//   count: { code: 'number_too_small', min: 10 },
// }
```

Códigos de error posibles:

- `required`: El campo es requerido y el valor está vacío
- `invalid_number`: El valor no es un número finito
- `number_too_small`: El valor es menor que la restricción `min`
- `number_too_large`: El valor es mayor que la restricción `max`
- `invalid_color`: El valor no es un color hexadecimal de seis dígitos con el formato `#RRGGBB`

### El Comando CLI `check`

El comando `check` valida cada plantilla en un proyecto:

```
framekit check
```

Realiza los siguientes pasos para cada plantilla:

1. Ejecuta `validateTemplateDefinition` para asegurar validez estructural.
2. Resuelve datos para cada variante de contenido usando `resolveTemplateData` sin ediciones del usuario.
3. Ejecuta `validateTemplateData` sobre los valores resueltos para detectar valores por defecto faltantes o inválidos.

Este comando ayuda a detectar errores de configuración antes de ejecutar Studio.

## Idioma de la Interfaz de Studio

FrameKit separa las variantes del contenido de la plantilla del idioma usado por
la interfaz de Studio.

### Variantes de Contenido de Plantilla

Estas son las claves en el objeto `content` de la plantilla. Son strings arbitrarios elegidos por el autor de la plantilla. Una plantilla podría usar claves como `en`, `es`, `fr`, o identificadores completamente diferentes como `desktop`, `mobile`, `newsletter`.

### Idioma de la Interfaz de Studio

La interfaz de Studio (etiquetas, botones y mensajes) usa uno de dos idiomas: español (`es`) o inglés (`en`). Esto se resuelve en el siguiente orden:

1. La cookie `locale`
2. El encabezado `Accept-Language` del navegador
3. Se usa español (`es`) como alternativa

Esta separación significa que las variantes de contenido de la plantilla y el idioma de la interfaz de Studio son preocupaciones independientes.

Este contrato canónico implementa el [Plan Futuro #1](../../Plans/Future/issue-01-canonical-template-contract.md)
y el [issue #1 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/1). El
contrato exacto de metadata está definido por el [Plan Futuro #3](../../Plans/Future/issue-03-template-metadata.md)
y el [issue #3 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/3).

---

[English](../../en/reference/template-contract.md) | [Español](./template-contract.md)
