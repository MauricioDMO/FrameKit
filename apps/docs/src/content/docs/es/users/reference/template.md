---
title: Referencia de plantillas
description: Consulta la definición actual de plantillas de FrameKit, los campos, las variantes, los recursos, el renderizado y los contratos de validación.
sidebar:
  order: 1
---

Este es el contrato público actual de las plantillas. Importa los constructores y tipos de plantillas desde `@mauriciodmo/framekit`.

## Definición

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Square promotion' },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({ label: 'Title' })
  },
  variants: {
    default: 'en',
    labels: { en: 'English' }
  },
  content: {
    en: { title: 'Hello' }
  },
  render ({ data, variant, width, height }) {
    return <article style={{ width, height }}>{data.title} ({variant})</article>
  }
})
```

Las claves de nivel superior aceptadas son `meta`, `width`, `height`, `fields`, `variants`, `content` y `render`. Las propiedades no compatibles se rechazan. `meta` y `variants` son obligatorias. `content` debe tener al menos una entrada y `render` debe ser una función.

### Metadatos

`meta.title` es obligatorio y debe ser una cadena no vacía. Las únicas claves de metadatos opcionales son:

- `description`, una cadena que describe la plantilla;
- `marketingDescription`, una cadena que describe el objetivo de comunicación; y
- `tags`, un array de cadenas.

El nombre del directorio no es un valor alternativo para los metadatos. Un `meta.title` no válido o ausente hace que falle la validación.

### Dimensiones

`width` y `height` deben ser enteros positivos y finitos. Definen el tamaño fijo de salida y se pasan a `render` como valores tipados.

## Contenido y variantes

`content` es un registro no vacío de claves arbitrarias propias de la plantilla. Cada entrada es un registro parcial de valores de `fields`; las claves de campo desconocidas no son válidas. `variants.default` es una cadena no vacía obligatoria y debe nombrar una entrada de contenido. `variants.labels` es opcional y cada clave debe nombrar una entrada de contenido con una etiqueta de cadena no vacía.

Las claves no están restringidas a códigos de idioma. `language`, `en` y `es` no tienen semántica reservada en las plantillas. Una plantilla puede usarlas como claves normales de campo o variante, o elegir nombres como `moon`, `fjord`, `desktop` o `variant-a`.

En el momento del renderizado, los valores se aplican en este orden:

1. valores predeterminados de los campos;
2. valores de `content[variant]`; después
3. ediciones del usuario.

Los campos de cadena sin un valor predeterminado comienzan como `''`, los booleanos sin un valor predeterminado comienzan como `false` y los campos numéricos requieren un valor predeterminado numérico finito. Los valores proporcionados por el contenido o las ediciones ya deben coincidir con el tipo de tiempo de ejecución del campo.

Usa las funciones auxiliares públicas al resolver datos mediante programación:

```tsx
import { getDefaultValues, getVariants, resolveTemplateData } from '@mauriciodmo/framekit'
import type { TemplateDefinition } from '@mauriciodmo/framekit'

declare const definition: TemplateDefinition

const defaults = getDefaultValues(definition.fields)
const variants = getVariants(definition)
const data = resolveTemplateData(definition, variants[0], {})
```

`resolveTemplateData` rechaza una variante desconocida, una clave de campo desconocida, un objeto de ediciones que no sea plano o un valor con el tipo de tiempo de ejecución incorrecto.

## Campos

La propiedad de la definición se llama `fields`; el espacio de nombres público del constructor es singular, `field`. Los seis tipos son `text`, `number`, `boolean`, `choice`, `color` e `image`.

### Campos de cadena compartidos

Los campos de texto, color e imagen aceptan `label`, `placeholder` opcional, `defaultValue` de cadena opcional y `required` opcional. Son obligatorios de forma predeterminada. `required: false` permite una cadena vacía. Un valor obligatorio vacío se comprueba después de recortarlo.

### `text`

`field.text` conserva los saltos de línea. `minLength` y `maxLength` opcionales deben ser enteros finitos no negativos, y `minLength` no puede superar `maxLength`. La validación de datos mide la longitud antes de recortar.

```tsx
field.text({
  label: 'Description',
  placeholder: 'Write something...',
  minLength: 1,
  maxLength: 240
})
```

### `number`

`field.number` requiere un `defaultValue` numérico finito y no acepta `required`. También acepta un `placeholder` de cadena opcional. `min` y `max` opcionales son límites finitos y deben estar ordenados cuando ambos están presentes. `step` es finito y positivo, y su valor predeterminado es `1`. `control` es `'input'` de forma predeterminada o `'slider'` para un control de rango nativo. Los campos slider requieren límites `min` y `max` finitos explícitos.

Los valores predeterminados numéricos, los valores del contenido, las ediciones, los datos resueltos y las props de renderizado deben ser números finitos. Las cadenas numéricas se rechazan. Los valores deben cumplir los límites y el step declarados. El `placeholder` se pasa a la entrada numérica nativa; el control slider no muestra un placeholder.

```tsx
field.number({
  label: 'Opacity',
  defaultValue: 100,
  min: 0,
  max: 100,
  step: 1,
  control: 'slider'
})
```

### `boolean`

`field.boolean` acepta `label` y un `defaultValue` booleano opcional. El valor predeterminado es `false`. Los valores booleanos no se convierten desde cadenas o números.

```tsx
field.boolean({ label: 'Show logo', defaultValue: true })
```

### `choice`

`field.choice` requiere un array `options` ordenado y no vacío. Cada opción tiene un `value` de cadena único y no vacío y un `label` de cadena no vacío; `defaultValue` debe coincidir con un valor de opción. Los campos choice no aceptan `required`, `control` ni `step`; los valores no se recortan ni se convierten.

```tsx
field.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ],
  defaultValue: 'center'
})
```

### `color`

La validación de datos recorta la cadena enviada antes de comprobarla. Después de recortarlos, los valores de color no vacíos deben coincidir con el formato hexadecimal de seis dígitos `#RRGGBB`, sin distinguir mayúsculas y minúsculas.

