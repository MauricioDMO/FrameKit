---
title: Troubleshoot Studio
description: Diagnose Studio selection, loading, editing, upload, export, and responsive preview problems.
sidebar:
  order: 5
---

Use [Use Studio](/en/users/guides/use-studio) for the normal workflow and [FrameKit Studio](/en/users/concepts/studio) for the supported Studio surfaces.

## A template or brand is missing from the sidebar

**Symptom:** An expected template or brand does not appear in Studio.

**Probable cause:** The source was not discovered, generation failed, or the entry belongs to the other catalog.

**Check:** Confirm the source directory and run:

```bash
pnpm framekit check
pnpm framekit generate
```

**Fix:** Correct the source under `src/templates/` or `src/brand/`, then generate again. Do not edit generated manifests. See [Project structure](/en/users/getting-started/project-structure), [Generated registry](/en/users/troubleshooting/generated-registry), and the [brand catalog reference](/en/users/reference/brand-catalog).

## A selected entry is loading, not found, invalid, or unavailable

**Symptom:** A selected template or brand remains loading, shows not found, or shows a load or invalid-definition message.

**Probable cause:** The route slug does not match the generated entry, the module import fails, or a template no longer matches its generated dimensions or definition.

**Check:** Open the entry from the sidebar, inspect the development-server error, and run `pnpm framekit check` followed by `pnpm framekit generate`.

**Fix:** Use the exact generated entry, repair the reported source import or definition, regenerate, and reload Studio. Template routes and brand routes use separate catalogs.

## An edit is rejected or export returns to a field

**Symptom:** A field displays a validation message, or PNG export does not complete.

**Probable cause:** The value does not satisfy the field contract or the selected variant is no longer valid for the current definition.

**Check:** Verify required values, text lengths, number bounds and steps, choice values, booleans, colors, image values, and the selected variant. See [Template fields](/en/users/concepts/templates/fields) and [Content and variants](/en/users/concepts/templates/content-and-variants).

**Fix:** Correct the reported field, select a declared variant, and retry the export. If the source definition changed, run `pnpm framekit check` and `pnpm framekit generate` before reloading.

## A reset or reload restores an unexpected value

**Symptom:** A previous edit returns after reload, or a value disappears after a definition change.

**Probable cause:** Studio restores valid edits from browser-local storage for the template and selected variant; values that no longer match the current definition are discarded.

**Check:** Select the affected template and variant, then compare the restored value with the current template defaults and content.

**Fix:** Use the reset control for the active variant, then reload Studio. Reset changes only the active variant and does not edit `template.tsx`. If storage is unavailable or full, continue in memory and resolve the browser storage issue before expecting edits to survive a reload.

## Image upload is unavailable or fails

**Symptom:** The upload control is missing or an image upload reports an error.

**Probable cause:** The selected field is not an image field, the FrameKit development server is not running, the session is not valid, or the file is unsupported or larger than 8 MB.

**Check:** Start the FrameKit development server, confirm the user is signed in, and check the file type and size.

**Fix:** Run:

```bash
pnpm framekit dev
```

Use a PNG, JPEG, WebP, or GIF no larger than 8 MB. Fix the source asset or field scope and let Studio regenerate the project output. See [Use image assets](/en/users/guides/use-image-assets).

## PNG download or copy fails

**Symptom:** Download PNG or Copy PNG reports a failure.

**Probable cause:** Download needs valid data, an active session, and a working server-side renderer. Copy also needs browser support for writing `image/png` to the clipboard.

**Check:** Fix field validation messages, confirm the session is active, and try Download PNG. If download works but copy fails, check browser clipboard support.

**Fix:** Use Download PNG when clipboard support is unavailable. For server, browser, or image-input errors, follow [Troubleshoot image rendering](/en/users/troubleshooting/rendering).

## The preview is clipped on a narrow viewport

**Symptom:** The canvas is larger than the available viewport or no longer centered after resizing.

**Probable cause:** The preview is showing the declared canvas size or a stale custom zoom rather than fitting the current container.

**Check:** Look at the preview control and window size; the canvas dimensions do not change with the viewport.

**Fix:** Choose **Fit to view** after resizing. Use **100%** only when inspecting the actual canvas size. These controls affect the editor view, not the source definition or PNG dimensions.
