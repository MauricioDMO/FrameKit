---
title: Content and variants
description: Model template-owned content variants and understand how FrameKit resolves field values.
sidebar:
  order: 3
---

`content` holds a record of template-owned variant keys. Each entry is a partial record of values for fields declared by the same template.

```tsx
content: {
  moon: { title: 'Oferta', alignment: 'center' },
  fjord: { title: 'Offer', alignment: 'left' }
},
variants: {
  default: 'moon',
  labels: {
    moon: 'Lunar',
    fjord: 'Fjordic'
  }
}
```

## Variant keys belong to the template

Content keys are template-owned strings. The current definition validator does not impose a naming or non-empty rule on content keys. `variants.default` is the exception: it must be a non-empty string and must name an entry in `content`. `language` has no reserved meaning, and neither `en` nor `es` is treated as a language field or a special variant by the template contract. They are ordinary keys unless the template gives them meaning.

`variants.default` must name an entry in `content`. `variants.labels` is optional; each label key must name a content entry and each label must be a non-empty string. The keys in `content` become the type of `variant` in render props. A content entry may contain only field keys declared in `fields`, and each value must have the field's runtime type.

## Resolution order

For a selected variant, FrameKit resolves data in this order:

1. The field's `defaultValue` is used first. String fields without a default start as `''`, booleans without a default start as `false`, and number fields always have a finite numeric default.
2. Values in `content[variant]` replace those defaults.
3. User edits replace the variant values.

The result is the `data` object passed to `render`. `resolveTemplateData` applies the same order when resolving data programmatically:

```tsx
import { resolveTemplateData } from '@mauriciodmo/framekit'

const data = resolveTemplateData(definition, 'moon', {
  title: 'Edited offer'
})
```

An unknown variant or unknown field key is an error. Values must already have the field's runtime type; FrameKit does not turn numeric strings into numbers or string booleans into booleans.

Image assets add one more source for image fields. A variant-scoped image uses the matching variant asset, then a matching common asset. A common-scoped image uses the matching common asset. An applicable asset replaces the resolved image value; without one, the default, content, and edit order above applies. See [assets](/en/users/concepts/templates/assets) and the [template reference](/en/users/reference/template).
