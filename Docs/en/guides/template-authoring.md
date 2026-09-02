# Template Authoring

A template is a directory under `src/templates/` that contains a `template.tsx` file with a default export. FrameKit discovers templates by scanning the `src/templates/` directory and registering every directory that has a `template.tsx` file.

## Directory Conventions

Templates live in directories under `src/templates/`. Each directory name must follow the pattern:

```
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

This means lowercase letters, numbers, and hyphens only — no uppercase, no underscores, no special characters. For example: `blog-banner`, `social-card`, `email-header`.

**Ignored directories:** Directories starting with `.` or `_` are skipped during discovery. Use these prefixes for private or auxiliary directories that should not be treated as templates.

**Template boundaries:** When FrameKit finds a `template.tsx` inside a directory, it treats that directory as a template boundary. Any subdirectories inside it are part of the template's private structure and are not scanned for additional templates. This lets you organize helper files, components, and assets alongside your template without creating nested templates.

Template images belong in an `assets` directory beside `template.tsx`. Put shared images in `assets/common`; put variant images in a directory named after the content key and use the field key as the filename. Project-wide files belong in `public/assets/<category>` and use explicit `/assets/...` URLs.

## Slug Generation

The slug is the path from `src/templates/` to the template directory, with segments joined by slashes. Example: `src/templates/social-cards/instagram/post` becomes `social-cards/instagram/post`.

Titles shown for templates in Studio's navigation come from the validated
`meta.title`, never from the directory name. A missing or invalid `meta.title`
fails validation instead of falling back to a humanized slug.

The generated template registry is sorted alphabetically by slug. In the Studio UI, template items are sorted by `meta.title`, while folders are sorted by humanized slug segments.

### Generated Template Registry

`framekit generate` writes `src/generated/framekit/templates.ts`. The generated
module exports only `templates: TemplateRegistryEntry[]`. Each entry contains the
filesystem `slug` and `segments`, validated `meta`, `width`, `height`, `variants`,
declaration-ordered `variantKeys`, the template asset manifest, and a lazy `load`
function. The generated file is disposable; update the source template and run
the generation workflow instead of editing it. See the [Generated Template
Registry plan](../../Plans/Future/issue-12-generated-template-registry.md).

This generated `templates` array is the canonical input to `FrameKitStudio`; pass
it directly without an adapter. Studio uses `entry.meta.title` for navigation and
the selected editor heading, displays `description`, `marketingDescription`, and
`tags` when present, and reads the entry's dimensions, variants, asset manifest,
and lazy `load` function. The loaded definition and registry dimensions must
agree before the editor opens. See the [Studio canonical contract plan](../../Plans/Future/issue-13-studio-canonical-contract.md)
and [GitHub issue #13](https://github.com/MauricioDMO/FrameKit/issues/13).

## Authoring Forms

FrameKit supports two forms for defining templates. Both produce the same end result; pick the form that fits the complexity of your template.

### Inline Template

For straightforward templates, define everything in a single `template.tsx` file:

```tsx
import { defineTemplate, field, Markdown } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Social card',
    description: 'A square card for social posts and campaign updates',
    marketingDescription: 'Present the message clearly and motivate the audience to act',
    tags: ['social', 'promotion'],
  },
  width: 1200,
  height: 800,
  fields: {
    title: field.text({ label: 'Title', required: true, minLength: 1, maxLength: 80 }),
    accentColor: field.color({ label: 'Accent Color', defaultValue: '#b9f8d2' }),
  },
  content: {
    en: {
      title: 'Your next story starts here',
    },
    es: {
      title: 'Tu próxima historia empieza aquí',
    },
  },
  variants: { default: 'en', labels: { en: 'English', es: 'Español' } },
  render({ data, variant, width, height }) {
    return (
      <article
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #10271f, #39775f)',
          color: '#f5fff8',
        }}
      >
        <Markdown value={data.title} style={{ fontSize: 72 }} />
      </article>
    )
  },
})
```

### Extracted Definition

For templates with complex rendering logic, separate the definition from the React component using `defineTemplateBase`. This lets you place artwork components, helpers, and assets in private subdirectories without affecting template discovery.

```tsx
// definition.ts
import { defineTemplateBase, field } from '@mauriciodmo/framekit'
import type { TemplateRenderProps } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  meta: {
    title: 'Extracted social card',
    description: 'A reusable definition for a social card',
    marketingDescription: 'Explain the offer and make the next action clear',
    tags: ['social'],
  },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({ label: 'Title' }),
    accentColor: field.color({ label: 'Accent', defaultValue: '#b9f8d2' }),
  },
  content: {
    aurora: { title: 'Northern light' },
    desert: { title: 'Open horizon' },
  },
  variants: { default: 'aurora', labels: { aurora: 'Aurora', desert: 'Desert' } },
})

