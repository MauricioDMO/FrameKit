# Rolling Migration Guide

This guide records the next versionless migration work. No release version has
been selected yet.

## Canonical Template Contract

Issue [#1](https://github.com/MauricioDMO/FrameKit/issues/1) establishes one
template shape for Studio and the future server-rendering boundary. Update each
template definition to include:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Template title' },
  width: 1200,
  height: 630,
  fields: { title: field.text({ label: 'Title' }) },
  variants: { default: 'en', labels: { en: 'English' } },
  content: { en: { title: 'Hello' } },
  render({ data, assets, variant, width, height }) {
    return <article style={{ width, height }}>{data.title}</article>
  },
})
```

Required source changes:

- add the `meta` and `variants` objects;
- move display names to `variants.labels`;
- remove entry-level `language` properties; content entries contain field values only;
- rename the render input from `locale` to `variant`;
- remove any unsupported top-level version or alternate contract property;
- run `framekit generate`, `framekit check`, and `framekit build`.

This is a breaking template-source change. There is no compatibility alias or
automatic migration command. The exact metadata refinements and later field
changes are tracked separately in the future execution plans.

See the [canonical contract plan](../../Plans/Future/issue-01-canonical-template-contract.md)
and the [template contract reference](../reference/template-contract.md).

## Template Metadata

Issue [#3](https://github.com/MauricioDMO/FrameKit/issues/3) makes the metadata
contract exact. Update every template definition so `meta` has a non-empty
`title`; optionally add `description`, `marketingDescription`, and `tags`.
Remove `revision`, `status`, `keywords`, `order`, and any other unsupported
metadata properties. A title is required even when the directory name already
looks like a suitable catalog label; there is no slug fallback. This is a
required source update for existing templates, not an additive no-migration
change.

See the [template metadata plan](../../Plans/Future/issue-03-template-metadata.md)
and the [template contract reference](../reference/template-contract.md#template-metadata).

## Content Variants

Issue [#4](https://github.com/MauricioDMO/FrameKit/issues/4) replaces the
locale-shaped template content contract with explicit variants. Update existing
template and editor consumers as follows:

- keep field-only `content` entries and remove any entry-level `language` metadata;
- require `variants.default` to name an existing content key;
- keep `variants.labels` optional, and make every label key name an existing content key;
- reject `variants.mode`, other unsupported variant properties, unknown labels, unknown defaults, and requested variants that are not defined;
- rename `getLocales` to `getVariants` with no compatibility alias;
- rename editor content state and actions from locale names to variant names;
- change editor persistence from `framekit:<slug>:v1` to `framekit:<slug>:v2`; old `v1` state is discarded, not migrated.

This is a breaking source and persistence change. There is no compatibility alias
or automatic migration command. Run `framekit generate`, `framekit check`, and
`framekit build` after updating the templates.

See the [content variants plan](../../Plans/Future/issue-04-content-variants.md)
and the [template contract reference](../reference/template-contract.md).

## Semantic Fields

Issue [#5](https://github.com/MauricioDMO/FrameKit/issues/5) makes the field
factory API singular and removes the duplicate textarea kind. Update template
source as follows:

- change the root import from `fields` to `field`;
- keep the template definition property named `fields`;
- replace `fields.text`, `fields.color`, `fields.number`, and `fields.image` with
  `field.text`, `field.color`, `field.number`, and `field.image`;
- replace every `fields.textarea` with `field.text`;
- use `minLength` and `maxLength` only on `field.text`; they must be finite,
  non-negative integers with `minLength <= maxLength`;
- expect `field.text` to render a native multiline `<textarea>` and preserve
  newline characters;
- handle `text_too_short` and `text_too_long` validation errors without
  trimming the value before measuring its length.

There is no `fields` compatibility alias, no `field.textarea`, and no separate
`textarea` field kind. This is a breaking source change, not an additive change
with a no-migration path. Run `framekit generate`, `framekit check`, and
`framekit build` after updating the starter and project templates.

See the [semantic fields plan](../../Plans/Future/issue-05-semantic-fields.md),
the [template contract reference](../reference/template-contract.md), and the
[public API reference](../reference/public-api.md).

## Choice Field

Issue [#6](https://github.com/MauricioDMO/FrameKit/issues/6) adds
`field.choice` for closed-set string values. This is an additive change; existing
text, number, color, and image fields do not require migration.

Declare a non-empty ordered option list and a required default that matches one
of its values:

```tsx
alignment: field.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  defaultValue: 'center',
})
```

Studio renders a native `<select>` in the declared option order. Choice fields
do not accept `required` or `control`; values are not trimmed or coerced. Content
and edits must use a declared string value. An unknown value fails data
validation with `{ code: 'invalid_choice' }` instead of selecting the first
option as a fallback.

See the [choice field plan](../../Plans/Future/issue-06-choice-field.md), the
[template contract reference](../reference/template-contract.md), and the
[public API reference](../reference/public-api.md).
