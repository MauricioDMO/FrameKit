# Troubleshooting

Common problems and their solutions when developing with FrameKit.

---

## "No templates found" / empty catalog

FrameKit discovers templates by scanning the `src/templates` directory. If the catalog appears empty, several things may be at fault.

**Cause: `src/templates` is empty**

If the directory contains no template directories, `framekit generate` finds nothing to register. Add at least one template directory with a `template.tsx` file inside. If `src/templates` does not exist, generation instead fails with a filesystem `ENOENT` error; create the directory first.

**Cause: template directories not matching kebab-case**

Every directory inside `src/templates` must follow the pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$` — lowercase letters, numbers, and single hyphens between segments. A directory named `MyTemplate`, `my_template`, or `template.v1` causes `framekit generate` to fail with an invalid-segment error.

**Cause: directories starting with `_` or `.` are ignored**

FrameKit skips any directory whose name begins with `_` or `.`. These are treated as private or ignored paths. Rename the directory to remove the prefix.

**Cause: `template.tsx` file missing inside directory**

Each template directory must contain a `template.tsx` file. Directories without this file are treated as category folders and FrameKit descends into them looking for a `template.tsx` deeper down, but a directory with no `template.tsx` at any depth contributes nothing to the catalog.

**Fix: run `framekit generate`**

This regenerates `src/generated/framekit/templates.ts` from the current state of `src/templates`. Run it after fixing any of the issues above:

```
framekit generate
```

When no templates exist, the command exits with code `1` and prints the current path, for example:

```text
No se encontraron plantillas en: /path/to/project/src/templates
```

---

## Invalid path segment errors

**Cause: directory segment contains uppercase, underscores, or invalid characters**

When FrameKit traverses `src/templates`, each directory name must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. A segment like `Hero-Section`, `my_template`, or `Template1` does not match and throws an error at generation time.

**Fix: rename directory to lowercase kebab-case**

Rename the offending directory so every segment is lowercase and hyphenated. For example, `Hero-Section` becomes `hero-section`.

---

## Brand component discovery errors

Brand components are scanned recursively from `src/brand`. The scanner and the Studio catalog fail in different ways: missing required source files or invalid directory segments are scan-time errors, while a missing route or a preview import failure is a runtime/catalog issue. See the [brand catalog reference](../reference/brand-catalog.md) for the complete directory contract.

### Missing `preview.tsx` or `README.md`

**Cause: a brand leaf has `component.tsx` but is missing a required companion file**

When the scanner finds `component.tsx` in a directory, it treats that directory as a leaf and requires `preview.tsx` and `README.md` in the same directory. Generation fails with `Falta preview.tsx en: ...` or `Falta README.md en: ...`. This is a scanner error, not an empty Studio state.

**Fix: add the missing file beside `component.tsx`**

Add the required file under the same `src/brand/<segments>/` directory, then regenerate:

```
framekit generate
```

The scanner checks that these paths exist; preview execution is a separate runtime concern.

### Invalid lowercase-kebab path segment

**Cause: a reachable directory under `src/brand` has an invalid name**

Every non-ignored directory segment must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Uppercase letters, underscores, repeated hyphens, and other characters cause generation to fail with an invalid-segment error. Directories beginning with `.` or `_` are skipped instead.

**Fix: rename the directory to lowercase kebab-case**

For example, rename `src/brand/Marketing/Hero` to `src/brand/marketing/hero`, then run `framekit generate`. This is a scanner error; Studio does not receive a new catalog until generation succeeds.

### `README.md` has no description

**Cause: no eligible text remains for the first README paragraph**

The scanner skips headings, fenced-code lines, and list-marker lines while looking for the first ordinary paragraph. It strips simple Markdown formatting and links from that paragraph. If no text remains, generation fails with `README sin descripción en: ...`; it does not fall back to the directory name or component title.

**Fix: add a non-empty ordinary paragraph to `README.md`**

Put a short prose description in the README, then run `framekit generate`. This requirement is checked during scanning, before the description is displayed in the brand catalog.

## Brand catalog is empty or stale

**Cause: `src/brand` is absent or contains no discovered leaf**

If `src/brand` does not exist, discovery returns an empty list. The same result occurs when no reachable brand directory contains `component.tsx` with its required files and the scan has no errors. When templates are present, generation can still write `src/generated/framekit/brands.ts` with no brand entries. If `src/templates` exists but has no templates, the shared generation operation fails before brand discovery with the existing `No se encontraron plantillas ...` error; if that directory is missing, the template scan reports the filesystem `ENOENT` error.

**Fix: add a complete brand leaf and regenerate**

Add a directory containing `component.tsx`, `preview.tsx`, and `README.md` under valid path segments, then run `framekit generate`. Do not edit `src/generated/framekit/brands.ts` by hand; it is generated output and the source of truth is `src/brand`. The generator writes the brand module alongside `templates.ts` only after discovery succeeds.

**Cause: a development generation failed after a brand change**

`framekit dev` performs one generation before starting Studio. After startup, its watcher schedules regeneration for any added, removed, or changed path under `src/brand`, including directory changes. Scanner errors are sent through the development server's error path, so a failed generation does not produce a refreshed catalog.

**Fix: correct the source error and regenerate**

Fix the reported file or directory, then run `framekit generate` to verify and refresh the generated module. Changes to generated files themselves are not watched; edit `src/brand` instead.

## Brand catalog route or preview errors

### `/brand` shows the empty state

This route has no selected slug and intentionally shows the brand empty state. If the supplied brand list is empty, Studio also shows the localized no-brands message in navigation. Check the generated `brands.ts` and the discovery issues above if a brand should be listed.

### `/brand/<slug>` shows not found

**Cause: no catalog entry has an exact slug match**

Studio joins the route segments with `/` and compares that value exactly with each brand entry's `slug`. A typo, a different path, or a catalog that has not been regenerated produces the brand 404 state. This is a runtime/catalog lookup result, not a scanner error.

**Fix: use the generated navigation slug or regenerate after changing source paths**

Open the entry from Studio navigation, or use the exact slash-separated path derived from the brand directories. If the source path changed, run `framekit generate` first.

### A listed brand fails while loading its preview

**Cause: the generated loader's dynamic import rejects**

Discovery only checks that `preview.tsx` exists. Studio loads that preview on demand and displays the loader's error string if its dynamic import rejects. This is a runtime error, separate from scanner validation.

**Fix: inspect `preview.tsx` and its imports**

Correct the failing preview module or one of its imports, then regenerate if the source path or metadata changed. The catalog renders the preview module's default export; it does not apply template-definition validation to brand entries.

---

## TypeScript cannot find `@framekit/generated/templates`

**Cause: tsconfig.json missing the `@framekit/generated/*` path alias**

The generated `templates.ts` lives at `src/generated/framekit/templates.ts`, but TypeScript does not know to resolve `@framekit/generated/templates` to that path without a path alias configured.

**Fix: add path alias to tsconfig.json**

Add the following to the `paths` field in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@framekit/generated/*": ["src/generated/framekit/*"]
    }
  }
}
```

---

## Missing FrameKit CSS / unstyled editor

**Cause: CSS not imported in layout**

FrameKit ships a stylesheet that must be included for the editor to render correctly.

**Fix: import the stylesheet**

Add the import to your layout file or `globals.css`:

```css
@import '@mauriciodmo/framekit/styles.css';
```

Or import it directly in your layout file:

```ts
import '@mauriciodmo/framekit/styles.css'
```

---

## `create-framekit` fails with "directory already exists"

**Cause: target directory already exists (even if empty)**

`create-framekit` refuses to overwrite an existing directory, even if that directory is empty. This is to prevent accidental data loss.

**Fix: use a completely new directory name**

Choose a directory name that does not already exist in the current location. `create-framekit` will create it fresh from the template.

---

## Installation fails in generated project

**Cause: native dependency installation failure**

Some dependencies (`sharp`, `esbuild`, `@parcel/watcher`) use native binaries. Package managers normally install a prebuilt binary, but may fall back to compilation when no compatible binary is available. If your system then lacks the required build toolchain (Python, make, a C++ compiler), the install step fails.

**Fix: ensure build tools are available and retry**

Install `python`, `make`, and a C++ toolchain (like `build-essential` on Debian/Ubuntu or the Visual Studio Build Tools on Windows), then retry the installation. Do not use `pnpm install --ignore-scripts` as a general fix: it can leave native dependencies without their required postinstall artifacts. Prefer fixing the toolchain and using the `allowBuilds` entries in the repository or generated project's `pnpm-workspace.yaml`. Only use script suppression for a deliberate diagnosis, then rebuild the affected packages and verify the project with `pnpm check` and `pnpm build`.

**Note:** `create-framekit` preserves the partially-created project directory for diagnosis even when installation fails.

---

## `framekit dev` port already in use

**Cause: another process occupying the port**

The default port is `3000`. If something else is already listening on that port, `framekit dev` exits with an error.

**Fix: set a different port**

Use the `PORT` environment variable to pick an available port:

```
PORT=3001 framekit dev
```

`PORT` must be an integer from 1 to 65535, but the selected port must also be available and permitted by the operating system. You can also control the binding address with `FRAMEKIT_HOST` or `HOST`:

```
FRAMEKIT_HOST=0.0.0.0 PORT=3000 framekit dev
```

---

## `framekit build` fails validation

**Cause: template definition errors**

`framekit build` runs `framekit check` before building. Validation catches structural problems in your template definitions, including:

- invalid dimensions (width or height not positive integers)
- missing required fields
- no content entries for a locale
- a field named `language` (this key is reserved)

The check produces per-template, per-locale, and per-field structured error output naming the exact file and rule that failed.

**Fix: run `framekit check` for detailed errors**

Run the check command directly to see all validation errors without running a full build:

```
framekit check
```

**Note:** `framekit check` does not verify that a template renders correctly or that PNG export works. It only checks the definition structure and data shape.

---

## `framekit start` fails to find server

**Cause: no production build exists**

`framekit start` needs the output of `framekit build`, which produces a standalone Node.js server inside `.framekit/next`. If you have not run `framekit build`, the server cannot start.

**Fix: run `framekit build` first**

```
framekit build
framekit start
```

**Cause: multiple `server.js` candidates found**

In nested monorepo structures, `framekit start` may find more than one `server.js` inside the standalone output directory. It resolves ambiguity by looking for a `BUILD_ID` file in a `.framekit/next` directory next to each `server.js`.

**Fix: ensure a single `next build` output**

`framekit build` copies static assets from `.framekit/next/static` to the standalone output. Run `framekit build` from a single Next.js build (not multiple), and avoid nested `.next` or `standalone` directories that could confuse the search.

**Note:** FrameKit identifies the correct server by searching for a `BUILD_ID` file at the expected location next to each `server.js` candidate.

The other production-start failure is reported with exit code `1` and the literal message `No existe una build de producción. Ejecuta framekit build primero.` when `.framekit/next/standalone` is missing.

---

## PNG export fails or exports blank/wrong image

**Cause: data validation errors**

Export requires all template data to be valid. Empty required fields, invalid URLs, and numbers outside the declared range all cause validation failures that prevent export from producing a usable image.

**Cause: fonts not loaded yet**

`document.fonts.ready` is awaited before capture, but if your template lazy-loads fonts or uses web fonts that fail to load, the exported image may show fallback fonts instead of the intended ones.

**Cause: cross-origin images blocked by browser**

If the template uses images from a different origin and the server does not send appropriate CORS headers, the browser blocks the image from being included in the canvas screenshot.

**Cause: browser lacks required capabilities**

PNG export uses `modern-screenshot` (which relies on DOM and canvas). Some environments — such as headless browsers without full DOM support — cannot perform the capture.

**Note:** Export is entirely browser-side; there is no server-side rendering involved.

**Note:** This is an alpha feature. There are no format or scale options yet — PNG only, at the dimensions declared in the template definition, at scale 1.

---

## Generated file changes not reflected in dev

**Cause: editing existing template content relies on Next HMR, not registry regeneration**

Changes to the content inside an existing `template.tsx` file are picked up by Next.js Hot Module Replacement, not by the FrameKit watcher. The watcher only responds to structural changes.

**Cause: registry only regenerates for NEW/REMOVED `template.tsx` files or directories**

The watcher triggers registry regeneration when a `template.tsx` is added or removed, or when a directory is added or removed under `src/templates`. Editing the body of an existing `template.tsx` does not regenerate the catalog.

**Fix: restart `framekit dev` if structural changes do not trigger regeneration**

If you add or remove a template directory or `template.tsx` file and the catalog does not update, restart `framekit dev`.

---

## Windows: `pnpm dev` or `pnpm dlx` not working

**Cause: environment variable syntax differs**

POSIX shells use `VAR=value command` syntax for setting environment variables for a single command. Windows `cmd.exe` does not support this syntax natively.

**Fix: use Windows-compatible syntax**

In `cmd.exe`:

```
set VAR=value && pnpm dev
```

In PowerShell:

```
$env:VAR="value"; pnpm dev
```

Alternatively, set the variable permanently via `setx` or through the Windows Environment Variables UI.

**Note:** `create-framekit` selects `pnpm.cmd` on Windows, but the full Windows flow is not covered by CI or the current automated test suite.

---

[English](../../en/development/troubleshooting.md) | [Español](../../es/development/troubleshooting.md)
