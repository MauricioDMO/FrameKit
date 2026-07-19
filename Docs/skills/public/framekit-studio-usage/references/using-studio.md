# Using FrameKit Studio

## Catalog And Templates

- Studio is a browser-based editor for template content, preview, and PNG export.
- Sidebar folders come from slash-separated template slugs. For example, `social/instagram/post` becomes nested `Social` and `Instagram` folders with a `Post` template.
- Items in a folder are alphabetized by title. Folders are initially expanded and can be collapsed.
- Selecting a template opens `/editor/<slug>`.

## Languages And Edits

- **Design language** selects the template content locale. Template locale keys may be any string. Each locale has separate field values; changing the design language clears displayed validation errors.
- **App language** changes Studio labels and messages. It supports English (`en`) and Spanish (`es`) only. The saved `locale` cookie takes precedence over `Accept-Language`; an English-prefixed header selects English, otherwise Spanish is the fallback.
- Edits are browser-local in `localStorage`, separately stored for each template slug and design locale. There is no sync, account, or collaboration feature.
- Invalid saved state is discarded. Saved fields or locales no longer present in a template are ignored.
- **Reset** clears only the current locale's edits for the selected template.

## Fields And Preview

- Field definitions determine whether Studio shows text, textarea, number, color, or URL input.
- Required fields are checked on export. Empty optional fields are valid.
- Numbers honor declared minimum and maximum values. URLs must be absolute `http://` or `https://` URLs, or root-relative paths beginning with `/`.
- The preview initially fits the available area without exceeding 100%; minimum zoom is 10%.
- Hold Ctrl while scrolling to zoom from 10% to 400%, centered on the pointer. Drag the preview to pan when zoomed beyond its edges.
- **Actual size** sets 100%. **Fit to view** refits the preview. Resize refitting happens only while fit-to-view is active.

## PNG Export And Theme

- Export validates resolved data first. The first invalid field receives focus and export stops.
- After validation, Studio waits for fonts, then captures a PNG at the template's declared dimensions and scale 1.
- The download name replaces `/` in the slug with `-`, such as `social-instagram-post.png`.
- PNG export is browser-only. It has no server rendering, alternate formats, scale controls, or DPI controls.
- The theme follows the saved `theme` cookie or the browser color-scheme preference. Change it from Settings; the preference persists in a one-year cookie.

## Studio States

- **Empty:** no template is selected at `/editor`.
- **Loading:** a template is loading.
- **Invalid:** the template definition failed runtime validation.
- **Load error:** the template could not load.
- **Not found:** the URL does not match a catalog slug; this is an editor view, not an HTTP 404.
