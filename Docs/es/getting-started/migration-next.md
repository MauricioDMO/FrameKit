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
