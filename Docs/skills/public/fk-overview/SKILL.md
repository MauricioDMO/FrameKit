---
name: fk-overview
description: Explain what FrameKit is, what it focuses on, how a generated project is organized, and where new code belongs. Use when orienting an agent or deciding whether work belongs in a template, brand component, Studio, or general application UI.
---

# FrameKit Overview

FrameKit is a React and Next.js toolkit for creating typed, reusable visual
templates. Projects define editable fields, content variants, render functions,
and assets in source code. FrameKit Studio runs in the browser and provides
template navigation, editing, preview, and PNG export.

FrameKit also supports reusable brand components under `src/brand/`. These
components express visual language or communication patterns and can be reused
by multiple templates.

## Focus

FrameKit is for code-defined visual communication such as social cards,
banners, campaign graphics, and other fixed-size branded exports. It is not a
general CMS, a server-side image-generation API, a collaboration service, or a
replacement for an application's general UI. Export is browser-based and
currently supports PNG.

## Project boundaries

- Put one-use artwork, fields, dimensions, variants, and format-specific
  composition in `src/templates/<template>/`.
- Put reusable brand language and communication blocks in `src/brand/`.
- Put application UI that is independent of the brand or editor in
  `src/components/`.
- Keep public company information in `src/profile.ts` when templates need it;
  never invent real contact data.
- Treat `src/generated/framekit/` and `public/framekit/` as generated output.

## Authoring defaults

Use the public `@mauriciodmo/framekit` imports and the `defineTemplate` plus
`field` APIs. A discoverable template is a directory under `src/templates/`
with a default-exporting `template.tsx`. It requires a non-empty `meta.title`,
positive dimensions, at least one content variant, and a `render` function.
Variant keys belong to each template and do not have to be language codes.

Before visual work, inspect existing styles, templates, brand components,
assets, and `DESIGN.md` when present. Run `framekit check` after definition
changes and use `framekit dev` to inspect visual results.
