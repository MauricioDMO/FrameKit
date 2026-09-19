---
title: Troubleshoot templates and assets
description: Diagnose template discovery, definition, and image-asset problems.
sidebar:
  order: 3
---

## No templates are found

**Symptom:** Generation reports that no templates were found, or Studio has an empty template catalog.

**Probable cause:** `src/templates/` is missing, empty, or contains no directory with a `template.tsx` file.

**Check:** Confirm that `src/templates/` exists and contains at least one template directory with a default-exporting `template.tsx`.

**Fix:** Add a valid template under `src/templates/`, then run:

```bash
pnpm framekit check
pnpm framekit generate
```

See [Create your first template](/en/users/getting-started/first-template) and the [template reference](/en/users/reference/template).

## Generation reports an invalid path segment

**Symptom:** Generation reports an invalid template or brand directory segment.

**Probable cause:** A reachable directory name is not lowercase kebab-case. Valid segments contain lowercase letters, numbers, and single hyphens between them. Directories beginning with `.` or `_` are ignored.

**Check:** Inspect every reachable directory under `src/templates/` or `src/brand/`.

**Fix:** Rename the offending directory, for example `Hero-Section` to `hero-section`, and run `pnpm framekit generate` again.

## Template validation fails

**Symptom:** `pnpm framekit check` or `pnpm framekit build` reports a template definition or content error.

**Probable cause:** The definition, field values, variant keys, or resolved content does not satisfy the template contract.

**Check:** Run `pnpm framekit check` and use the reported template path and rule to identify the invalid value.

**Fix:** Correct the source definition or content variant, then run `pnpm framekit check` followed by `pnpm framekit generate` when the discovered files changed. Use [Template fields](/en/users/concepts/templates/fields) and [Content and variants](/en/users/concepts/templates/content-and-variants).

## A template asset is missing or unchanged

**Symptom:** An image field cannot display an asset, or Studio still shows an earlier file.

**Probable cause:** The file is outside the discovered asset directories, has an unsupported filename or extension, is nested in a subdirectory, or generated output was not refreshed.

**Check:** Keep shared files in `assets/common` and variant files in `assets/<variant>`. Asset filenames must start with a letter or number and may contain letters, numbers, `.`, `_`, or `-`; supported discovered image extensions are `.avif`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, and `.webp`.

**Fix:** Move or rename the source file, then run:

```bash
pnpm framekit generate
```

Do not edit `src/generated/framekit/` or `public/framekit/`. See [Use image assets](/en/users/guides/use-image-assets).

## An asset directory reports duplicates or subfolders

**Symptom:** Generation reports duplicate assets or says that assets cannot have subfolders.

**Probable cause:** Two image files in one asset directory have the same filename stem, or an asset was placed in a nested directory.

**Check:** Compare filenames after removing their extensions and list the contents of each `common` or variant directory.

**Fix:** Keep one file per asset key directly inside `assets/common` or `assets/<variant>`, rename duplicate stems, and run `pnpm framekit generate` again.
