# Studio

Studio is the visual workspace for FrameKit. It lets you navigate a template catalog, edit content for any supported variant, preview results, and export final PNG images. It also provides a brand catalog for viewing reusable brand-component previews. Both flows run in the browser. For templates, Studio consumes the generated `TemplateRegistryEntry`; its validated metadata and lazy loader are the catalog contract.

## Navigation

Studio has two top-level routes: `/editor` for editing templates and `/brand` for cataloging brand components. The sidebar switches between them; each route has its own navigation tree.

Templates are organized in a compact sidebar derived from each registry entry's `segments`. Each non-final path segment becomes a folder level and the final segment becomes the template item, so a slug like `social/instagram/post` creates a `Social` folder containing an `Instagram` subfolder with a `Post` template inside. Shared path prefixes produce shared folder hierarchies automatically.

Within each folder, items are sorted alphabetically by title. Folder names are humanized from their slug segments (e.g., `instagram-post` becomes "Instagram Post").

Selecting a template navigates to `/editor/<slug>`. Navigation uses `entry.meta.title` for the template item and the selected editor heading; Studio never derives either display title from the slug. Folders are compact, collapsible, and start expanded. Their expansion state is persisted in the browser. Folder-only vertical scope lines appear beside expanded folder child groups, not beside template links. Route tabs use Tabler `IconStack2` for Templates and `IconTag` for Brand. The selected route/template and keyboard focus remain accessible through `aria-current="page"`, `aria-expanded`, and visible focus styles. This tree is navigation only; it has no search or filter behavior.

### Brand catalog

The `/brand` route uses the same slug-based sidebar structure. Selecting a brand component navigates to `/brand/<slug>`; for example, the current `communication/hero` component is available at `/brand/communication/hero`. The sidebar title and folders come from the generated brand metadata, and the navigation is separate from the template navigation.

At runtime, each generated brand entry carries a slug, title, path segments, description, and a loader for its preview. Studio uses the title and segments for navigation, and the title and description for the catalog. The title is derived from the final directory segment, while the description comes from the first prose paragraph in the component README. See the [Brand Components guide](./brand-components.md) and [Brand Catalog Reference](../reference/brand-catalog.md) for the authoring and discovery rules.

When a brand route has a matching slug, Studio calls that entry's loader. The generated loader imports `preview.tsx`; Studio takes its default export as the preview and renders it in the catalog. The catalog shows the generated title in its header, a `Brand` label, the preview in the preview area, the README description in a side panel, and a hint referring to `component.tsx`. A preview can import and render the reusable component, as the current `communication/hero/preview.tsx` does.

The brand catalog is for cataloging and visually checking previews, not for editing component code or props. It does not provide template fields, variant editing, template-definition validation, or the template PNG export flow. Templates that reuse a brand component are still edited and rendered through `/editor`, where the surrounding template owns its dimensions, fields, content, assets, and export behavior.

## Variant vs. Interface Language

Studio distinguishes between two separate language concerns:

**Variant** (labeled "Variant" in the UI) refers to which content entry of a template is being edited. For a new editor state, the initial selection is exactly `definition.variants.default`. Templates can define arbitrary variant keys — `en`, `es`, `fr`, or any string — and each variant holds its own set of field values. Options follow content-key order. When `variants.labels` is provided, an option is displayed as `definition.variants.labels?.[key] ?? key`; without a label, the key itself is shown. At resolution time, an unknown variant is an error and is never silently replaced by another variant; an invalid persisted selection is discarded and a fresh state uses the declared default. Switching the variant clears all currently displayed validation errors.

**Interface language** controls the language of Studio's own labels, buttons, and messages. It is limited to `en` (English) or `es` (Spanish). It is independent from template variants: changing it does not change the selected variant. Changing it updates the React state, the `lang` attribute on the `<html>` element, and stores a one-year `locale` cookie.

Interface language is resolved in this order: the `locale` cookie → the `Accept-Language` header → if the header starts with `en` use English → otherwise fall back to Spanish.

## Field editing

Each of the six field kinds has a fixed control selected from the field definition:

- `text` uses a multiline textarea and stores a string.
- `number` uses its declared native number input or range slider and stores a finite number.
- `choice` uses a native select and stores its declared string option.
- `boolean` uses a native checkbox and stores `true` or `false`.
- `color` uses the color picker and stores a string.
- `image` uses the project-asset preview/upload control and stores an asset source string when resolved.

