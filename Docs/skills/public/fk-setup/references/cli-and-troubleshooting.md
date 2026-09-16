# CLI And Troubleshooting

For the authoritative command behavior, see the [FrameKit CLI
reference](../../../../en/reference/cli.md). For the server image route and
its public API contract, see the [public API reference](../../../../en/reference/public-api.md).

## Commands

`framekit generate`, `check`, `dev`, `build`, and `start` respectively generate
the registry, validate data, run Studio, build the standalone app, and start
that build. `check` and `build` regenerate before validating or building; `dev`
regenerates before starting and when watched templates change; `start` is
read-only and does not regenerate. `check` does not call `render` or test PNG
export. `dev` uses `FRAMEKIT_HOST`, then `HOST`, then `localhost`; `PORT`
defaults to `3000` and must be 1-65535.

The watcher observes every file and directory under `src/templates`. Additions,
edits, and deletions there trigger regeneration; only one generation runs at a
time. It also regenerates when paths under `src/brand` change.

## Tooling environment

These variables affect command-line, browser, or test tooling; they are not
template or server configuration:

- `NO_COLOR=1` disables `create-framekit`'s terminal styling.
- `npm_config_user_agent` is normally supplied by npm or pnpm. The creator uses
  it to detect the package manager, so do not set it manually. If detection is
  unavailable, interactive creation asks you to choose; `-y` and `-n` default to
  pnpm.
- `PATH` must allow the selected package manager and any command it runs to be
  resolved. On Windows, `create-framekit` uses `ComSpec` (or `cmd.exe` when it
  is absent) to launch those commands. These are operating-system plumbing, not
  FrameKit project settings.
- `framekit browser install` honors `PLAYWRIGHT_BROWSERS_PATH` for browser
  discovery when a non-default browser registry is needed.
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` is for controlled dependency or
  container installs where the browser is installed explicitly afterward; it is
  not needed for normal project setup.
- `NODE_EXTRA_CA_CERTS` is smoke-only plumbing for an isolated HTTPS fixture
  using a private test CA. It is not a normal project setting or FrameKit image
  API configuration.
- `CI` and `NEXT_TELEMETRY_DISABLED` are repository test/CI plumbing. A normal
  consumer does not need to set them. `FRAMEKIT_TEST_FAIL` is only used by the
  creator's test doubles and must never be set in a consumer project.

## Discovery

- Put templates under `src/templates`.
- Use lowercase kebab-case for every path segment; `.` and `_` prefixes are ignored.
- A directory with `template.tsx` is a template; other directories are searched recursively.

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
| Build stops at validation | Run `framekit check` and fix the reported template, variant data, and field errors. |
| Start cannot find a server | Run `framekit build` first. |

On Windows, use `set VAR=value && pnpm dev` in cmd.exe or `$env:VAR="value"; pnpm dev` in PowerShell.
