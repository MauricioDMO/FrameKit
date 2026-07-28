---
name: fk-brand
description: Create, classify, document, preview, extract, or reuse brand components in a FrameKit project. Use whenever a user mentions src/brand, reusable brand UI, a component catalog or preview, component README files, extracting JSX from a template, or deciding whether visual code belongs in a brand component or a template.
---

# FrameKit Brand

Brand components are reusable visual decisions owned by the project brand, not generic UI, editor controls, or complete templates.

## Mandatory design preflight

Before creating or changing a visual brand component:

1. Read `DESIGN.md` and use it as the source of truth for visual decisions.
2. Inspect existing brand components and project styling before creating values.
3. Reuse the existing design language.

If `DESIGN.md` is missing, do not silently invent brand styling. Ask the user to provide or create it first. Use the `design-md` skill when the project has the required Stitch inputs; otherwise explain what information is missing.

## Decide where code belongs

Use this order:

- `src/components/` for UI that is independent of the brand.
- `src/brand/` for reusable visual language, brand patterns, and brand communication blocks.
- `src/templates/<template>/` for code used by only one template.
- `packages/framekit/src/editor/` only for FrameKit's reusable editor UI, never for project brand artwork.

Inspect the relevant branch first. Extract JSX only when it has a clear reuse case; do not abstract a one-use template block.

## Brand tree

Classify by semantic purpose, not implementation level or distribution channel:

```text
src/brand/
├── README.md
└── <semantic-domain>/
    ├── README.md
    └── <communication-intent>/
        ├── README.md
        └── <component>/
            ├── README.md
            ├── component.tsx
            └── preview.tsx
```

Use semantic, channel-neutral domains and intents, such as `people/person-quote`. Keep channel, format, dimensions, and export constraints in the consuming template. Add taxonomy levels only when they clarify real siblings.

## Documentation contract

Add `README.md` at each classification level. Document immediate children and, for each component, its purpose, inputs, constraints, when to use it, and when to choose a sibling. Document the decision boundary, not only its appearance.

## Component files

- `component.tsx` contains the reusable component and accepts semantic props.
- `preview.tsx` renders a representative example and reuses `component.tsx`.
- `README.md` explains use cases and constraints.

Keep channel-specific wrappers, dimensions, and field resolution in the template. The component should not require an Instagram or LinkedIn prop merely because its first consumer is on that platform.

Use profile values or approved sample content in previews; never invent real contact information.

## Component catalog/view

If a component catalog exists, follow the template catalog pattern:

- Discover leaf directories through `component.tsx`.
- Derive navigation segments from the nested path.
- Render folders as a collapsible tree.
- Render `preview.tsx` on the selected component page.
- Do not add search or runtime Markdown parsing; README files are agent-facing documentation.

When a component needs editable preview controls, first confirm that this is required. Prefer a static representative preview until an editor contract for component props exists.

## Quality check

Before finishing:

1. Confirm `DESIGN.md`, reuse, semantic placement, and channel neutrality.
2. Read the nearest parent README and write the component README.
3. Run the applicable typecheck, lint, and visual preview checks.
