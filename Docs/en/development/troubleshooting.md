# Troubleshooting

Common problems and their solutions when developing with FrameKit.

---

## "No templates found" / empty catalog

FrameKit discovers templates by scanning the `src/templates` directory. If the catalog appears empty, several things may be at fault.

**Cause: `src/templates` is empty**

If the directory contains no template directories, `framekit generate` finds nothing to register. Add at least one template directory with a `template.tsx` file inside. If `src/templates` does not exist, generation instead fails with a filesystem `ENOENT` error; create the directory first.

**Cause: reachable template path segments not matching kebab-case**

Every reachable directory inside `src/templates` must follow the pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$` — lowercase letters, numbers, and single hyphens between segments. A directory named `MyTemplate`, `my_template`, or `template.v1` causes `framekit generate` to fail with an invalid-segment error.

**Cause: directories starting with `_` or `.` are ignored**

FrameKit skips any directory whose name begins with `_` or `.`. These are treated as private or ignored paths. Rename the directory to remove the prefix.

**Cause: `template.tsx` file missing inside directory**

Each template leaf directory must contain a `template.tsx` file. A directory without this file is treated as a category folder and FrameKit descends into it looking for a `template.tsx` deeper down; a directory with no `template.tsx` at any depth contributes nothing to the catalog.

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

Discovery only checks that `preview.tsx` exists. Studio loads that preview on demand; if the generated loader's dynamic import rejects, Studio suppresses the raw error and renders the localized brand load-error message instead. This is a runtime error, separate from scanner validation.

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

**Cause: another process occupying the requested port**

The default port is `3000`. If something else is already listening on the requested port, `framekit dev` tries the next port. It exits with an error if no usable port is found before `65535`.

**Fix: set a different port**

Use the `PORT` environment variable to choose the first port FrameKit tries:

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

- invalid dimensions (width or height not positive finite integers)
- a missing or malformed `meta`, `fields`, `variants`, or `content` object
- unknown top-level, metadata, variant, or content properties
- invalid field kinds or field-specific properties and constraints
- invalid choice options or defaults, number defaults/bounds/steps, or text length limits
- a default variant or variant label that is not declared in `content`
- a field named `language` (this key is reserved)
- content values with the wrong type or invalid number constraints
- a missing or non-function `render`

Definition errors identify the affected `template.tsx` and rule. Resolved-data errors identify the template, variant, and field that failed.

The resolved-data pass also reports empty required values, invalid colors or choices, non-boolean values, text outside its length limits, and invalid number values (including bounds or step violations).

**Fix: run `framekit check` for detailed errors**

Run the check command directly to see validation errors without running a full build:

```
framekit check
```

**Note:** `framekit check` does not verify that a template renders correctly or that PNG export works. It only checks the definition structure and resolved data shape.

---

## Studio edits disappear or show an old value

Studio stores editor overrides in browser `localStorage` under the exact key `framekit:<slug>:v2`, grouped by content variant. It reads only this `v2` key; `v1` state is not read or migrated, and no `v1` compatibility is promised.

**Cause: persisted state is stale or malformed**

When loading a session, Studio ignores unknown variants and fields, invalid number values (including non-finite, out-of-bounds, or step-mismatched values), and choice values that are not in the current options. Valid sibling overrides are preserved. Invalid JSON, a non-object payload, or an invalid persisted `selectedVariant` causes Studio to start from the current definition's defaults. Storage errors are ignored so editing can continue in memory.

**Fix: inspect or clear the current `v2` entry**

Check the browser's storage for `framekit:<slug>:v2`, or remove that exact key and reload to reset the session. The Reset button removes overrides only for the selected variant; switching variants does not remove overrides belonging to other variants.

**Note:** an incomplete or invalid number draft remains local to its input and is not committed to editor state, preview data, or persistence. Correct the value or switch/reset the variant.

---

## Repository verification gates

The permanent repository gates are versionless: they do not select a release version. Ubuntu runs the full checks on Node.js `22.13.0` and `24` with pnpm `11.14.0`, including `pnpm check:runtime`, lint, tests, type-checking, builds, and package dry-run checks. Windows runs focused generated-consumer checks on Node.js `22.13.0`: discovery/codegen tests, creator tests, type-checking, packaging, `framekit generate`, and `framekit check`. Ubuntu also runs one Chromium Studio critical path on Node.js `22.13.0` with `pnpm test:e2e`.

These gates do not replace release verification. Real tarball and npm registry smokes use package versions supplied during release preparation; no release version is encoded in the repository gates.

---

## `framekit start` fails to find server

**Cause: no production build exists**

`framekit start` needs the output of `framekit build`, which produces a standalone Node.js server inside `.framekit/next`. If you have not run `framekit build`, the server cannot start. Unlike `dev`, `check`, and `build`, `start` does not regenerate or validate templates; it only locates and launches the existing standalone server.

**Fix: run `framekit build` first**

```
framekit build
framekit start
```

**Cause: multiple `server.js` candidates found**

In nested monorepo structures, `framekit start` may find more than one `server.js` inside the standalone output directory. It resolves ambiguity by looking for a `BUILD_ID` file in a `.framekit/next` directory next to each `server.js`.

**Fix: ensure a single matching standalone output**

`framekit build` copies static assets from `.framekit/next/static` to the standalone output. Run `framekit build` from a single Next.js build (not multiple), and avoid nested standalone outputs containing another `server.js` with an adjacent `.framekit/next/BUILD_ID`, which could create multiple matching candidates.

**Note:** FrameKit identifies the correct server by searching for a `BUILD_ID` file at the expected location next to each `server.js` candidate.

The other production-start failure is reported with exit code `1` and the literal message `No existe una build de producción. Ejecuta framekit build primero.` when `.framekit/next/standalone` is missing.

---

## PNG export fails or exports blank/wrong image

**Cause: data validation errors**

Export requires all template data to be valid. Empty required fields, invalid colors or choices, non-boolean values, text outside its declared length limits, and numbers outside their declared finite range or step cause validation failures that prevent export from producing a usable image.

**Cause: fonts not loaded yet**

`document.fonts.ready` is awaited before capture, but if your template lazy-loads fonts or uses web fonts that fail to load, the exported image may show fallback fonts instead of the intended ones.

**Cause: cross-origin images blocked by browser**

If the template uses images from a different origin and the server does not send appropriate CORS headers, the browser blocks the image from being included in the canvas screenshot.

**Cause: browser lacks required capabilities**

PNG export uses `modern-screenshot` (which relies on DOM and canvas). Some environments — such as headless browsers without full DOM support — cannot perform the capture.

**Note:** Export is entirely browser-side; there is no server-side rendering involved.

**Note:** The current export supports no format or scale options — PNG only, at the dimensions declared in the template definition, at scale 1.

---

## Template changes not reflected in dev

**Cause: generation or HMR did not complete**

The watcher observes every file and directory under `src/templates`. Additions, edits, and deletions trigger registry regeneration; Next.js Hot Module Replacement can also update an already loaded template preview. If a change is not reflected, inspect the `framekit dev` terminal for a generation or HMR error.

**Fix: regenerate or restart `framekit dev`**

Run `framekit generate` to refresh the registry manually. If the development server still does not reflect a source change, restart `framekit dev`.

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

**Note:** `create-framekit` selects `pnpm.cmd` on Windows. CI covers a focused Windows generated-consumer path (discovery/codegen, creator, type-checking, packaging, `generate`, and `check`), not the full production or browser flow.

---

[English](../../en/development/troubleshooting.md) | [Español](../../es/development/troubleshooting.md)
