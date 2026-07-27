# CLI And Troubleshooting

## Commands

```text
framekit <generate|check|dev|build|start>
```

- `generate` scans `src/templates` and writes `src/generated/framekit/templates.ts`; it fails when no templates are found.
- `check` runs generation, then validates every definition and locale data without calling `render` or testing PNG export.
- `dev` generates first. `FRAMEKIT_HOST`, then `HOST`, then `localhost` selects the host. `PORT` defaults to `3000` and must be 1-65535.
- `build` runs `check`, `next build`, and standalone asset preparation.
- `start` requires a successful build and launches the Next standalone server.

The watcher regenerates for added or removed template files/directories and for asset changes under `src/templates/**/assets`. Next HMR handles edits to an existing `template.tsx`; restart `framekit dev` if a structural change is missed.

## Discovery

- Put templates under `src/templates`.
- Every path segment must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Directories beginning with `.` or `_` are ignored.
- A directory with `template.tsx` is a template; directories without it are searched recursively.

## Fixes

| Symptom | Fix |
| --- | --- |
| Empty catalog or “No templates found” | Create `src/templates`, add a directory containing `template.tsx`, then run `framekit generate`. |
| Invalid segment | Rename the offending directory to lowercase kebab-case. |
| Cannot resolve `@framekit/generated/templates` | Add `"@framekit/generated/*": ["./src/generated/framekit/*"]`, then generate. |
| Unstyled editor | Import `@mauriciodmo/framekit/styles.css` in global CSS or the layout. |
| Creator refuses the target | Use a path that does not exist, including no empty pre-existing directory. |
| Native installation fails | Install Python, make, and a C++ toolchain, then retry normally. Do not use `--ignore-scripts` as a general fix. |
| Development port is occupied | Set a free port, for example `PORT=3001 framekit dev`. |
| Build stops at validation | Run `framekit check` and fix the reported template, locale, and field errors. |
| Start cannot find a server | Run `framekit build` first. |

On Windows, use `set VAR=value && pnpm dev` in cmd.exe or `$env:VAR="value"; pnpm dev` in PowerShell.
