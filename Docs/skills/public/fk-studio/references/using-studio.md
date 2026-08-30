# Using FrameKit Studio

## Catalog

- Studio is a browser editor for template content, preview, and PNG export.
- Studio consumes the generated `TemplateRegistryEntry`. Its `segments` create compact nested folders, and `entry.meta.title` is the canonical title for both navigation and the selected editor heading; do not derive a display title from the slug. Navigation nodes are alphabetized by title, folders start expanded, and selecting a template opens `/editor/<slug>`.
- Folder expansion is persisted in the browser. Expanded folder child groups alone show scope lines; template links do not. The Templates and Brand route tabs use stack and tag icons, and the tree preserves `aria-current`, `aria-expanded`, keyboard operation, and visible focus. There is no search or filter feature.
- Selected-template metadata displays optional `meta.description`, `meta.marketingDescription`, and `meta.tags` only when present, with functional and marketing descriptions kept distinct.

## Variants and interface localization

- **Variant** selects the template content variant and is labeled `Variant`/`Variante`. For a new editor state, `definition.variants.default` selects the initial variant. Variant keys may be any string; each variant has separate values. Option text is `definition.variants.labels?.[key] ?? key`, in content-key order.
- At resolution time, an unknown variant is an error, not a silent fallback; an invalid persisted selection is discarded and a new state uses the declared default. **Studio interface locale** changes Studio labels and messages, supports English (`en`) and Spanish (`es`), and is independent from the selected template variant. The `locale` cookie takes precedence over `Accept-Language`; only an English-prefixed value selects English.
- Edits are stored in browser `localStorage` under the exact key `framekit:<slug>:v2`, with edits grouped by variant. The old `v1` format is not read or migrated.
- Malformed top-level persisted state or an invalid selected variant is discarded. Unknown saved fields and variants, malformed variant entries, wrong-typed values, and invalid persisted numbers are ignored. On definition refresh, recognized variants and fields with accepted runtime types are rebased to the new definition; a valid selected variant is preserved and an invalid one resets to `variants.default`.
- **Reset** clears only the selected variant's edits. Changing the variant also clears displayed validation errors.

## Fields and preview

- Field definitions select six controls: text uses a textarea and stores a string; number uses its declared native number input or range slider and stores a finite number; choice uses a select and stores a declared string; boolean uses a checkbox and stores a boolean; color uses the color picker and stores a string; image uses the project-asset preview/upload control and stores an asset source string when resolved. Text values preserve newlines and may declare length limits. Choice values follow declared order and invalid values return `invalid_choice`; boolean string substitutes return `invalid_boolean`.
- An incomplete number input draft stays local to the number control and never enters committed editor data. Preview/render use only resolved committed typed data, not a global last-valid-preview cache. Required values are checked on export or copy; optional empty values are valid.
- Image resolution and uploads are documented in [Image Fields](../../fk-templates/references/image-fields.md).
- The preview fits the available area without exceeding 100%, with a 10% minimum. Hold Ctrl while scrolling to zoom from 10% to 400% around the pointer; drag to pan. **Actual size** sets 100%; **Fit to view** refits. Resize refitting only runs in fit mode.

## Export and theme

- Export and Copy PNG validate current resolved committed data first and focus the first invalid field. Export then waits for `document.fonts.ready` and captures a PNG at the declared dimensions with scale 1; Copy PNG uses the captured PNG when clipboard support is available.
- The download name replaces `/` in the slug with `-`, for example `social-instagram-post.png`.
- Export runs in the browser and exposes no alternate format, scale, or DPI control.
- The theme uses the `theme` cookie or browser color-scheme preference. Settings toggles it and persists the choice for one year.

## States

Studio can show empty, loading, invalid-definition, data-error, upload-error, export-error, load-error, and not-found states. Raw loader errors are not exposed: localized template or brand load messages are shown instead. A not-found slug is a localized visual state, not an HTTP 404 page.
