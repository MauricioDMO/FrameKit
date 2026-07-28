# CLI And Installation Failures

## Template Discovery

- `src/templates` missing: create it; generation otherwise fails with `ENOENT`.
- Empty catalog: add a directory containing `template.tsx`.
- Invalid path: every directory segment must be lowercase kebab-case: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Directories starting with `.` or `_` are ignored.
- A directory without `template.tsx` is treated as a category and scanned below it.

## Build And Start

- `framekit build` validation failure: run `framekit check` to get template, locale, and field errors. Check does not test rendering or PNG export.
- `framekit start` cannot find a server: run `framekit build` first.
- Multiple server candidates: ensure a single Next.js build output and remove nested output that confuses server discovery.

## Generated Project Installation

- A target directory must not already exist, including an empty directory.
- Native dependency installation failures require Python, make, and a C++ toolchain when no compatible prebuilt binary exists.
- Do not treat `pnpm install --ignore-scripts` as a general fix. Use it only for diagnosis; rebuild affected packages and verify with `pnpm check` and `pnpm build` afterward.
- `create-framekit` keeps a partially created project when installation fails so it can be diagnosed.

## Development Diagnostics

- `framekit dev` port conflict: set `PORT` to an available integer from 1 through 65535. Use `FRAMEKIT_HOST` or `HOST` for the bind address.
- Structural template changes should regenerate the registry; edits within an existing `template.tsx` rely on Next HMR. Restart `framekit dev` if structural changes do not update the catalog.
- If TypeScript cannot resolve `@framekit/generated/templates`, map `@framekit/*` to `.framekit/*` in `tsconfig.json`.
