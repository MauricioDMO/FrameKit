# FrameKit CLI Reference

## Usage

```
framekit <generate|check|dev|build|start>
```

All commands use `process.cwd()` as the project root. There is no `--help`, `--version`, or configuration file flag. There is no way to specify an alternate templates directory; FrameKit always scans `src/templates`.

---

## `framekit generate`

Scans `src/templates` for template directories and generates a registry file.

The scan registers every directory containing a `template.tsx` file. Subdirectories within a template directory are not traversed; internal components, definitions, and assets are not treated as child templates.

If no templates are found, the command exits with code 1 and prints an error message identifying the empty directory. The output file is written only when its content has changed.

Output is written to `.framekit/generated/templates.ts` with lazy literal imports. On success, the command prints the number of templates found.

```sh
framekit generate
# FrameKit: 3 plantilla(s)
```

---

## `framekit check`

Validates every template definition and its resolved content across all declared locales.

The command first runs `generate` to ensure the registry is current. It then creates a temporary checker directory inside `.framekit/` and writes a temporary TypeScript file that imports every template via bundled `tsx`. This uses the consumer's own `tsconfig`, so TypeScript imports, TSX syntax, and path aliases resolve the same way they do during development.

For each template, `validateTemplateDefinition` checks the structure of the definition: dimensions (width and height must be positive finite integers), fields, content, and the render function. For each locale declared in the definition, `resolveTemplateData` resolves the template data with no user edits (empty user data object), and `validateTemplateData` checks the resolved values: required fields are present, number fields respect min/max constraints, and URL fields are valid URLs.

The temporary checker directory is always deleted after the check completes, whether it passes or fails.

Structured errors are reported per template, per locale, and per field:

```
/path/to/src/templates/example/template.tsx: content.en.title: required
/path/to/src/templates/example/template.tsx: content.en.count: number_too_small (min: 3)
/path/to/src/templates/example/template.tsx: content.es.url: invalid_url
```

The check process exits with code `1` when it reports validation errors. Definition errors use the same `file: message` format, for example `.../template.tsx: render must be a function`.

`framekit check` is not a TypeScript typecheck and does not call `render` or test PNG export. Use `next build` for type checking.

```sh
framekit check
```

---

## `framekit dev`

Starts a development server with live template registry updates.

Before starting the server, the command runs `generate` to produce the initial registry. It then starts a Next.js dev server with Turbopack and custom HTTP server handling, including WebSocket upgrades for Hot Module Replacement.

The template watcher observes `src/templates` for structural changes only: a new `template.tsx` file, a deleted `template.tsx` file, or a new or deleted directory under `src/templates`. Edits to the content of an existing `template.tsx` do not trigger regeneration; Next HMR handles those automatically. When a structural change is detected, regeneration is debounced by 150ms. Only one generation runs at a time; if a structural change arrives while a generation is in progress, the pending change is picked up by the in-progress generation before it exits.

FrameKit itself resolves the development server hostname and port from the following environment variables (in priority order):

| Variable        | Default | Notes                                                  |
| --------------- | ------- | ------------------------------------------------------ |
| `FRAMEKIT_HOST` | `HOST`  | Fallback chain: `FRAMEKIT_HOST` → `HOST` → `localhost` |
| `PORT`          | `3000`  | Must be an integer between 1 and 65535                 |

The command handles `SIGINT` and `SIGTERM` gracefully, closing the server before exiting.

```sh
FRAMEKIT_HOST=0.0.0.0 PORT=4000 framekit dev
# FrameKit Studio: http://0.0.0.0:4000
```

---

## `framekit build`

Runs validation and then builds the production Next.js application.

The command first runs `framekit check`. If validation fails, the build is aborted and the Next.js build step is never executed. If validation passes, `next build` is run.

After a successful build, the standalone server output directory is located by searching for a `server.js` file whose sibling `.framekit/next/BUILD_ID` file exists. Exactly one such file must be found; the command fails if zero or multiple candidates are discovered.

Once the standalone server is located, the following assets are copied beside it:

- `public/` directory, if it exists
- `.framekit/next/static/` directory

This ensures the standalone server can serve static assets without a CDN.

```sh
framekit build
```

---

## `framekit start`

Starts the production standalone server.

The command searches for exactly one `server.js` file inside `.framekit/next/standalone/` whose adjacent traced output directory contains a `BUILD_ID` file. If zero or more than one candidate is found, the command fails with an error. FrameKit does not resolve production host or port options here: it launches `server.js` with the parent environment inherited. Next's generated standalone server reads `PORT`, `HOSTNAME`, and `KEEP_ALIVE_TIMEOUT`; `FRAMEKIT_HOST` and `HOST` are not mapped to `HOSTNAME`.

The standalone server is launched as a child process with an inherited environment. Exit codes and signals are propagated to the parent process.

```sh
framekit start
```

---

## General CLI Behavior

- All commands operate on `process.cwd()` as the project root.
- There is no `--help`, `--version`, or configuration file flag.
- There is no way to specify an alternate templates directory.
- Child processes inherit the parent's environment and stdio.
- Temporary files are cleaned up even on failure.

[English](./cli.md) | [Español](../../es/reference/cli.md)
