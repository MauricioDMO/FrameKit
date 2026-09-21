---
title: FrameKit Studio
description: Understand Studio's routes, navigation shell, editor state, persistence, and export flow.
sidebar:
  order: 4
---

FrameKit Studio is the browser interface for browsing generated templates and brand components, editing template data, previewing the result, and producing PNG output. It consumes the generated template and brand manifests; it does not replace the source definitions under `src/templates/` or `src/brand/`.

## Access boundary

Studio has two access modes controlled only by `FRAMEKIT_AUTH_ENABLED`:

- In open mode, when the variable is missing or `false`, `/editor` and `/brand`
  render without a session, `/login` redirects to `/editor`, and `/settings`
  returns not found. The access API is absent and image rendering is
  credential-free.
- When the variable is `true`, `/login` is the public entry point. A successful
  login creates the `framekit_session` session used by Studio, and the Studio
  sections require a valid session before the client is rendered:

- `/editor` and `/editor/<template-slug>` for templates;
- `/brand` and `/brand/<brand-slug>` for brand component previews; and
- `/settings` for account and access settings.

In authenticated mode, an unauthenticated request to a protected section
redirects to `/login`, and a valid session visiting `/login` redirects to
`/editor`. Any unknown section is a 404 rather than a Studio state.

The generated project's root URL redirects to `/editor`. See [create a project](/en/users/getting-started/create-project) or [integrate an existing project](/en/users/getting-started/existing-project) for the route and root-layout setup.

## Navigation shell

The shell surrounds the available Studio sections. Its sidebar provides:

- a Templates tab linking to `/editor`;
- a Brand tab linking to `/brand`;
- nested folders and links built from the generated manifests;
- a collapse and expand control; and
- an appearance menu for interface language, theme, and `/settings` when auth is enabled.

Template and brand entries use their manifest segments as folders and are sorted by their visible title. The selected entry remains visible when its folders are collapsed. If a new source entry is not visible, regenerate the project before editing generated output. See [project structure](/en/users/getting-started/project-structure) for the generated files.

## Templates and brand components

The Templates section loads a validated template definition and opens the editor. A template owns its fixed canvas, fields, content, variants, assets, and `render` function. The editor therefore has editable controls, a fixed-size canvas preview, reset behavior, and PNG actions.

The Brand section loads a brand preview and its catalog description. It is a read-only catalog view: it shows the reusable component preview and source guidance, but it does not expose template fields, variants, reset, or export actions. Brand components remain project source that templates can consume. See [brand components](/en/users/concepts/brand-components) for their discovery contract.

## Variants and interface language

These are separate concepts:

- A template variant is a template-owned key in `content`. The variant selector changes the content and the `variant` value supplied to `render`. `variants.labels` changes the text shown in that selector.
- Interface language changes Studio's own labels and messages. The current interface languages are English and Spanish. The initial value comes from the `locale` cookie or `Accept-Language`, and an unsupported language falls back to Spanish.

Variant keys such as `en` or `es` are not language metadata by themselves. They are ordinary template keys unless the template's render logic gives them meaning. See [content and variants](/en/users/concepts/templates/content-and-variants) for the template-side resolution rules.

## Theme

Use the appearance menu to switch between light and dark themes. Studio applies the `dark` document class immediately and stores the choice in the `theme` cookie. With no saved choice, the initial theme follows the browser's preferred color scheme.

Changing the interface language updates Studio messages, the document language, and the `locale` cookie. It does not change the selected template variant.

## Editor states

Studio loads templates and brand previews lazily from their generated manifests. The visible state depends on the route and the load result:

| State | Meaning |
| --- | --- |
| Empty | `/editor` or `/brand` has no selected entry yet. |
| Loading | The selected template or brand preview is being loaded. |
| Ready | The template editor or brand catalog can render. |
| Not found | The slug is not present in the corresponding generated manifest. |
| Invalid | A template definition fails validation or no longer matches its registry dimensions. |
| Load error | The selected module failed to load. |

Inside the editor, invalid field data appears beside its field. The editor also shows a data error when resolved template data cannot be produced. During download or copy, the editor enters a generating state, disables the export action, and restores it when the request finishes.

## Fields

The editor creates controls from the loaded definition's `fields` record. The current field kinds map to these controls:

- `text`: a multiline text area;
- `number`: a native number input or range slider;
- `boolean`: a switch;
- `choice`: a select with the declared options;
- `color`: a color picker and hexadecimal text input; and
- `image`: an image preview, with a development upload control when uploads are available.

The definition owns labels, defaults, options, and validation constraints. The editor keeps values in their declared runtime types and reports validation errors instead of coercing invalid values. See [template fields](/en/users/concepts/templates/fields) for the authoring contract.

## Local persistence and reset

Studio stores the selected variant and user edits in browser `localStorage` under `framekit:<slug>:v2`. The template slug isolates one template from another, and the stored data for each variant keeps one variant separate from another. These edits survive a page reload. The navigation folder open/closed state is persisted separately.

This is browser-local editor state, not a change to the template source or a shared project record. Studio reads and writes the `v2` key only; it has no migration or compatibility behavior for `v1` data. Stored data is treated as untrusted: malformed records are ignored, and unknown variants, fields, or invalid runtime values are skipped safely. Editing continues in memory if local storage cannot be read or written.

Incomplete or invalid number drafts stay local to the number control. They do not replace the last confirmed numeric value and are not used for the local preview, PNG export, or committed persistence.

The reset button beside the variant selector removes user edits for the active variant. It then resolves that variant from its field defaults and content again. It does not reset other variants or change which variant is selected.

## Preview and zoom

The template preview starts fitted to its available area and recalculates that fit when the container changes size. Its controls provide:

- `100%` for the actual canvas size;
- `Fit to view` for a centered responsive fit;
- `Ctrl` plus the mouse wheel for pointer-centered zoom; and
- pointer dragging to pan the canvas.

Custom zoom is bounded between 10% and 400%. The brand catalog has its own scrollable preview and does not use the template editor's field canvas controls.

## Image uploads in development

Image uploads are enabled by the FrameKit development server for image fields. The upload control sends `POST /framekit/assets`, an endpoint exclusive to that server and available only while `pnpm framekit dev` is running or its generated-project equivalent `pnpm dev` is running. It is not available from an arbitrary `pnpm dev` or `next dev` command that does not run FrameKit. The upload control is not rendered by the editor in production. Select a PNG, JPEG, WebP, or GIF file from an image field.

The field scope determines the destination: a `variant` field uses the selected variant directory, while a `common` field uses `assets/common`. The development server validates the image, accepts files up to 8 MB, replaces the matching field asset, regenerates the manifest, and reloads Studio. Uploads require a same-origin request; open mode needs no session, while authenticated mode requires a valid same-origin Studio session. See [use image assets](/en/users/guides/use-image-assets) for the source layout and scope rules.

## Server-backed PNG output

The browser preview is local. Download PNG and Copy PNG are server-backed and use `POST /api/framekit/images/render`; in open mode the request is credential-free, while authenticated mode uses the same-origin session. In either mode, the server renderer resolves the definition and assets, validates the data, and returns a PNG rather than using the browser preview as the export source.

Download saves the returned image as a PNG file. Copy writes the returned `image/png` data to the browser clipboard and requires image clipboard support. If validation fails, Studio marks the affected fields and focuses the first one; if rendering or clipboard support fails, it shows the localized export error state.

For the complete definition, field, content, and asset contracts, continue to the [template reference](/en/users/reference/template).
