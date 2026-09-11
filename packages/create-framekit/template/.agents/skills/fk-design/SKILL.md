---
name: fk-design
description: Define or document the visual language of a FrameKit project in its root DESIGN.md. Use before creating templates or brand components when the visual direction is missing, inconsistent, or needs an intentional update.
---

# FrameKit Design

`DESIGN.md` is the agent-facing source of truth for a project's visual
language. It describes the fixed-size compositions that FrameKit renders and
exports as PNG; it is not a replacement for CSS, template definitions, or the
application's general UI design system.

## Before writing

Inspect the project root, existing `DESIGN.md`, templates, `src/brand/`,
`src/profile.ts`, assets, and global styles. Preserve established decisions
unless the user asks for a change. Separate observed project facts from new
recommendations.

If the user has supplied a brand guide, approved palette, fonts, or references,
use those as the source of truth. If no source exists, derive a modest direction
from the user's brief and label assumptions clearly. Never invent company data,
contact information, logos, or approved assets.

## What the document must cover

Write a concise root-level `DESIGN.md` with these sections:

1. **Visual direction:** the intended mood, audience, hierarchy, density, and
   appropriate level of visual contrast.
2. **Color roles:** named colors with exact values and roles for canvas,
   surfaces, text, muted text, borders, and accents. State contrast or usage
   constraints when relevant.
3. **Typography:** the actual available font families, weights, sizes, line
   heights, tracking, and text-width limits for fixed-size exports.
4. **Composition:** default margins, grid or alignment rules, spacing rhythm,
   focal point, layering, and how the rules adapt to the project's output sizes.
5. **Images and assets:** approved image treatment, cropping, logos, icons,
   asset sources, and the distinction between `assets/common`, variant assets,
   and `public/assets`.
6. **Content and data:** voice, capitalization, text-length expectations, and
   which public values may come from `src/profile.ts`.
7. **Reuse boundaries:** which visual patterns belong in `src/brand/` and which
   stay local to a template.
8. **Export constraints:** exact dimensions, safe areas, overflow behavior,
   readable text, and static PNG expectations.
9. **Avoid:** project-specific anti-patterns such as fabricated data, unapproved
   colors, missing assets, text overflow, or decorative elements that weaken
   hierarchy.

Intentional overlap is valid in a static composition when it is part of the
direction. Document its layering and safe boundaries instead of banning overlap
categorically. Do not add hover states, responsive navigation, perpetual
animation, or other screen-UI rules unless the user is also designing a separate
application surface.

## Output rules

- Update an existing `DESIGN.md` instead of replacing it wholesale.
- Prefer concrete values and functional names over generic adjectives.
- Use fonts and assets that exist in the project or that the user explicitly
  approved; do not promise a font that the export cannot load.
- Keep fixed branding, composition, and export constraints out of editable
  fields unless the user explicitly wants them editable.
- Do not create template or component code as part of this skill. Hand off to
  `fk-templates` or `fk-brand` after the design source is ready.

Use `resources/DESIGN.md` as a structure reference when creating a new
document, adapting every value to the actual project.
