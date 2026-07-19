# CLI And Troubleshooting

## Commands

```text
framekit <generate|check|dev|build|start>
```

- `generate`: scans `src/templates` and writes `.framekit/generated/templates.ts`. It exits with code 1 when no templates are found.
- `check`: runs generation, then validates every definition and resolved locale. It uses the project TypeScript configuration, but does not typecheck, call `render`, or test PNG export.
- `dev`: generates first, then starts Next development with live registry updates. `FRAMEKIT_HOST`, then `HOST`, then `localhost` selects the host; `PORT` defaults to `3000` and must be an integer from 1 through 65535.
- `build`: runs `check`, then `next build`, and prepares the standalone server with `public/` when present and static assets.
- `start`: requires a successful build and launches Next's standalone server. Use its `PORT`, `HOSTNAME`, and `KEEP_ALIVE_TIMEOUT` environment variables; `FRAMEKIT_HOST` and `HOST` do not map to `HOSTNAME` here.

The watcher regenerates only for directories or `template.tsx` files added or removed under `src/templates`. Next HMR handles edits to an existing template. Restart `framekit dev` if a structural change does not update the catalog.

## Template discovery

- Put templates under `src/templates`.
- Each path segment must be lowercase kebab-case: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Directories beginning with `.` or `_` are ignored.
- A directory containing `template.tsx` is a template. Directories without it are categories that are searched recursively.

## Fixes

| Symptom | Fix |
| --- | --- |
| Empty catalog or “No templates found” | Create `src/templates` if missing and add at least one valid directory containing `template.tsx`; run `framekit generate`. |
| Invalid segment error | Rename every offending directory to lowercase kebab-case. |
| Cannot resolve `@framekit/generated/templates` | Add the `@framekit/*` TypeScript alias, then run generation. |
| Unstyled editor | Import `@mauriciodmo/framekit/styles.css` in global CSS or the layout. |
| Creator refuses the target | Choose a directory path that does not exist, including no empty pre-existing directory. |
| Install fails for native dependencies | Install Python, make, and a C++ toolchain, retry normally, then verify with `pnpm check` and `pnpm build`. Do not use `--ignore-scripts` as a general fix. |
| Development port is occupied | Set a free port, for example `PORT=3001 framekit dev`. |
| Build stops at validation | Run `framekit check` directly and fix its file, locale, and field errors. |
| Start cannot find a server | Run `framekit build` first, then `framekit start`. |
| Blank or wrong PNG | Validate data, wait for fonts, ensure cross-origin images permit browser canvas use, and use a browser with DOM/canvas support. Export is browser-only. |

On Windows, use the shell's environment-variable syntax rather than POSIX `VAR=value command`: `set VAR=value && pnpm dev` in cmd.exe, or `$env:VAR="value"; pnpm dev` in PowerShell.
