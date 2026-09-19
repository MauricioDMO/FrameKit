---
title: Troubleshoot Studio
description: Diagnose Studio selection, loading, editing, upload, export, and responsive preview problems.
sidebar:
  order: 2
---

Use [Use Studio](/en/users/guides/use-studio) for the normal workflow and [FrameKit Studio](/en/users/concepts/studio) for the model behind its routes and states. This page focuses on symptoms and recovery steps rather than repeating the template contract.

## Check the selected template or brand

Studio builds its sidebar from the generated template and brand manifests. Template slugs are resolved in the Templates section and brand slugs in the Brand section; an entry in one manifest is not searched in the other.

If an expected entry is missing, run the source check and regenerate from the project root:

```bash
pnpm framekit check
pnpm framekit generate
```

Fix the source under the project's template or brand directories, then regenerate again. Do not edit generated manifests or copied output. The [project structure](/en/users/getting-started/project-structure), [generated registry](/en/users/concepts/templates/generated-registry), and [brand catalog reference](/en/users/reference/brand-catalog) pages explain where discovery output comes from.

If a sidebar entry exists but its route fails, compare the route slug with the generated entry exactly. A template opens the editor; a brand opens a read-only catalog preview and does not provide template fields, reset, variants, or export actions.

## Interpret Studio states

The selected module is loaded lazily. Use the state to narrow the problem:

| State | Meaning | Next check |
| --- | --- | --- |
| Empty | `/editor` or `/brand` has no selected entry. | Choose an entry in the matching sidebar. |
| Loading | The selected template or brand preview is being loaded. | If it persists, check the FrameKit server and the latest generation output. |
| Not found | The slug is not in the manifest for the current section. | Check the section, slug, discovery source, and generated registry. |
| Invalid | A loaded template fails definition validation or no longer matches its registered dimensions. | Run `pnpm framekit check`, fix the template source, and regenerate. |
| Load error | The manifest entry exists, but its template or brand module could not load. | Check source imports and the server error, then regenerate after fixing the source. |
| Data error | The editor cannot resolve the selected variant and edits into template data. | Check the variant, content keys, field keys, and runtime value types; reset the active variant if needed. |

Definition and asset contracts are documented in [template fields](/en/users/concepts/templates/fields), [content and variants](/en/users/concepts/templates/content-and-variants), [template assets](/en/users/concepts/templates/assets), and the [template reference](/en/users/reference/template).

## Fields and validation

Controls come from the loaded template's `fields` record. A field message means the current value does not satisfy that field's declared type or constraints. Keep numbers as numbers, booleans as booleans, choices as declared option values, and colors in the supported hexadecimal form instead of relying on coercion. See [template fields](/en/users/concepts/templates/fields) for the complete field rules.

Studio validates the resolved data before PNG generation as well as while editing. If export returns to a field, fix that field first; Studio marks the error and focuses the first invalid field. A data error is different from a field validation message: it means data could not be resolved at all, usually because the selected variant or stored edit no longer matches the definition.

## Reset and local persistence

The selected variant and edits are stored in browser `localStorage` under `framekit:<slug>:v2`. The slug isolates each template, and the stored data keeps edits for different variants separate. This state is local to the browser; it does not modify `template.tsx` or create a shared project record. Studio does not migrate or provide compatibility for `v1` data.

If an old value keeps returning, select the affected variant and use its reset control. Reset removes edits only for that active variant, then resolves its defaults and content again. It does not reset other variants or change the selected variant.

Malformed stored data, removed variants, unknown fields, and values with the wrong runtime type are ignored safely. If browser storage is unavailable or full, Studio continues in memory and the edits may not survive a reload. Incomplete or invalid number drafts remain local to the number control: they do not replace the last confirmed numeric value and are not used for the local preview, PNG export, or committed persistence. After changing a definition, regenerate the project and reload so the manifest and definition agree.

## Upload an image in development

The editor's upload control sends `POST /framekit/assets`. It is provided exclusively by the FrameKit development server and is available only during `pnpm framekit dev` or the equivalent generated-project `pnpm dev`, so start the project with:

```bash
pnpm framekit dev
```

In a generated project, `pnpm dev` is equivalent only when its script runs `framekit dev`. A plain Next.js development command does not provide this upload route. The control is shown only for image fields in development, and a signed-in same-origin session is required.

If the control is absent or an upload fails, check that the field is an image field, the FrameKit server is running, and the file is a supported PNG, JPEG, WebP, or GIF no larger than 8 MB. Studio returns an upload error to the affected image field. The field scope determines whether the matching asset is written for the selected variant or for `common`. See [use image assets](/en/users/guides/use-image-assets) before changing field scope or asset names.

Successful uploads update the source asset, regenerate discovery output, and reload Studio. Treat generated files as output; fix the source asset or template instead of editing the manifest by hand.

## Export PNG or copy it

**Download PNG** and **Copy PNG** use the authenticated, server-backed `POST /api/framekit/images/render` renderer with the current template, variant, and data. The browser preview is local, is not the export source, and its zoom level does not change the PNG dimensions.

If Download PNG fails, fix any field validation message and check that the session and FrameKit server are still available. If Copy PNG fails while Download PNG works, the browser may not support writing `image/png` data to the clipboard. When needed, Copy PNG waits to recover document focus before writing to the clipboard. Export and copy success or failure feedback is announced through accessible toasts, while validation errors return to the affected field; Studio does not claim that a failed copy succeeded. Use Download PNG when image clipboard support is unavailable.

## Use the preview on a narrow viewport

The editor places its controls and preview in a responsive layout. The canvas keeps the template's declared dimensions, while the preview scales to the available container when **Fit to view** is active. Resize the window or rotate the device, then use **Fit to view** again if the artwork is clipped.

- **100%** shows the canvas at its actual size and may be larger than a narrow viewport.
- **Fit to view** centers the canvas and recalculates its scale as the container changes.
- Hold `Ctrl` while using the mouse wheel to zoom around the pointer.
- Drag the canvas to pan after custom zooming.

These controls affect only the editing view. They do not change the source definition or the PNG export.
