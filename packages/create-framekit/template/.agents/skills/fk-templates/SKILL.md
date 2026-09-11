---
name: fk-templates
description: Create, design, organize, validate, troubleshoot, or plan visual templates in a FrameKit project. Use for vague visual ideas and template briefs, template files, editable fields, content variants, render functions, Markdown, assets, brand reuse, and discovery or validation failures.
---

# FrameKit Templates

Templates live under `src/templates/`. A directory containing a default-exporting `template.tsx` is discovered as a Studio template.

## Turn an idea into a FrameKit brief

When the request is vague, clarify it as a template brief before writing code.
Keep the brief focused on a fixed-size visual export, not a general web page.
Capture:

- purpose, audience, channel, and requested dimensions;
- a lowercase kebab-case slug and useful `meta` text;
- the visual direction from `DESIGN.md`, existing styles, and approved assets;
- editable fields with their type, label, defaults, and validation;
- content variants and whether their keys represent language, campaign, or another concept;
- shared assets in `assets/common` and variant assets in `assets/<variant>`;
- the composition order and which reusable `src/brand` components should be used;
- the smallest validation and visual-check workflow.

Do not invent contact information, metrics, logos, or assets. Ask only for
decisions that cannot be inferred from the project or the request. Preserve a
simple request instead of adding fields, variants, or abstractions for later.

## Before creating artwork

- Treat `DESIGN.md` as the source of truth for visual decisions. If it is missing and the task needs a new visual direction, use `fk-design`; otherwise ask for the design source instead of inventing one.
- Inspect `src/profile.ts` when present, ask which actual exports to use, and never invent contact information. Import synchronized values instead of duplicating them in defaults.
- Consult `fk-brand` and inspect `src/brand/` before creating reusable visual JSX. Reuse an existing component before extracting a new one.
- Follow explicit user overrides while keeping other decisions consistent with the design system.

## Workflow

1. Inspect existing templates, assets, aliases, styling, `DESIGN.md`, and `src/profile.ts`.
2. Choose dimensions, then create a lowercase kebab-case directory. Use [social sizes](references/social-media-sizes.md) for social formats.
3. Decide what users edit. Keep fixed branding and layout out of fields. Read [Template Fields](references/fields.md) and [Image Fields](references/image-fields.md).
4. Start with one inline `template.tsx` using `defineTemplate`, including required `meta.title`, dimensions, fields, at least one content variant, and `render`.
5. Build from the render props `data`, `assets`, `variant`, `width`, and `height`. Use Tailwind classes for static styling; reserve inline styles for runtime values and computed dimensions.
6. Run `framekit check`; for visual work, inspect Studio with `framekit dev` and export PNG when appearance matters.

`framekit dev` generates the canonical `templates` registry before starting Studio
and regenerates it when files below `src/templates` change. `framekit check` and
`framekit build` generate automatically; `framekit start` reads the built output.
The generated registry contains validated summaries and lazy template loaders; use
the generated `templates` export directly rather than maintaining an adapter or a
second registry.

## Template rules

- Every field needs a non-empty `label`; `required` defaults to `true`. See [Template Fields](references/fields.md).
- Every `defineTemplate` requires `meta` with a non-empty `title`, for example `meta: { title: 'Social card' }`.
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

`definition.ts` owns dimensions, fields, and content variants. `artwork.tsx` receives typed render props. `template.tsx` combines them. Do not redeclare definition values or add a nested `template.tsx`.

Use `assets/common` for shared images and `assets/<variant>` for variant-specific images. Put project-wide fallbacks in `public/assets` and reference them with root-relative paths. Read [Image Fields](references/image-fields.md) for precedence and uploads.
