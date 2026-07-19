# Studio

Studio is the visual editor for FrameKit templates. It lets you navigate a template catalog, edit content for any supported locale, preview results, and export final PNG images — all entirely in the browser.

## Navigation

Templates are organized in a sidebar derived from their slug path. Each path segment becomes a folder level, so a slug like `social/instagram/post` creates a `Social` folder containing an `Instagram` subfolder with a `Post` template inside. Shared path prefixes produce shared folder hierarchies automatically.

Within each folder, items are sorted alphabetically by title. Folder names are humanized from their slug segments (e.g., `instagram-post` becomes "Instagram Post").

Selecting a template navigates to `/editor/<slug>`. Folders in the sidebar are collapsible and start expanded. The currently open template is marked with `aria-current="page"` for accessibility.

## Design locale vs. Interface language

Studio distinguishes between two separate language concerns:

**Design locale** (labeled "Design language" in the UI) refers to which content variant of a template is being edited. Templates can define arbitrary locale keys — `en`, `es`, `fr`, or any string — and each locale holds its own set of field values. Switching the design locale clears all currently displayed validation errors.

**Interface language** controls the language of Studio's own labels, buttons, and messages. It is limited to `en` (English) or `es` (Spanish). Changing it updates the React state, the `lang` attribute on the `<html>` element, and stores a one-year `locale` cookie.

Interface language is resolved in this order: the `locale` cookie → the `Accept-Language` header → if the header starts with `en` use English → otherwise fall back to Spanish.

## Field editing

Each field in a template renders according to its kind: text input, textarea, number input, color picker, or URL input. The specific input type is determined from the field definition.

Required fields are validated when you attempt to export. Optional fields pass validation when left empty.

Number fields respect `min` and `max` constraints defined in the template. URL fields accept absolute URLs beginning with `http://` or `https://`, as well as root-relative paths beginning with `/`.

## Persistence

All edits are stored in the browser's `localStorage` under the key `framekit:<slug>:v1`. Each template slug has its own isolated storage entry, and data is also isolated per locale within that entry.

Malformed stored state is discarded safely and the editor starts fresh. Stored edits for locales or fields that no longer exist are ignored. No server sync, no account, and no collaboration — everything stays in your browser.

## Reset

The Reset button removes edits only for the currently selected locale of the current template. It does not clear other locales or other templates.

## Preview and zoom

The preview area shows the template at its declared dimensions. On load, it scales to fit the available space, capped at 100% so the full template is always visible. The minimum scale is 10%.

Zoom is controlled by holding **Ctrl** and scrolling the mouse wheel. The zoom centers on the pointer position. The zoom range is 10% to 400%.

When zoomed in past the container edges, you can pan by dragging the preview area. The grab cursor indicates panning mode; during drag it switches to grabbing.

Two buttons sit in the lower-right corner of the preview: **Actual size** resets to 100% scale, and **Fit to view** refits the template to the container. Auto-refit on window resize only occurs while the preview is in fit-to-view mode; manual zoom positions are preserved on resize.

## PNG export

The Export button validates the current resolved data before doing anything else. If any field fails validation, the first invalid field receives focus and the export stops. After validation passes, the browser waits for fonts to finish loading via `document.fonts.ready`, then captures the template at exactly its declared `width×height` at scale 1 using `modern-screenshot`.

The browser then downloads a PNG file. The filename uses the template slug with `/` replaced by `-` (e.g., `social/instagram/post` becomes `social-instagram-post.png`).

Export runs entirely in the browser. There is no server-side rendering, no format options, and no scale or DPI controls in the alpha release.

## Theme

Studio applies a dark or light theme. The initial theme is read from the `theme` cookie or, if absent, from the browser's `prefers-color-scheme` preference. A small inline script runs before React hydrates to apply the correct class to `<html>` and avoid a flash of the wrong theme.

The theme can be toggled through the Settings panel. The preference is stored in a one-year cookie so it persists across sessions.

## States

Studio displays different states depending on what is happening:

- **Empty** — no template is selected. This is the initial state at `/editor`.
- **Loading** — a template is being loaded. Shown while the dynamic import is in flight.
- **Invalid** — the template definition failed runtime validation. The template cannot be edited.
- **Load error** — the template could not be loaded, such as a failed dynamic import.
- **Not found** — the URL does not match any template slug. This is a visual 404 within the editor, not an HTTP 404.

---

[Español](../../es/guides/studio.md)
