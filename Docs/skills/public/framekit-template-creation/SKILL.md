---
name: framekit-template-creation
description: Create, design, organize, validate, or troubleshoot visual templates in a generated or compiled FrameKit project. Use whenever a user asks to create a template from a brief, copy, screenshot, reference, or design; changes files under src/templates; defines editable content, fields, locales, or render functions; splits a large template into files; uses FrameKit Markdown; or diagnoses discovery and framekit check/dev/build failures.
---

# FrameKit Template Creation

Create visual templates under `src/templates/`. A directory containing a default-exporting `template.tsx` is discovered automatically and becomes a Studio template.

## Design System First

Before creating any visual artwork, check the project root for `DESIGN.md`.

- If `DESIGN.md` is missing, recommend that the user configure one before creating the images. It should capture the visual language that templates must share, including colors, typography, spacing, shapes, borders, shadows, imagery, and composition.
- If it exists, read it before choosing styles or building artwork. Treat it as the source of truth for every visual decision.
- Base the template's colors, type scale, spacing, component treatment, imagery, and overall composition on `DESIGN.md`. Do not invent a separate visual language when the file already defines one.
- Follow the user's explicit brief when it intentionally overrides the design system, but keep all non-overridden decisions consistent with `DESIGN.md`.

## Creation Workflow

1. Check and read `DESIGN.md` as described above, then inspect existing templates, local assets, and project styling. Reuse the design system and existing conventions before creating new artwork.
2. Choose the output dimensions for the destination, then create a lowercase kebab-case directory such as `social-card`.
   For social content, use [references/social-media-sizes.md](references/social-media-sizes.md) to choose a master format and export preset.
3. Decide which copy, colors, images, links, or numeric values the Studio user must edit. Keep fixed branding and decorative layout out of fields.
4. Start with an inline `template.tsx`. Define dimensions, fields, at least one content locale, and `render`.
5. Build the artwork from `data`, `locale`, `width`, and `height` received by `render`; do not duplicate definition values in the component. Use Tailwind utility classes for styling instead of `style={}`. Reserve inline styles for runtime values such as editable colors or computed dimensions that Tailwind cannot statically generate.
6. When the layout is substantial, extract the definition and artwork using the supported three-file pattern below.
7. Run `framekit check`. For visual work, run `framekit dev`, inspect the template in Studio, and export a PNG when the final appearance matters.

```tsx
import { defineTemplate, fields, Markdown } from '@mauriciodmo/framekit'

export default defineTemplate({
  width: 1200,
  height: 800,
  fields: {
    title: fields.text({ label: 'Title' }),
    accentColor: fields.color({ label: 'Accent color', defaultValue: '#b9f8d2' }),
  },
  content: {
    en: { language: 'English', title: 'Your next story starts here' },
  },
  render({ data, locale, width, height }) {
    return (
      <article
        lang={locale}
        className="size-full"
        style={{ width, height, color: data.accentColor }}
      >
        <Markdown value={data.title} />
      </article>
    )
  },
})
```

## Editable Fields

Every field needs a human-readable `label`. Shared options are `placeholder`, `required` (defaults to `true`), and `defaultValue`.

| Field | Use for | Notes |
| --- | --- | --- |
| `fields.text` | Short, single-line copy such as a title, label, or CTA | No extra constraints. |
| `fields.textarea` | Long copy, paragraphs, or Markdown content | Use `<Markdown>` when formatted copy should render. |
| `fields.number` | Counts, prices, percentages, or bounded numeric values | Add `min` and `max` when applicable. `data` still receives a string; parse it before arithmetic. |
| `fields.color` | Editable solid colors | A non-empty value must be `#RRGGBB`. |
| `fields.url` | Image sources, links, or other URLs | Accepts HTTP(S) absolute URLs and root-relative `/path` values only. |

Each locale needs a human-readable `language` property. Locale keys may be any identifier. `language` is reserved, cannot be a field name, and is not included in `data`. Values resolve in this order: field default, selected locale content, then Studio edits.

Read [references/fields-and-markdown.md](references/fields-and-markdown.md) for field constraints and supported Markdown.

## Styling

Use Tailwind utility classes for layout, typography, spacing, borders, shadows, and static colors. Do not use `style={}` for values Tailwind can express. Inline styles are appropriate only for runtime values from `data` or computed render dimensions.

## Large Templates

Keep a simple template in one file. When its artwork or helpers make it difficult to read, keep `template.tsx` as the discovery entrypoint and use this structure:

```text
src/templates/social-card/
  template.tsx
  definition.ts
  artwork.tsx
  components/
  assets/
```

`definition.ts` owns dimensions, fields, and locales. `artwork.tsx` receives the inferred render props. `template.tsx` combines both and remains the only default-exporting `template.tsx` in this template.

```tsx
// definition.ts
import { defineTemplateBase, fields } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Title' }),
    accentColor: fields.color({ label: 'Accent', defaultValue: '#b9f8d2' }),
  },
  content: {
    en: { language: 'English', title: 'Your next story starts here' },
  },
})
```

```tsx
// artwork.tsx
import type { TemplateRenderProps } from '@mauriciodmo/framekit'
import type { templateBase } from './definition'

type ArtworkProps = TemplateRenderProps<typeof templateBase>

export function Artwork({ data, locale, width, height }: ArtworkProps) {
  return (
    <article
      lang={locale}
      className="flex size-full items-center p-12 text-5xl font-bold"
      style={{ width, height, color: data.accentColor }}
    >
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

export default defineTemplate({ ...templateBase, render: Artwork })
```

Do not redeclare fields, locales, or dimensions in `artwork.tsx`. Do not add a nested `template.tsx`: a directory with that filename is a discovery boundary, and its descendants are private helpers, components, and assets.

## Discovery And Verification

- Every directory below `src/templates/` must use lowercase letters, digits, and single hyphens: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Directories beginning with `.` or `_` are ignored. Category directories without `template.tsx` may contain deeper templates.
- The template slug is its path below `src/templates/`, joined with `/`.
- `framekit check` validates definitions and resolved data for every locale. It does not typecheck rendering or verify PNG export.
- `framekit dev` regenerates the registry after structural changes. Existing `template.tsx` edits use HMR; restart development if added or removed files are not reflected.

Read [references/validation-and-troubleshooting.md](references/validation-and-troubleshooting.md) when validation or discovery fails.
