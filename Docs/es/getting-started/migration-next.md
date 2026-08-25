# Guía de Migración Rolling

Esta guía registra el siguiente trabajo de migración sin versión. Todavía no se
ha seleccionado una versión de release.

## Contrato Canónico De Plantillas

El issue [#1](https://github.com/MauricioDMO/FrameKit/issues/1) establece una
única forma de plantilla para Studio y la futura frontera de renderizado de
servidor. Actualiza cada definición para incluir:

```tsx
export default defineTemplate({
  meta: { title: 'Título de la plantilla' },
  width: 1200,
  height: 630,
  fields: { title: fields.text({ label: 'Título' }) },
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
