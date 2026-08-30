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

See the [canonical contract issue](https://github.com/MauricioDMO/FrameKit/issues/1)
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

See the [template metadata issue](https://github.com/MauricioDMO/FrameKit/issues/3)
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

See the [content variants issue](https://github.com/MauricioDMO/FrameKit/issues/4)
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

See the [semantic fields issue](https://github.com/MauricioDMO/FrameKit/issues/5),
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

See the [choice field issue](https://github.com/MauricioDMO/FrameKit/issues/6), the
[template contract reference](../reference/template-contract.md), and the
[public API reference](../reference/public-api.md).

## Boolean Field

Issue [#7](https://github.com/MauricioDMO/FrameKit/issues/7) adds
`field.boolean` for binary decisions. This changes the value boundary for
boolean fields from strings to real booleans. Existing text, number, color,
image, and choice fields do not need migration unless they are being changed to
booleans.

Declare the field with an optional boolean default:

```tsx
showLogo: field.boolean({
  label: 'Show logo',
  defaultValue: true,
})
```

Update every boolean field's content and render logic to use `true` or `false`,
not `'true'` or `'false'` strings. If `defaultValue` is omitted, the resolved
default is `false`. Studio uses a native checkbox, and persisted overrides must
also be real booleans; old string overrides are discarded rather than coerced.
Boolean fields do not accept `required` or `control`.

Wrong runtime values return `{ code: 'invalid_boolean' }`. Use a `choice` field
for tri-state values instead of recommending or storing `'true'`/`'false'`
strings. This is an additive field kind for existing templates, but adopting it
requires the typed source update above. Run `framekit generate`, `framekit check`,
and `framekit build` after updating templates.

See the [boolean field issue](https://github.com/MauricioDMO/FrameKit/issues/7), the
[template contract reference](../reference/template-contract.md), and the
[public API reference](../reference/public-api.md).

## Number Field

Issue [#8](https://github.com/MauricioDMO/FrameKit/issues/8) changes the
contract for `field.number`. This is a breaking adoption change for number
fields: there is no compatibility alias, numeric-string coercion, or automatic
migration.

Update every number field as follows:

- replace every string `defaultValue` with a required finite number, such as
  `defaultValue: 10` instead of `defaultValue: '10'`;
- remove `required`; number fields are always present because their numeric
  `defaultValue` is required;
- replace string values in every `content` variant with finite numbers;
- replace or remove persisted string overrides before use; overrides must be
  finite numbers and are not converted automatically;
- keep supplied `min` and `max` finite and ordered (`min <= max`);
- use a finite positive `step`, which defaults to `1` and follows native
  numeric/range semantics;
- use `control: 'input'` (the default) for a native `<input type="number">`,
  or `control: 'slider'` for a native `<input type="range">`; slider fields
  require explicit finite `min` and `max` bounds and display the current value.

Content values, overrides, resolved data, and render props must be finite
numbers. Numeric strings are rejected without coercion. During an empty or
temporarily malformed edit, Studio keeps a local draft separate from committed
numeric data; that draft is not render data and is never passed to `render`.

```tsx
count: field.number({
  label: 'Count',
  defaultValue: 10,
  min: 0,
  max: 100,
})
```

Run `framekit generate`, `framekit check`, and `framekit build` after updating
number fields.

See the [number field issue](https://github.com/MauricioDMO/FrameKit/issues/8), the
[template contract reference](../reference/template-contract.md#number), and
the [public API reference](../reference/public-api.md).

## Generated Template Registry

Issue [#12](https://github.com/MauricioDMO/FrameKit/issues/12) changes the
project-local generated template registry. Run `framekit generate` after updating
the project if you need to regenerate it directly, but normal workflows handle
this automatically: `dev` generates before starting and watches every added,
removed, or changed path under `src/templates`; `check` and `build` generate
before validation/build; `start` does not generate.

The generated module now exports only `templates: TemplateRegistryEntry[]`. Each
entry contains `slug`, `segments`, validated `meta`, `width`, `height`, `variants`,
declaration-ordered `variantKeys`, `assets`, and a lazy `load` function. Update
custom generated-registry consumers as follows:

- replace `entry.title` with `entry.meta.title`;
- stop importing `templateManifest` or `templateRegistry`;
- find the entry in `templates` and call its `load()` function when the definition
  is needed.

Generated files are disposable and are replaced by the generator. Do not edit or
manually migrate `src/generated/framekit/templates.ts`, and do not retain an
adapter for the old registry shape. This is a generated-consumer API change; the
source template definition contract itself does not gain a compatibility alias.

See the [generated registry CLI reference](../reference/cli.md#framekit-generate),
the [public API reference](../reference/public-api.md#generated-template-registry),
and the [Generated Template Registry plan](../../Plans/Future/issue-12-generated-template-registry.md).

## Studio Canonical Contract Integration

Issue [#13](https://github.com/MauricioDMO/FrameKit/issues/13) completes Studio's
direct integration with the canonical contracts. Existing Studio integrations
must consume the generated `templates: TemplateRegistryEntry[]` directly. Do
not create a second Studio registry model or adapt the legacy registry shape.
When rendering `FrameKitEditor` directly, pass the reusable
`TemplateRegistryEntry` through its `template` prop and pass the loaded,
validated definition separately; do not reconstruct an older template prop
shape.

Update existing consumers as follows:

- Read the display title from `entry.meta.title` in navigation and the editor
  header; never derive it from the slug. The editor also displays
  `meta.description`, `meta.marketingDescription`, and `meta.tags` when present,
  omitting each optional value when absent.
- Use generic `variant` names in template selection state, actions, props, and
  callbacks. Start with `definition.variants.default`, render optional labels
  with a key fallback, and keep the selector label generic (`Variant`). The
  Studio interface locale (`FrameKitLocale`, EN/ES) is independent: changing
  interface language must not change the selected template variant.
- Keep the sidebar navigation compact and accessible: preserve the folder
  hierarchy, expand/collapse behavior, keyboard operation, visible focus,
  folder-only scope lines for expanded groups, and subdued selected-template
  styling with `aria-current="page"`. Do not add search or filtering.
- Keep the canonical typed controls: text uses a native `<textarea>`, choice a
  native `<select>`, boolean a native checkbox, number its declared native
  number or range control, color its existing control, and image its asset
  control. Preserve string, finite-number, and boolean runtime values; choice
  values remain declared strings.
- Persist editor state only under `framekit:<slug>:v2`. The previous `v1`
  persistence format is intentionally invalidated and discarded, not migrated.
  Empty or temporarily invalid number input stays as a local control draft; it
  is not committed editor data and is never passed to `render`.
- Keep Studio-owned navigation and error UI localized through the centralized
  Studio messages. Route tabs, sidebar navigation labels, metadata labels,
  loading and not-found states, definition/data errors, upload errors, export
  errors, and validation messages use the active interface locale; template
  titles, metadata values, and variant labels remain source-provided. Validation
  errors remain associated with their controls, and export/copy focuses the
  first invalid control before producing output.

This is a versionless breaking integration update; no release version has been
selected. There is no compatibility alias, automatic migration command, or
legacy registry adapter. Manually update affected template and editor-consumer
source, and treat the `v1` persistence invalidation as an intentional manual
reset where applicable. Regenerate generated files with `framekit generate`
instead of editing them by hand, then run `framekit check` and `framekit build`.

See the [Studio canonical contract issue](https://github.com/MauricioDMO/FrameKit/issues/13)
and the [Studio canonical contract plan](../../Plans/Future/issue-13-studio-canonical-contract.md).
