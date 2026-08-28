# Contrato de plantilla

Este documento describe el contrato de plantilla sin versión: el sistema de campos, el manejo de datos por variante, la frontera de renderizado y las reglas de validación compartidas por Studio y un futuro renderizador de servidor.

## Definición canónica

Cada plantilla usa una única forma pública. `meta` es un objeto exacto de
metadata y `variants.default` selecciona una de las entradas de `content`, que
solo contienen valores de fields.

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Promoción cuadrada',
    description: 'Una imagen promocional para descuentos y ofertas de productos',
    marketingDescription: 'Presentar la oferta, mostrar su precio y motivar al cliente a comprar',
    tags: ['social', 'promoción'],
  },
  width: 1200,
  height: 630,
  fields: { title: field.text({ label: 'Título' }) },
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

El contrato exacto de variantes está definido por el [Plan Futuro #4](../../Plans/Future/issue-04-content-variants.md)
y el [issue #4 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/4).

## Tipos de Campos

Las plantillas definen campos usando el objeto singular `field` exportado desde `@mauriciodmo/framekit`. La propiedad de la definición sigue siendo `fields`. Cada campo tiene un `kind` que determina su comportamiento y las opciones que acepta.

### Opciones Base

Los campos text, color e image comparten un conjunto común de opciones:

- `label` (string, obligatorio): Un nombre legible para el campo.
- `placeholder` (string, opcional): Texto provisional mostrado en campos vacíos.
- `required` (boolean, valor predeterminado: `true`): Indica si el campo debe tener un valor no vacío. Consulta la sección Requisito más abajo.
- `defaultValue` (string, opcional): Un valor por defecto usado cuando no hay otro valor disponible.

### `text`

Un campo de texto multilínea respaldado por un `<textarea>` nativo. Conserva los
saltos de línea en el valor. Acepta las opciones base más:

- `minLength` (entero no negativo, opcional): La cantidad mínima de caracteres.
- `maxLength` (entero no negativo, opcional): La cantidad máxima de caracteres.

Los límites deben ser enteros finitos y `minLength` no puede superar a `maxLength`.

```typescript
field.text({ label: 'Description', placeholder: 'Write something...', minLength: 1, maxLength: 240 })
```

### `choice`

Un campo de strings de conjunto cerrado que se edita con un `<select>` nativo.
`options` debe ser un array ordenado no vacío de objetos con propiedades `value`
y `label` string no vacías y valores únicos. `defaultValue` es obligatorio y
debe coincidir con uno de los valores. Los campos choice no aceptan `required` ni
`control`, y sus valores no se recortan ni convierten.

```typescript
field.choice({
  label: 'Alineación',
  options: [
    { value: 'left', label: 'Izquierda' },
    { value: 'center', label: 'Centro' },
    { value: 'right', label: 'Derecha' },
  ],
  defaultValue: 'center',
})
```

El contenido y las ediciones deben usar uno de los valores declarados. Un valor
desconocido devuelve `{ code: 'invalid_choice' }` durante la validación de datos.

### `boolean`

Un campo binario editado con un `<input type="checkbox">` nativo. Solo acepta
`label` y un `defaultValue` booleano opcional; si se omite `defaultValue`, la
resolución usa `false`. Los campos boolean no aceptan `required`, `control` ni
coerción de strings. El contenido, las ediciones, los datos resueltos y las
props de renderizado deben usar booleanos reales, por lo que `'true'`, `'false'`
y valores numéricos truthy/falsy no son válidos.

```typescript
showLogo: field.boolean({
  label: 'Mostrar logo',
  defaultValue: true,
})
```

Un tipo de runtime incorrecto devuelve `{ code: 'invalid_boolean' }` durante la
validación de datos. Usa un field `choice` cuando un valor necesite más de dos
estados.

### `number`

Un campo numérico con valores numéricos finitos en cada frontera de datos
confirmados. Acepta `label`, un `placeholder` opcional y estas opciones
específicas:

- `defaultValue` (number finito, obligatorio): El valor inicial del field.
- `min` (number finito, opcional): El valor mínimo aceptable.
- `max` (number finito, opcional): El valor máximo aceptable.
- `step` (number finito positivo, opcional, valor predeterminado: `1`): El
  incremento usado por los controles numérico y de rango nativos.
- `control` (`'input' | 'slider'`, opcional, valor predeterminado: `'input'`): El
  control nativo de edición que se usará.

Los fields number no aceptan `required`; su `defaultValue` numérico finito y
obligatorio significa que siempre están presentes. Si se proporcionan ambos
límites, `min` debe ser menor o igual que `max`. `input` usa un
`<input type="number">` nativo. `slider` usa un `<input type="range">` nativo,
muestra el valor actual, conserva el comportamiento de teclado nativo y exige
límites `min` y `max` finitos explícitos. Los valores y defaults deben cumplir
los límites declarados y `step` usando la semántica numérica/de rango nativa.

Los valores de contenido, las ediciones del usuario, los datos resueltos y las
props de renderizado de un field number son numbers finitos. Los strings
numéricos como `'10'` se rechazan; FrameKit no los convierte. Mientras un input
está vacío o es temporalmente incorrecto, Studio mantiene ese draft local
separado de los datos numéricos confirmados. El draft no es render data; el
renderizador solo recibe numbers finitos confirmados.

```typescript
count: field.number({ label: 'Count', defaultValue: 10, min: 0, max: 100 })
opacity: field.number({
  label: 'Opacity',
  defaultValue: 100,
  min: 0,
  max: 100,
  step: 1,
  control: 'slider',
})
```

### `color`

Un campo selector de color. Acepta solo las opciones base. Los valores no vacíos deben ser colores hexadecimales de seis dígitos con el formato `#RRGGBB`.

```typescript
field.color({ label: 'Background Color' })
```

### `image`

Un campo de imagen resuelve un asset de la plantilla o una imagen pública desde
`public` como una cadena URL para el navegador. El alcance predeterminado es
`variant`; usa `scope: 'common'` para una imagen compartida por todas las
variantes de contenido. Una imagen pública puede proporcionarse como
`defaultValue` o como valor de la variante, por ejemplo
`/assets/logos/brand.svg`.

```typescript
field.image({ label: 'Hero image' })
field.image({ label: 'Background', scope: 'common' })
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

Los campos text, color e image son **requeridos por defecto**. Configurar
`required: false` hace que uno de esos campos sea opcional. Los fields number
siempre tienen un `defaultValue` numérico finito obligatorio y no aceptan
`required`. Los campos choice siempre tienen un `defaultValue` válido y no
aceptan `required`; los campos boolean siempre son booleanos válidos y no
participan en la obligatoriedad.

- Para los fields que admiten `required`, un **field opcional** (`required: false`)
  acepta una cadena vacía, mientras que un **field requerido** (por defecto)
  rechaza una cadena vacía después de eliminar los espacios en blanco.

Los campos boolean usan `false` cuando se omite `defaultValue`. Los fields
number usan su default numérico finito obligatorio; los demás fields usan los
valores de obligatoriedad descritos arriba.

## Orden de Resolución de Datos

Cuando una plantilla se renderiza, los valores de los campos se resuelven a través de un orden específico. Esto determina lo que contiene el objeto `data` dentro de la función `render`:

1. **`defaultValue` del campo**: La opción `defaultValue` del campo, o `''` para
   fields string y `false` para fields boolean si no está configurada. Los fields
   number siempre tienen su default numérico finito obligatorio.
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
// { fieldKey: default string o number finito, o false para fields boolean }
```

### Variantes disponibles

`getVariants` devuelve las claves de variante definidas en el objeto `content` de la plantilla:

```typescript
import { getVariants } from '@mauriciodmo/framekit'

const variants = getVariants(definition) // por ejemplo, ['en', 'es']
```

Estas claves son strings arbitrarios elegidos por el autor de la plantilla. No están restringidos a códigos de idioma como `en` o `es`.

## Validación

FrameKit proporciona dos funciones de validación que verifican diferentes aspectos de una plantilla.

### Validación de Definición

`validateTemplateDefinition` verifica la estructura de una definición de plantilla:

- `width` y `height` deben ser enteros finitos positivos
- `meta` debe ser un objeto plano que solo contenga `title`, `description`, `marketingDescription` y `tags`; `title` debe ser no vacío y `tags` debe ser un array de strings
- `variants` debe ser un objeto plano que solo contenga `default` y `labels` opcional; `variants.default` debe nombrar una entrada de contenido y cada key de label debe nombrar una entrada de contenido
- `fields.language` está reservado y no puede ser usado
- `content` debe tener al menos una entrada
- Cada entrada de contenido solo puede contener keys de fields declaradas y cada
  valor debe coincidir con su tipo de field (`string` para fields string,
  `number` finito para fields number y `boolean` para fields boolean); los
  valores number también deben cumplir sus límites `min`, `max` y `step`
- Las propiedades de nivel superior no soportadas, como `version`, son rechazadas
- `render` debe ser una función
- Las opciones de campo deben tener tipos y restricciones válidos (por ejemplo,
  `min`/`max` solo en fields `number`, `minLength`/`maxLength` solo en fields
  `text`, y números finitos solamente)

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
- Campos `text`: los valores no vacíos deben cumplir `minLength` y `maxLength`; la longitud se mide antes de eliminar espacios, por lo que los espacios y saltos de línea cuentan
- Fields `number`: el valor debe ser un number finito, no un string numérico;
  debe cumplir los límites `min`/`max` y `step` declarados usando la semántica
  numérica/de rango nativa
- Campos `color`: los valores no vacíos deben ser colores hexadecimales de seis dígitos con el formato `#RRGGBB`
- Campos `choice`: los valores deben coincidir con uno de los valores de opción declarados
- Campos `boolean`: los valores deben ser booleanos reales; los strings no se convierten

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
- `invalid_step`: El valor no coincide con el `step` declarado
- `text_too_short`: El valor tiene menos caracteres que `minLength`
- `text_too_long`: El valor tiene más caracteres que `maxLength`
- `invalid_color`: El valor no es un color hexadecimal de seis dígitos con el formato `#RRGGBB`
- `invalid_choice`: El valor no pertenece a los valores de opción declarados
- `invalid_boolean`: El valor no es un booleano

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
y el [issue #3 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/3). El
contrato exacto de variantes está definido por el [Plan Futuro #4](../../Plans/Future/issue-04-content-variants.md)
y el [issue #4 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/4).
El contrato semántico de fields está definido por el [Plan Futuro #5](../../Plans/Future/issue-05-semantic-fields.md)
y el [issue #5 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/5).
El contrato del field choice está definido por el [Plan Futuro #6](../../Plans/Future/issue-06-choice-field.md)
y el [issue #6 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/6).
El contrato del field boolean está definido por el [Plan Futuro #7](../../Plans/Future/issue-07-boolean-field.md)
y el [issue #7 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/7).
El contrato del field number está definido por el [Plan Futuro #8](../../Plans/Future/issue-08-number-field.md)
y el [issue #8 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/8).

---

[English](../../en/reference/template-contract.md) | [Español](./template-contract.md)
