# Guía de Migración Rolling

Esta guía registra el siguiente trabajo de migración sin versión. Todavía no se
ha seleccionado una versión de release.

## Contrato Canónico De Plantillas

El issue [#1](https://github.com/MauricioDMO/FrameKit/issues/1) establece una
única forma de plantilla para Studio y la futura frontera de renderizado de
servidor. Actualiza cada definición para incluir:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Título de la plantilla' },
  width: 1200,
  height: 630,
  fields: { title: field.text({ label: 'Título' }) },
  variants: { default: 'en', labels: { en: 'English' } },
  content: { en: { title: 'Hola' } },
  render({ data, assets, variant, width, height }) {
    return <article style={{ width, height }}>{data.title}</article>
  },
})
```

Cambios requeridos en el código fuente:

- agrega los objetos `meta` y `variants`;
- mueve los nombres visibles a `variants.labels`;
- elimina las propiedades `language` de cada entrada; las entradas solo contienen valores de fields;
- cambia el input de renderizado de `locale` a `variant`;
- elimina cualquier propiedad superior de versión o forma de contrato alternativa no soportada;
- ejecuta `framekit generate`, `framekit check` y `framekit build`.

Este es un cambio incompatible en el código fuente de las plantillas. No existe
un alias de compatibilidad ni un comando de migración automático. Las
refinaciones posteriores de metadata y los cambios futuros de fields se
rastrean por separado en los planes de ejecución.

Consulta el [plan del contrato canónico](../../Plans/Future/issue-01-canonical-template-contract.md)
y la [referencia del contrato de plantilla](../reference/template-contract.md).

## Metadata De La Plantilla

El issue [#3](https://github.com/MauricioDMO/FrameKit/issues/3) hace exacto el
contrato de metadata. Actualiza cada definición para que `meta` tenga un
`title` no vacío; de forma opcional puede incluir `description`,
`marketingDescription` y `tags`. Elimina `revision`, `status`, `keywords`,
`order` y cualquier otra propiedad de metadata no soportada. El título es
obligatorio aunque el nombre del directorio ya parezca una etiqueta adecuada
del catálogo: no existe fallback al slug. Es una actualización de código fuente
obligatoria para las plantillas existentes, no un cambio aditivo sin migración.

Consulta el [plan de metadata](../../Plans/Future/issue-03-template-metadata.md)
y la [referencia del contrato de plantilla](../reference/template-contract.md#metadata-de-la-plantilla).

## Variantes De Contenido

El issue [#4](https://github.com/MauricioDMO/FrameKit/issues/4) reemplaza el
contrato de contenido de plantillas basado en locale por variantes explícitas.
Actualiza las plantillas y consumidores del editor existentes de esta forma:

- conserva entradas de `content` que solo contengan valores de fields y elimina cualquier metadata `language` de nivel de entrada;
- exige que `variants.default` nombre una key de contenido existente;
- deja `variants.labels` como opcional y exige que cada key de label nombre una key de contenido existente;
- rechaza `variants.mode`, otras propiedades de variante no soportadas, labels desconocidas, defaults desconocidos y variantes solicitadas que no estén definidas;
- cambia `getLocales` por `getVariants` sin alias de compatibilidad;
- cambia los nombres de estado y acciones del contenido del editor de locale a variante;
- cambia la persistencia del editor de `framekit:<slug>:v1` a `framekit:<slug>:v2`; el estado antiguo `v1` se descarta, no se migra.

Este es un cambio incompatible de código fuente y persistencia. No existe un
alias de compatibilidad ni un comando de migración automático. Ejecuta
`framekit generate`, `framekit check` y `framekit build` después de actualizar
las plantillas.

Consulta el [plan de variantes de contenido](../../Plans/Future/issue-04-content-variants.md)
y la [referencia del contrato de plantilla](../reference/template-contract.md).

## Fields Semánticos

El issue [#5](https://github.com/MauricioDMO/FrameKit/issues/5) hace singular la
API de fábricas de fields y elimina el kind duplicado de textarea. Actualiza el
código fuente de las plantillas así:

- cambia el import raíz de `fields` a `field`;
- conserva la propiedad `fields` dentro de la definición de la plantilla;
- cambia `fields.text`, `fields.color`, `fields.number` y `fields.image` por
  `field.text`, `field.color`, `field.number` y `field.image`;
- cambia cada `fields.textarea` por `field.text`;
- usa `minLength` y `maxLength` únicamente en `field.text`; deben ser enteros
  finitos no negativos y cumplir `minLength <= maxLength`;
- espera que `field.text` renderice un `<textarea>` nativo multilínea y conserve
  los saltos de línea;
- maneja los errores de validación `text_too_short` y `text_too_long` sin
  eliminar espacios antes de medir la longitud.

No existe un alias de compatibilidad `fields`, ni `field.textarea`, ni un kind
separado `textarea`. Este es un cambio incompatible del código fuente, no un
cambio aditivo sin migración. Ejecuta `framekit generate`, `framekit check` y
`framekit build` después de actualizar el starter y las plantillas del proyecto.

Consulta el [plan de fields semánticos](../../Plans/Future/issue-05-semantic-fields.md),
la [referencia del contrato de plantilla](../reference/template-contract.md) y la
[referencia de la API pública](../reference/public-api.md).

## Campo Choice

El issue [#6](https://github.com/MauricioDMO/FrameKit/issues/6) agrega
`field.choice` para valores string de conjunto cerrado. Es un cambio aditivo;
los fields text, number, color e image existentes no requieren migración.

Declara una lista de opciones ordenada y no vacía, junto con un valor
predeterminado obligatorio que coincida con una de ellas:

```tsx
alignment: field.choice({
  label: 'Alineación',
  options: [
    { value: 'left', label: 'Izquierda' },
    { value: 'center', label: 'Centro' },
    { value: 'right', label: 'Derecha' },
  ],
  defaultValue: 'center',
})
```

Studio renderiza un `<select>` nativo en el orden declarado. Los fields choice
no aceptan `required` ni `control`; sus valores no se recortan ni convierten. El
contenido y las ediciones deben usar un string declarado. Un valor desconocido
falla la validación de datos con `{ code: 'invalid_choice' }` en lugar de
seleccionar la primera opción como fallback.

Consulta el [plan del field choice](../../Plans/Future/issue-06-choice-field.md),
la [referencia del contrato de plantilla](../reference/template-contract.md) y la
[referencia de la API pública](../reference/public-api.md).

## Campo Boolean

El issue [#7](https://github.com/MauricioDMO/FrameKit/issues/7) agrega
`field.boolean` para decisiones binarias. Esto cambia la frontera de valores de
los fields boolean de strings a booleanos reales. Los fields text, number, color,
image y choice existentes no requieren migración salvo que se conviertan a
boolean.

Declara el field con un valor predeterminado booleano opcional:

```tsx
showLogo: field.boolean({
  label: 'Mostrar logo',
  defaultValue: true,
})
```

Actualiza el contenido y el render de cada field boolean para usar `true` o
`false`, no strings `'true'` ni `'false'`. Si se omite `defaultValue`, el valor
resuelto es `false`. Studio usa un checkbox nativo y las ediciones persistidas
también deben ser booleanos reales; los overrides antiguos con strings se
descartan en lugar de convertirse. Los fields boolean no aceptan `required` ni
`control`.

Los valores de runtime incorrectos devuelven `{ code: 'invalid_boolean' }`. Usa
un field `choice` para valores de tres estados en lugar de recomendar o guardar
strings `'true'`/`'false'`. Es un kind aditivo para plantillas existentes, pero
adoptarlo requiere la actualización tipada del código fuente anterior. Ejecuta
`framekit generate`, `framekit check` y `framekit build` después de actualizar las
plantillas.

Consulta el [plan del field boolean](../../Plans/Future/issue-07-boolean-field.md),
la [referencia del contrato de plantilla](../reference/template-contract.md) y la
[referencia de la API pública](../reference/public-api.md).

## Campo Number

El issue [#8](https://github.com/MauricioDMO/FrameKit/issues/8), especificado en
el [plan del field number](../../Plans/Future/issue-08-number-field.md), cambia
el contrato de `field.number`. Es un cambio incompatible para adoptar fields
number: no existe alias de compatibilidad, coerción de strings numéricos ni
migración automática.

Actualiza cada field number de esta forma:

- reemplaza cada `defaultValue` string por un number finito obligatorio, como
  `defaultValue: 10` en lugar de `defaultValue: '10'`;
- elimina `required`; los fields number siempre están presentes porque su
  `defaultValue` numérico es obligatorio;
- reemplaza por numbers finitos los valores string de cada variante de
  `content`;
- reemplaza o elimina los overrides string persistidos antes de usarlos; los
  overrides deben ser numbers finitos y no se convierten automáticamente;
- mantén `min` y `max`, cuando se proporcionen, finitos y ordenados (`min <= max`);
- usa un `step` finito y positivo, cuyo valor predeterminado es `1` y sigue la
  semántica numérica/de rango nativa;
- usa `control: 'input'` (el valor predeterminado) para un `<input
  type="number">` nativo, o `control: 'slider'` para un `<input type="range">`
  nativo; los fields slider exigen límites `min` y `max` finitos explícitos y
  muestran el valor actual.

Los valores de contenido, overrides, datos resueltos y props de renderizado deben
ser numbers finitos. Los strings numéricos se rechazan sin conversión. Durante
una edición vacía o temporalmente incorrecta, Studio mantiene un draft local
separado de los datos numéricos confirmados; ese draft no es render data y nunca
se pasa a `render`.

```tsx
count: field.number({
  label: 'Count',
  defaultValue: 10,
  min: 0,
  max: 100,
})
```

Ejecuta `framekit generate`, `framekit check` y `framekit build` después de
actualizar los fields number.

Consulta el [plan del field number](../../Plans/Future/issue-08-number-field.md),
la [referencia del contrato de plantilla](../reference/template-contract.md#number)
y la [referencia de la API pública](../reference/public-api.md).
