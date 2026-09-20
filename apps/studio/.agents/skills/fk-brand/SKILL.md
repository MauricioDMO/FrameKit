---
name: fk-brand
description: Reuse and create project-owned brand components in a FrameKit project. Use whenever work touches src/brand, reusable visual JSX, brand previews, component README files, or the decision between a brand component and one-template artwork.
---

# FrameKit Brand

`src/brand/` contains reusable visual decisions owned by the project brand. It is
not a home for generic application UI, editor controls, or complete templates.

## Reuse first

Before writing new visual JSX:

1. Read `DESIGN.md` when it exists.
2. Inspect `src/brand/` and the consuming templates.
3. Reuse or extend an existing component when it represents the same visual pattern.
4. Keep one-use artwork in its template instead of abstracting it early.

If a new visual language is needed and `DESIGN.md` is missing, use `fk-design`
to define it before creating reusable brand code. Do not invent company data or
brand assets.

## Placement

Use this order:

- `src/components/` for UI that is independent of the brand.
- `src/brand/` for reusable visual language, brand patterns, and brand communication blocks.
- `src/templates/<template>/` for code used by only one template.
- `packages/framekit/src/editor/` is FrameKit source and is never a project brand location.

Keep props semantic and channel-neutral. Do not add an Instagram, LinkedIn, or
dimension prop merely because the first consumer uses that channel or format.

## Component contract

FrameKit discovers leaf directories containing these files:

- `component.tsx`: reusable component with semantic props.
- `preview.tsx`: default-exported representative preview.
- `README.md`: description used by the Studio catalog and guidance for agents.

Organize directories by semantic purpose, not by channel or export size. Add
classification levels only when they clarify real siblings. Use profile values
or approved sample content in previews; never invent real contact information.

## Finish

After adding or changing a brand component:

1. Confirm the component is reused by, or clearly intended for, more than one template.
2. Confirm the component is channel-neutral and its README explains purpose, props,
   constraints, and when to choose a sibling.
3. Run `framekit generate` when discovery output needs refreshing and inspect the
   component under `/brand` with `framekit dev`.