```tsx
field.color({ label: 'Background color', defaultValue: '#173d31' })
```

### `image`

`field.image` añade `scope: 'common' | 'variant'`, cuyo valor predeterminado es `variant`. El valor es una cadena de URL del navegador después de resolver los recursos. Un campo con ámbito de variante usa primero un recurso de variante coincidente y después un recurso común coincidente. Un campo con ámbito común usa el recurso común coincidente.

```tsx
field.image({ label: 'Hero image' })
field.image({ label: 'Background', scope: 'common' })
```

## Recursos

Las imágenes locales de la plantilla son archivos directos en `assets/common` o `assets/<variant>` junto a `template.tsx`. Las extensiones compatibles son `.avif`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg` y `.webp`. Los directorios de recursos no pueden contener subdirectorios. Los nombres de recursos deben coincidir con `[A-Za-z0-9][A-Za-z0-9._-]*`, y el nombre base se convierte en la clave del manifiesto. Los archivos públicos no se escanean y pueden referenciarse con valores relativos a la raíz como `/assets/logos/brand.svg`.

La forma pública de `TemplateAssetManifest` es:

```ts
interface TemplateAssetManifest {
  common: Record<string, string>
  variants: Record<string, Record<string, string>>
}
```

## Props de renderizado

`render` recibe `TemplateRenderProps`, que contiene únicamente:

- `data`, inferido a partir de los campos declarados;
- `assets`, el manifiesto común y de variantes generado;
- `variant`, una de las claves de contenido;
- `width`, el ancho de la definición; y
- `height`, el alto de la definición.

```tsx
import type { TemplateRenderProps } from '@mauriciodmo/framekit'

type Props = TemplateRenderProps
```

El renderizador devuelve un nodo de React y debe usar las dimensiones fijas proporcionadas para su lienzo de salida. No recibe descriptores de campos, ediciones ni el estado de localización.

## Descubrimiento y registro generado

Las plantillas se descubren recursivamente debajo de `src/templates/`. Se omiten los directorios ocultos y los directorios cuyo nombre comienza por `_`. Los demás segmentos deben coincidir con `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Un directorio que contiene `template.tsx` es un límite de plantilla. Su ruta separada por barras se convierte en `slug`, y las plantillas descubiertas se ordenan por `slug`.

La generación escribe `src/generated/framekit/templates.ts` y copia los archivos de imagen descubiertos en `public/framekit/templates/`. Cada `TemplateRegistryEntry` contiene:

```ts
import type { TemplateAssetManifest, TemplateDefinition, TemplateMeta, TemplateVariants } from '@mauriciodmo/framekit'

interface TemplateRegistryEntry {
  slug: string
  segments: string[]
  meta: TemplateMeta
  width: number
  height: number
  variants: TemplateVariants
  variantKeys: string[]
  assets: TemplateAssetManifest
  load: () => Promise<{ default: TemplateDefinition }>
}
```

La función `load` es diferida. Los archivos de registro generados son desechables y no deben editarse manualmente.

## Validación

`defineTemplate` ejecuta la validación de la definición. `validateTemplateDefinition` comprueba la forma de nivel superior, los metadatos, las dimensiones, los campos, las variantes, el contenido, los tipos de campo, los límites y pasos numéricos y la función de renderizado. `validateTemplateData` comprueba los valores resueltos.

La validación de datos informa de códigos de error estructurados en lugar de cadenas localizadas:

```ts
import { validateTemplateData } from '@mauriciodmo/framekit'
import type { TemplateDefinition } from '@mauriciodmo/framekit'

declare const definition: TemplateDefinition
declare const data: Record<string, string | number | boolean>

const errors = validateTemplateData(definition, data)
```

Los códigos incluyen `required`, `invalid_number`, `number_too_small`, `number_too_large`, `invalid_step`, `text_too_short`, `text_too_long`, `invalid_color`, `invalid_choice` e `invalid_boolean`.

La comprobación de la CLI valida cada plantilla descubierta y cada variante de contenido:

```bash
pnpm framekit check
```

Primero genera, resuelve cada variante sin ediciones y valida los datos resueltos. `pnpm framekit dev`, `pnpm framekit check` y `pnpm framekit build` generan automáticamente. `pnpm framekit start` lee los artefactos de compilación existentes y no genera.
