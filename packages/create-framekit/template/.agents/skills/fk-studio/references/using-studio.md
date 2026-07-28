# Using FrameKit Studio

## Catalog

- Studio is a browser editor for template content, preview, and PNG export.
- Slashes in a template slug create nested folders. Navigation nodes are alphabetized by title, folders start expanded, and selecting a template opens `/editor/<slug>`.

## Languages and edits

- **Design language** selects the template content locale. Locale keys may be any string; each locale has separate values.
- **App language** changes Studio labels and messages. It supports English (`en`) and Spanish (`es`). The `locale` cookie takes precedence over `Accept-Language`; only an English-prefixed value selects English.
- Edits are stored in browser `localStorage` by template slug and design locale. There is no server sync, account, or collaboration feature.
- Malformed persisted state or an invalid selected locale is discarded. Unknown saved fields and locales inside valid data are ignored.
- **Reset** clears only the selected locale's edits. Changing the design language also clears displayed validation errors.

## Fields and preview

- Field definitions select text, textarea, number, color, or image controls. Required values are checked on export; optional empty values are valid.
- Image resolution and uploads are documented in [Image Fields](../../fk-templates/references/image-fields.md).
- The preview fits the available area without exceeding 100%, with a 10% minimum. Hold Ctrl while scrolling to zoom from 10% to 400% around the pointer; drag to pan. **Actual size** sets 100%; **Fit to view** refits. Resize refitting only runs in fit mode.

## Export and theme

- Export validates resolved data first, focuses the first invalid field, waits for `document.fonts.ready`, and captures a PNG at the declared dimensions with scale 1.
- The download name replaces `/` in the slug with `-`, for example `social-instagram-post.png`.
- Export runs in the browser and exposes no alternate format, scale, or DPI control.
- The theme uses the `theme` cookie or browser color-scheme preference. Settings toggles it and persists the choice for one year.

## States

Studio can show empty, loading, invalid-definition, load-error, and not-found states. A not-found slug is an editor state, not an HTTP 404 page.
