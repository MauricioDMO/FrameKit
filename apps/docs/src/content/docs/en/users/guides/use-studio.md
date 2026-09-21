---
title: Use Studio
description: Start FrameKit Studio, edit a template or inspect a brand component, and export a PNG.
sidebar:
  order: 4
---

Use this guide after [creating a project](/en/users/getting-started/create-project) or [integrating an existing project](/en/users/getting-started/existing-project). It covers the normal Studio workflow; the [Studio concept page](/en/users/concepts/studio) explains the model behind each step.

## 1. Start Studio

From the project root, validate the current source and generated registry:

```bash
pnpm framekit check
```

Authentication is disabled by default. In open mode, `/editor` and `/brand` are
available without a session and `/login` redirects to `/editor`; no SQLite
database or administrator is initialized. To use login and Settings, set
`FRAMEKIT_AUTH_ENABLED=true`, then set `FRAMEKIT_ADMIN_PASSWORD` before the
first login. `FRAMEKIT_ADMIN_USERNAME` is optional and defaults to `admin`.
Keep bootstrap values in the runtime environment rather than source control.

Start the development server for your project setup. Generated projects configure `pnpm dev` to run `framekit dev`:

```bash
pnpm dev
```

For an integrated project, use the FrameKit development command unless the project's `dev` script is explicitly configured to run it:

```bash
pnpm framekit dev
```

Open `http://localhost:3000/editor`. In open mode, the root and editor work
without login and `/login` redirects to `/editor`. With
`FRAMEKIT_AUTH_ENABLED=true`, open `/login`; the login form creates the session
that protects `/editor`, `/brand`, and `/settings`.

## 2. Choose a Studio surface

Use the sidebar to choose:

- **Templates** (`/editor`) to browse generated template folders;
- **Brand** (`/brand`) to inspect reusable brand previews; or
- **Settings** (`/settings`) from the appearance menu when authentication is enabled.

Select a template or brand entry to open its slug route. Templates open the editor. Brand entries open a preview and description, not editable template controls.

If an entry is missing after changing source files, run:

```bash
pnpm framekit generate
```

The command refreshes the disposable template and brand manifests. Do not edit files under `src/generated/framekit/` or `public/framekit/`; fix the source and generate again.

## 3. Edit a template

On a template route:

1. Choose a value in the variant selector.
2. Edit the controls in the Content panel.
3. Watch the canvas update as values change.
4. Fix any field message before exporting.

The available controls come from the template definition. Text, number, boolean, choice, color, and image fields use their corresponding editor controls. See [template fields](/en/users/concepts/templates/fields) for the field rules instead of treating the editor as a separate schema.

The variant selector changes template content. The interface-language selector in the appearance menu changes Studio labels only; it does not select a variant. Template keys such as `en` and `es` are not automatically treated as languages.

## 4. Inspect the preview

The canvas initially fits its available area. Use the preview controls as needed:

- Choose `100%` to inspect the actual canvas size.
- Choose `Fit to view` to return to a centered responsive fit.
- Hold `Ctrl` while scrolling over the canvas to zoom around the pointer.
- Drag the canvas to pan after zooming.

The editor preview is local and is an editing aid. PNG output is server-backed through `POST /api/framekit/images/render` rather than rendered from the preview.

## 5. Restore a variant

Studio keeps the selected variant and edits for each template in browser-local storage. Reloading the page restores edits for that template and variant. Malformed stored records and values that no longer match the current fields or variants are discarded; normal field validation still applies to the restored data.

Click the reset icon beside the variant selector to remove edits for the active variant. Reset does not change the selected variant or remove edits from other variants. It also does not modify `template.tsx`.

## 6. Upload an image during development

Start the FrameKit development server and open a template with an image field:

```bash
pnpm framekit dev
```

In a generated project, `pnpm dev` is equivalent because its `dev` script runs `framekit dev`. The FrameKit development server handles uploads through `POST /framekit/assets`; that endpoint is available only while `pnpm framekit dev` or this generated-project equivalent is running. Do not assume that an arbitrary `pnpm dev` command or a plain `next dev` provides it. The upload control is shown for image fields only in development. Select a PNG, JPEG, WebP, or GIF up to 8 MB.

The field's scope controls where the asset is written:

- `variant` replaces the asset for the selected variant;
- `common` replaces the shared asset in `assets/common`.

Studio writes the source asset, regenerates the manifest, and reloads the page.
Uploads always require a same-origin request. In open mode that is the only
requirement; with `FRAMEKIT_AUTH_ENABLED=true`, an active same-origin Studio
session is also required. Production Studio does not expose this upload control.
See [use image assets](/en/users/guides/use-image-assets) before changing asset layout or field scope.

## 7. Download or copy a PNG

Use the export action in the editor header after the current data is valid:

1. Select **Download PNG** to save the rendered image.
2. Open the same action's secondary option and select **Copy PNG** to place the rendered image on the clipboard.

Both actions use the server-backed `POST /api/framekit/images/render` renderer and the current template, variant, edits, and discovered assets. In open mode the image request is credential-free; with authentication enabled it uses the same-origin session. The browser preview remains local. While rendering, the action is disabled and shows its generating state. Server validation errors return to the relevant field instead of producing an invalid image.

Copy requires browser support for writing `image/png` data to the clipboard. If that support is unavailable, Studio reports the copy failure rather than silently claiming success.

For the source-side contracts behind fields, variants, and assets, see [content and variants](/en/users/concepts/templates/content-and-variants), [use image assets](/en/users/guides/use-image-assets), and the [template reference](/en/users/reference/template).
