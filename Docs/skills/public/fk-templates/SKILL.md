---
name: fk-templates
description: Create, design, organize, validate, or troubleshoot visual templates in a FrameKit project. Use for template files, editable fields, locales, render functions, Markdown, assets, and discovery or validation failures.
---

# FrameKit Templates

Templates live under `src/templates/`. A directory containing a default-exporting `template.tsx` is discovered as a Studio template.

## Before creating artwork

- Treat `DESIGN.md` as the source of truth for visual decisions. If brand styling is needed and it is missing, ask for the design source instead of inventing one.
- Inspect `src/profile.ts` when present, ask which actual exports to use, and never invent contact information. Import synchronized values instead of duplicating them in defaults.
- Read `src/brand/README.md` when present. Consult `fk-brand` and reuse an existing brand component before creating reusable visual JSX.
- Follow explicit user overrides while keeping other decisions consistent with the design system.

## Workflow

1. Inspect existing templates, assets, aliases, styling, `DESIGN.md`, and `src/profile.ts`.
2. Choose dimensions, then create a lowercase kebab-case directory. Use [social sizes](references/social-media-sizes.md) for social formats.
3. Decide what users edit. Keep fixed branding and layout out of fields. Read [Template Fields](references/fields.md) and [Image Fields](references/image-fields.md).
4. Start with one inline `template.tsx` using `defineTemplate`, dimensions, fields, at least one locale, and `render`.
5. Build from the render props `data`, `assets`, `locale`, `width`, and `height`. Use Tailwind classes for static styling; reserve inline styles for runtime values and computed dimensions.
6. Run `framekit check`; for visual work, inspect Studio with `framekit dev` and export PNG when appearance matters.

## Template rules

- Every field needs a non-empty `label`; `required` defaults to `true`. See [Template Fields](references/fields.md).
- `Markdown` is opt-in; see [FrameKit Markdown](references/markdown.md).
- Use the installed icon libraries; see [Iconography](references/icons.md).
- Template paths must use lowercase kebab-case. Directories beginning with `.` or `_` are ignored; directories without `template.tsx` may contain deeper templates.

## Larger templates

When a template needs a reusable brand block, keep it in `src/brand/`; keep channel, format, dimensions, and field resolution in the template. Use `fk-brand` for its placement and documentation.

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
