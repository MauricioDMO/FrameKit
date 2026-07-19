# FrameKit Studio Troubleshooting

## Catalog Is Empty Or `framekit generate` Finds Nothing

1. Ensure `src/templates` exists and contains at least one template directory with `template.tsx`.
2. Use lowercase kebab-case for every directory segment: `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Rename `Hero-Section` to `hero-section`, for example.
3. Rename directories beginning with `_` or `.`; they are ignored.
4. A directory without `template.tsx` is treated as a category and only contributes templates found deeper inside it.
5. Run `framekit generate` after correcting the directory structure.

## Generated Registry Cannot Be Resolved

Add this TypeScript alias, then generate the registry:

```json
{
  "compilerOptions": {
    "paths": {
      "@framekit/*": [".framekit/*"]
    }
  }
}
```

`@framekit/generated/templates` resolves to `.framekit/generated/templates.ts`.

## Studio Is Unstyled

Import the package stylesheet in the layout or global CSS:

```ts
import '@mauriciodmo/framekit/styles.css'
```

## Development Server Problems

- If port 3000 is occupied, select an available port: `PORT=3001 framekit dev`.
- `PORT` must be an integer from 1 through 65535. Set the bind address with `FRAMEKIT_HOST` or `HOST`, for example `FRAMEKIT_HOST=0.0.0.0 PORT=3000 framekit dev`.
- Existing `template.tsx` edits use Next HMR. Registry generation is only for adding/removing template files or directories. If a structural change is missed, restart `framekit dev`.
- On Windows, use the shell's environment syntax rather than `VAR=value command`: in cmd.exe, `set PORT=3001 && pnpm dev`; in PowerShell, `$env:PORT="3001"; pnpm dev`.

## Validation, Build, And Start Failures

- Run `framekit check` to report definition and resolved-data errors by template, locale, and field. It checks positive integer dimensions, required content, number bounds, valid URLs, and related definition rules, but does not render templates or test PNG export.
- `framekit build` runs `framekit check` first. Fix check errors before building.
- Run `framekit build` before `framekit start` so the production standalone server exists.

## PNG Export Is Blank, Wrong, Or Fails

- Fix invalid data first: required fields, URLs, and number bounds block export.
- Ensure web fonts load successfully; fallback fonts may appear if lazy-loaded or failed fonts are unavailable at capture time.
- Serve cross-origin images with suitable CORS headers so the browser can include them in the screenshot.
- Export requires browser DOM and canvas capabilities; limited headless environments may not support it.
- Export is PNG only, at the declared dimensions and scale 1.

## Installation Fails

Native dependencies may need a local build toolchain when a prebuilt binary is unavailable. Install Python, make, and a C++ compiler, then retry. Avoid using `pnpm install --ignore-scripts` as a general fix because native packages may miss required postinstall artifacts.