export type ArtworkProps = TemplateRenderProps<typeof templateBase>
```

```tsx
// artwork.tsx
import type { ArtworkProps } from './definition'

export function Artwork({ data, variant, width, height }: ArtworkProps) {
  return (
    <article data-variant={variant} style={{ width, height, color: data.accentColor }}>
      {data.title}
    </article>
  )
}
```

```tsx
// template.tsx
import { defineTemplate } from '@mauriciodmo/framekit'
import { Artwork } from './artwork'
import { templateBase } from './definition'

export default defineTemplate({
  ...templateBase,
  render: Artwork,
})
```

## Template Definition Structure

Every template definition requires these properties:

- `meta` — a plain object reserved for template metadata
- `width` — a positive integer specifying the template output width in pixels
- `height` — a positive integer specifying the template output height in pixels
- `fields` — a record where each key is a field name and each value is a field descriptor (text, number, color, image, choice, or boolean), created with the singular `field` export
- `variants` — an object with a `default` content key and optional display labels
- `content` — a record with at least one variant entry containing only partial field values
- `render` — a function that receives typed props and returns a React node

### Template Metadata

`meta` is the template's self-described metadata object. It accepts exactly these
properties:

- `title` (required): a non-empty template title.
- `description` (optional): a functional description of what the template is for.
- `marketingDescription` (optional): the concrete communication goal, such as presenting a service, explaining prices, highlighting benefits, or motivating an action.
- `tags` (optional): an array of strings shown with the template metadata in Studio.

The generated registry preserves this validated metadata. Studio navigation and
the selected editor heading read
`entry.meta.title`; when present, Studio also displays the optional descriptions
and tags. See [GitHub issue #13](https://github.com/MauricioDMO/FrameKit/issues/13)
for the integrated Studio contract.

## Field API

The root package exports `field`, not `fields`. The template definition property
is still named `fields`:

```tsx
fields: {
  title: field.text({
    label: 'Title',
    placeholder: 'Write a title',
    defaultValue: 'Your title',
    minLength: 1,
    maxLength: 80,
  }),
}
```

Studio provides one built-in control for each of the six field kinds: a native
`textarea` for text, the current color picker for color, a native number input or
range input for number, the project-asset control for image, a native `select`
for choice, and a native checkbox for boolean. Values keep their runtime types:
strings for text, color, image, and choice; finite numbers for number; and
booleans for boolean.

In Studio, a `text` field renders a native `<textarea>` and preserves newline
characters. `defaultValue` is an optional string and resolves to `''` when it is
omitted. Text is required by default; set `required: false` to allow empty
values. `minLength` and `maxLength` are optional finite non-negative integers;
definition validation requires `minLength` not to exceed `maxLength`, and data
validation applies those limits to the text value.

In Studio, a `choice` field renders a native `<select>` for a closed set of string values. Its
`options` array must be non-empty and ordered, with unique non-empty `value` and
`label` strings. `defaultValue` is required and must match one of those values.
Choice fields do not accept `required` or `control`. Data validation reports
`invalid_choice` when a resolved value is not declared in `options`.

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

In Studio, a `boolean` field renders a native checkbox for a binary value. It accepts only a
`label` and an optional boolean `defaultValue`; the default is `false` when it
is omitted. Boolean content, edits, and render data stay boolean, with no
coercion from `'true'` or `'false'`. Use `field.choice` for tri-state values.

```tsx
showLogo: field.boolean({
  label: 'Show logo',
  defaultValue: true,
})
```

`field.number` requires a finite numeric `defaultValue` and does not accept
`required`. Use the native `input` control by default, or set
`control: 'slider'` for a native range input. Any supplied `min` and `max`
bounds must be finite and ordered. Slider fields additionally require explicit
`min` and `max` bounds, and `step`
must be finite and positive; it defaults to `1` with native numeric/range
semantics.

Number values in content, Studio edits, resolved data, and render props must be
finite numbers. Numeric strings such as `'10'` are rejected without coercion.
Definition and data validation also apply the declared bounds and step. If an
input is empty or temporarily malformed, its local draft stays separate from
committed data and is never passed to `render`.

```tsx
count: field.number({
  label: 'Count',
  defaultValue: 10,
  min: 0,
  max: 100,
})

