---
name: framekit-template-creation
description: Create, design, organize, validate, or troubleshoot visual templates in a FrameKit project. Use for template files, editable fields, locales, render functions, Markdown, assets, and discovery or validation failures.
---

# FrameKit Template Creation

Templates live under `src/templates/`. A directory containing a default-exporting `template.tsx` is discovered as a Studio template.

## Before creating artwork

- Read `DESIGN.md` when present and use it as the source of truth for colors, typography, spacing, shapes, shadows, imagery, and composition. If it is missing, recommend creating one before visual work.
- Read `src/profile.ts` when present. Inspect its actual exports and ask which public values to use; never invent contact information. Import values that should stay synchronized instead of copying them into defaults.
- Follow the user's brief when it explicitly overrides the design system, but keep other choices consistent with it.

## Workflow

1. Inspect existing templates, assets, aliases, styling, `DESIGN.md`, and `src/profile.ts`.
2. Choose dimensions, then create a lowercase kebab-case directory. Use [social sizes](references/social-media-sizes.md) for social formats.
3. Decide what users edit. Keep fixed branding and layout out of fields. Read [Template Fields](references/fields.md) and [Image Fields](references/image-fields.md).
4. Start with one inline `template.tsx` using `defineTemplate`, dimensions, fields, at least one locale, and `render`.
5. Build from the render props `data`, `assets`, `locale`, `width`, and `height`. Use Tailwind classes for static styling; reserve inline styles for runtime values and computed dimensions.
6. Run `framekit check`. For visual work, run `framekit dev`, inspect Studio, and export PNG when appearance matters.

## Template rules

- Every field needs a non-empty `label`; `required` defaults to `true`. Read [Template Fields](references/fields.md) instead of duplicating field rules here.
- `Markdown` is opt-in. Pass a text or textarea value to `<Markdown>`; read [FrameKit Markdown](references/markdown.md) for supported syntax.
- Use `@tabler/icons-react` for interface or decorative icons and `@icons-pack/react-simple-icons` for brands. Read [Iconography](references/icons.md).
- Template paths must use lowercase kebab-case. Directories beginning with `.` or `_` are ignored; directories without `template.tsx` may contain deeper templates.
- `framekit check` validates definitions and resolved locale data, not rendering or PNG export.

## Larger templates

Keep `template.tsx` as the only discovery entrypoint and default export:

```text
src/templates/social-card/
  template.tsx
  definition.ts
  artwork.tsx
  components/
  assets/
```

`definition.ts` owns dimensions, fields, and locales. `artwork.tsx` receives typed render props. `template.tsx` combines them. Do not redeclare definition values or add a nested `template.tsx`.

Use `assets/common` for shared images and `assets/<locale>` for locale-specific images. Put project-wide fallbacks in `public/assets` and reference them with root-relative paths. Read [Image Fields](references/image-fields.md) for precedence and uploads.
