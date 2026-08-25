# Studio

Studio is the visual workspace for FrameKit. It lets you navigate a template catalog, edit content for any supported variant, preview results, and export final PNG images. It also provides a brand catalog for viewing reusable brand-component previews. Both flows run in the browser.

## Navigation

Studio has two top-level routes: `/editor` for editing templates and `/brand` for cataloging brand components. The sidebar switches between them; each route has its own navigation tree.

Templates are organized in a sidebar derived from their slug path. Each path segment becomes a folder level, so a slug like `social/instagram/post` creates a `Social` folder containing an `Instagram` subfolder with a `Post` template inside. Shared path prefixes produce shared folder hierarchies automatically.

Within each folder, items are sorted alphabetically by title. Folder names are humanized from their slug segments (e.g., `instagram-post` becomes "Instagram Post").

Selecting a template navigates to `/editor/<slug>`. Folders in the sidebar are collapsible and start expanded. The currently open template is marked with `aria-current="page"` for accessibility.

### Brand catalog

The `/brand` route uses the same slug-based sidebar structure. Selecting a brand component navigates to `/brand/<slug>`; for example, the current `communication/hero` component is available at `/brand/communication/hero`. The sidebar title and folders come from the generated brand metadata, and the navigation is separate from the template navigation.

At runtime, each generated brand entry carries a slug, title, path segments, description, and a loader for its preview. Studio uses the title and segments for navigation, and the title and description for the catalog. The title is derived from the final directory segment, while the description comes from the first prose paragraph in the component README. See the [Brand Components guide](./brand-components.md) and [Brand Catalog Reference](../reference/brand-catalog.md) for the authoring and discovery rules.

When a brand route has a matching slug, Studio calls that entry's loader. The generated loader imports `preview.tsx`; Studio takes its default export as the preview and renders it in the catalog. The catalog shows the generated title in its header, a `Brand` label, the preview in the preview area, the README description in a side panel, and a hint referring to `component.tsx`. A preview can import and render the reusable component, as the current `communication/hero/preview.tsx` does.

The brand catalog is for cataloging and visually checking previews, not for editing component code or props. It does not provide template fields, variant editing, template-definition validation, or the template PNG export flow. Templates that reuse a brand component are still edited and rendered through `/editor`, where the surrounding template owns its dimensions, fields, content, assets, and export behavior.

## Content Variant vs. Interface Language

Studio distinguishes between two separate language concerns:

**Content variant** (labeled "Content variant" in the UI) refers to which content entry of a template is being edited. Templates can define arbitrary variant keys — `en`, `es`, `fr`, or any string — and each variant holds its own set of field values. Switching the variant clears all currently displayed validation errors.

**Interface language** controls the language of Studio's own labels, buttons, and messages. It is limited to `en` (English) or `es` (Spanish). Changing it updates the React state, the `lang` attribute on the `<html>` element, and stores a one-year `locale` cookie.

Interface language is resolved in this order: the `locale` cookie → the `Accept-Language` header → if the header starts with `en` use English → otherwise fall back to Spanish.

## Field editing

Each field in a template renders according to its kind: text input, textarea, number input, color picker, or image preview/upload control. The specific input type is determined from the field definition.

Required fields are validated when you attempt to export. Optional fields pass validation when left empty.

Number fields respect `min` and `max` constraints defined in the template. Image fields can preview template assets or root-relative images served from `public/assets`.

## Persistence

All edits are stored in the browser's `localStorage` under the key `framekit:<slug>:v2`. Each template slug has its own isolated storage entry, and data is also isolated per content variant within that entry. The old `v1` entry is ignored rather than migrated.

Malformed stored state is discarded safely and the editor starts fresh. Stored edits for variants or fields that no longer exist are ignored. No server sync, no account, and no collaboration — everything stays in your browser.

## Reset

The Reset button removes edits only for the currently selected variant of the current template. It does not clear other variants or other templates.

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

- **Empty** — no item is selected. `/editor` asks you to select a template; `/brand` asks you to select a brand component. If the relevant catalog is empty, the sidebar shows its localized no-items message.
- **Loading** — the selected template or brand entry is being loaded while its dynamic loader is in flight. The brand flow uses a component-specific loading label.
- **Invalid** — only a template definition can enter this state: it failed runtime validation and cannot be edited. The brand preview is not passed through template-definition validation.
- **Load error** — an entry's loader rejected, such as after a failed dynamic import. Studio renders the resulting `String(error)` in a message state; the guide does not promise a localized error string for this case.
- **Not found** — the URL does not match an exact slug in the active catalog. Studio shows a localized visual 404 and a link back to `/editor` or `/brand`; this is not an HTTP 404.

---

[Español](../../es/guides/studio.md)