opacity: field.number({
  label: 'Opacity',
  defaultValue: 100,
  min: 0,
  max: 100,
  step: 1,
  control: 'slider',
})
```

## Content and Variants

Variant keys are arbitrary strings. They are not restricted to language tags — you can use any identifier that makes sense for your template, such as `en`, `es`, `moon`, `fjord`, or `variant-a`. Each entry may include values for any fields defined in the template. Fields not present in a variant start with their `defaultValue`; string fields without one use `''`, and boolean fields without one use `false`. Number fields always require a finite numeric default. Studio initially selects `variants.default`. The complete render-time precedence is documented in [Data Resolution Order](../reference/template-contract.md#data-resolution-order): defaults -> variant content -> user edits.

Use `variants.labels` for human-readable option labels. It is optional, and every
label key must match a content variant key. A missing label falls back to the
variant key. Content entries do not contain metadata such as `language`; every
content key must be an editable field.

```tsx
variants: {
  default: 'fjord',
  labels: { fjord: 'Fjordic', moon: 'Lunar' },
},
content: {
  fjord: { title: 'Offer' },
  moon: { title: 'Oferta' },
}
```

In this example, the `variant` type is `'fjord' | 'moon'`, not a global language union.
Studio's interface locale is an independent EN/ES setting: changing it changes
UI messages, not the selected template variant.

## Render Props

The `render` function receives only render inputs:

- `data` — an object containing all field keys with the value type defined by
  each field after resolution. Text, color, image, and choice values are strings;
  number values are finite numbers; boolean values are booleans. In Studio,
  values are applied in this order: field defaults, variant content, then user
  edits. Local incomplete number drafts are not render data.
- `assets` — generated URLs for common and variant template assets.
- `variant` — the key of the currently selected variant, typed as a union of all content keys.
- `width` — the template width as a literal type.
- `height` — the template height as a literal type.

The render function is independent of Studio state and browser-only editor APIs. An image field resolves to a browser URL string. Variant fields use `assets/<variant>/<field-key>.*`; common fields use `assets/common/<field-key>.*`. A public image can be referenced with a root-relative value such as `/assets/logos/brand.svg` in `defaultValue` or variant content. Public files are not scanned into the template asset manifest.

In Studio, preview and render consume only committed resolved values. Download and
copy validate the current committed data before producing output, report field
errors, and focus the first invalid control. Temporary number drafts remain inside
the number control and are never passed to `render`.

Studio stores committed edits per template and variant in browser `localStorage` under
`framekit:<slug>:v2`. Older persisted state is invalidated rather than migrated.

```tsx
fields: {
  hero: field.image({ label: 'Hero image' }),
  background: field.image({ label: 'Background', scope: 'common' }),
},
```

```text
src/templates/social-card/assets/
├── common/background.webp
└── en/hero.webp
```

```tsx
logo: field.image({
  label: 'Brand logo',
  defaultValue: '/assets/logos/brand.svg',
})
```

## Auto-Regeneration

When running `framekit dev`, FrameKit watches `src/` for changes that affect the generated template and brand registries:

- Under `src/templates/`, any added, removed, or changed file or directory triggers regeneration. This includes private helpers and metadata or variant files imported by a template. Generated modules are written only when their serialized content changes.
- Under `src/brand/`, adding, removing, or changing files or directories triggers regeneration. Brand components are discovered recursively, and each component directory must follow the `src/brand` contract described in the [Brand Components](./brand-components.md) guide.

`framekit dev` performs one blocking generation before starting Next.js.
`framekit check` and `framekit build` also generate automatically; `framekit start`
uses existing build output and does not generate. For one-off regeneration, run
`framekit generate`. The shared generation command requires at least one
template; it discovers both templates and brand components, then writes
`src/generated/framekit/templates.ts` and `src/generated/framekit/brands.ts`.

## Reserved Keys

The key `language` is reserved inside `fields` and cannot be used as a field name. FrameKit rejects it at both build time and runtime. Content entries contain field values only; a `language` property is rejected as an unknown field key.

---

[English](./template-authoring.md) · [Español](../../es/guides/template-authoring.md) · [GitHub issue #3](https://github.com/MauricioDMO/FrameKit/issues/3) · [GitHub issue #4](https://github.com/MauricioDMO/FrameKit/issues/4) · [GitHub issue #5](https://github.com/MauricioDMO/FrameKit/issues/5) · [GitHub issue #6](https://github.com/MauricioDMO/FrameKit/issues/6) · [GitHub issue #7](https://github.com/MauricioDMO/FrameKit/issues/7) · [GitHub issue #8](https://github.com/MauricioDMO/FrameKit/issues/8) · [GitHub issue #12](https://github.com/MauricioDMO/FrameKit/issues/12) · [GitHub issue #13](https://github.com/MauricioDMO/FrameKit/issues/13) · [Studio canonical contract plan](../../Plans/Future/issue-13-studio-canonical-contract.md)
