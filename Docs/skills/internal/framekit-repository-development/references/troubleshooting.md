# Troubleshooting

## Templates And Generated Registry

- An empty catalog means `src/templates` has no discovered `template.tsx`; create `src/templates` if it is absent, add at least one template, then run `framekit generate`.
- Every template directory segment must be lowercase kebab-case: `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Dot- and underscore-prefixed directories are ignored.
- A directory without `template.tsx` is treated as a category; it contributes nothing unless a nested template exists.
- If TypeScript cannot resolve `@framekit/generated/templates`, configure `"@framekit/*": [".framekit/*"]` in `compilerOptions.paths`.
- Existing `template.tsx` content is handled by Next HMR. Registry regeneration is for added or removed template files or directories; restart `framekit dev` if such structural changes do not update the catalog.

## Build And Runtime

- Import `@mauriciodmo/framekit/styles.css` in the layout or `globals.css` when the editor is unstyled.
- `framekit build` runs `framekit check`; run `framekit check` directly for structural definition errors. It does not validate rendering or PNG export.
- Run `framekit build` before `framekit start`. Avoid nested or multiple Next standalone outputs when server discovery is ambiguous.
- For an occupied default port, use `PORT=3001 framekit dev`. `PORT` must be an available integer from 1 through 65535; use `FRAMEKIT_HOST` or `HOST` to control binding.

## Installation And Platform

- `create-framekit` requires a target directory that does not already exist, including an empty directory.
- If generated-project installation fails for native dependencies, install Python, make, and a C++ toolchain, then retry. Do not use `pnpm install --ignore-scripts` as a general remedy; use `allowBuilds`, then verify with `pnpm check` and `pnpm build`.
- In Windows `cmd.exe`, use `set VAR=value && pnpm dev`; in PowerShell, use `$env:VAR="value"; pnpm dev`.

## PNG Export

Confirm template data is valid, intended fonts load, cross-origin images permit canvas capture, and the browser supports DOM/canvas capture. Export is browser-side, PNG-only, scale 1, and uses the template's declared dimensions.