Number input drafts are local to the number control. An incomplete draft, such as an empty value, does not enter committed editor data, so the preview continues to use the last committed numeric value. Preview and render consume only resolved, committed typed data; they do not use a global last-valid-preview cache.

Required fields are validated when you attempt to export or copy. Optional fields pass validation when left empty.

Number fields respect their declared `min`, `max`, and `step` constraints. Image fields can preview template assets or root-relative images served from `public/assets`; development Studio also provides the project upload path. Choice fields keep the declared option order and reject values outside the option set with `invalid_choice`; boolean fields reject string substitutes with `invalid_boolean`.

## Persistence

All edits are stored in the browser's `localStorage` under the exact key `framekit:<slug>:v2`. Each template slug has its own isolated storage entry, and data is also isolated per variant within that entry. Studio reads no `v1` state and performs no v1 migration.

Malformed stored JSON or a top-level stored value that is not an object, or a stored selected variant that is not valid for the definition, is discarded safely and the editor starts fresh. Stale or malformed variant entries, unknown fields, wrong-typed values, and invalid persisted number values are ignored. During a live definition refresh, state is rebased to the refreshed definition: recognized variants and fields with accepted runtime types are kept, stale data is removed, and the selected variant is preserved when valid or reset to `definition.variants.default` otherwise. Persistence is browser-local; it does not provide server sync, accounts, or collaboration.

## Reset

The Reset button removes edits only for the currently selected variant of the current template. It does not clear other variants or other templates.

## Preview and zoom

The preview area shows the template at its declared dimensions using resolved, committed data. On load, it scales to fit the available space, capped at 100% so the full template is always visible. The minimum scale is 10%.

Zoom is controlled by holding **Ctrl** and scrolling the mouse wheel. The zoom centers on the pointer position. The zoom range is 10% to 400%.

When zoomed in past the container edges, you can pan by dragging the preview area. The grab cursor indicates panning mode; during drag it switches to grabbing.

Two buttons sit in the lower-right corner of the preview: **Actual size** resets to 100% scale, and **Fit to view** refits the template to the container. Auto-refit on window resize only occurs while the preview is in fit-to-view mode; manual zoom positions are preserved on resize.

## PNG export

The Export and Copy PNG buttons validate the current resolved, committed data before doing anything else. If any field fails validation, localized field errors are shown, the first invalid field receives focus, and the action stops. After validation passes, export waits for fonts to finish loading via `document.fonts.ready`, then captures the template at exactly its declared `width×height` at scale 1 using `modern-screenshot`; Copy PNG places the captured PNG on the clipboard when supported.

Export then downloads a PNG file in the browser. The filename uses the template slug with `/` replaced by `-` (e.g., `social/instagram/post` becomes `social-instagram-post.png`). Copy PNG places the captured image on the clipboard instead of downloading it.

Export runs entirely in the browser. There is no server-side rendering, no format options, and no scale or DPI controls in the alpha release.

## Theme

Studio applies a dark or light theme. The initial theme is read from the `theme` cookie or, if absent, from the browser's `prefers-color-scheme` preference. A small inline script runs before React hydrates to apply the correct class to `<html>` and avoid a flash of the wrong theme.

The theme can be toggled through the Settings panel. The preference is stored in a one-year cookie so it persists across sessions.

## States

Studio displays different states depending on what is happening:

- **Empty** — no item is selected. `/editor` asks you to select a template; `/brand` asks you to select a brand component. If the relevant catalog is empty, the sidebar shows its localized no-items message.
- **Loading** — the selected template or brand entry is being loaded while its dynamic loader is in flight. The brand flow uses a component-specific loading label.
- **Invalid** — only a template definition can enter this state: it failed runtime validation and cannot be edited. The brand preview is not passed through template-definition validation.
- **Load error** — an entry's loader rejected, such as after a failed dynamic import. Raw loader errors are not exposed; Studio shows the localized template or brand load-error message.
- **Data error** — the loaded template's resolved data is invalid, for example because of an unknown variant or field key or a wrong typed value. Studio shows its localized data-error message.
- **Upload error** — a development image upload failed. The affected field receives the localized upload-error message.
- **Export error** — PNG capture or clipboard copying failed after validation. Studio reports the localized export alert; validation failures remain associated with their fields instead.
- **Not found** — the URL does not match an exact slug in the active catalog. Studio shows a localized visual 404 and a link back to `/editor` or `/brand`; this is not an HTTP 404.

---

[Español](../../es/guides/studio.md)
