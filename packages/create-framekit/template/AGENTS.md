# FrameKit Project

## What FrameKit is

FrameKit is a React and Next.js toolkit for creating typed, reusable visual
templates. A project defines templates, editable fields, content variants, and
assets in source code. FrameKit Studio lets users browse those templates, edit
their content in the browser, preview the result, and export PNG images.

Projects can also contain reusable brand components under `src/brand/`. Brand
components express the project's visual language and can be reused by multiple
templates.

## Focus and boundaries

FrameKit focuses on code-defined visual communication: social cards, banners,
campaign graphics, branded compositions, and similar fixed-size exports.

It is not a general CMS, a design-token system, an arbitrary/public rendering
service, a collaboration service, or a replacement for the application's
general UI. The shipped `/api/framekit/images/render` route supports synchronous
server-side PNG generation for defined templates. Studio export is browser-based and
currently supports PNG.

## Project map

- `src/templates/` contains discoverable visual templates. A directory with a
  default-exporting `template.tsx` is registered automatically.
- `src/brand/` contains reusable brand components and their previews.
- `src/profile.ts` may contain public company information used in images. Do
  not invent contact information when several values are possible.
- `public/assets/` contains project-wide public assets.
- `.agents/skills/` contains the public FrameKit skills for agent work.
- `src/generated/framekit/` and `public/framekit/` are generated output.

## Working rules

- Read `DESIGN.md` when it exists before making visual decisions. If brand
  styling is needed and it is missing, ask for the design source instead of
  inventing a visual language.
- Inspect existing templates, brand components, styles, assets, and
  `src/profile.ts` before adding new visual code.
- Use `@mauriciodmo/framekit` public imports. Do not import FrameKit source
  files from another package or recreate the generated registry.
- Keep one-use artwork in its template. Extract code to `src/brand/` only when
  there is a clear reuse case.
- Keep template fields for user-editable content. Keep fixed branding, layout,
  dimensions, and export constraints in the template or brand component.
- Do not edit generated files manually.

## Template workflow

Define templates with `defineTemplate` or `defineTemplateBase` and the `field`
API. Every template needs a non-empty `meta.title`, positive dimensions, at
least one content variant, and a `render` function. Variant keys are owned by
each template and are not required to be language codes.

Run `framekit check` after changing a definition, `framekit generate` after
discovery or asset changes, `framekit dev` for visual work, and `framekit build`
before `framekit start`.

Read the relevant skill before working:

- `fk-design` for the project's visual language and `DESIGN.md`.
- `fk-brand` for reusable brand components and reuse decisions.
- `fk-templates` for template briefs, authoring, fields, variants, and assets.
- `fk-setup` for installation, commands, and integration.
- `fk-studio` for Studio behavior and troubleshooting.
