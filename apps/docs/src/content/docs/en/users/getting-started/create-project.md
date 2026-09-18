---
title: Create a project
description: Scaffold a new FrameKit project with the official project creator.
sidebar:
  order: 2
---

Use `@mauriciodmo/create-framekit` to copy the canonical consumer template into a new directory.

## Prerequisites

- Node.js `>=22.13.0`.
- pnpm `>=11.14.0` when using pnpm.
- A destination directory that does not already exist. An empty directory also counts as existing.

## Run the creator

The interactive command asks for a project name when it is not supplied:

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
```

The creator detects pnpm or npm from the environment. If it cannot detect a package manager, it asks you to choose one and defaults to pnpm. It then asks these questions:

| Prompt | Default | When it applies |
| --- | --- | --- |
| Install dependencies | Yes | Every new project |
| Run `pnpm approve-builds` | Yes | Only with pnpm when dependencies are installed |
| Initialize Git | Yes | Every new project |

The Git option runs `git init`, stages the project, and creates the initial commit. Disable it if the destination is already managed by another repository workflow.

## Use non-interactive flags

`-y` accepts all prompts and `-n` rejects all prompts:

```bash
pnpm dlx @mauriciodmo/create-framekit -y
pnpm dlx @mauriciodmo/create-framekit my-project -n
```

When either flag is used without a project name, the destination is `./framekit`.

The creator also provides `update-skills [project-directory]` for refreshing the public FrameKit skills in an existing generated project. With no directory, it updates the current directory.

## If installation is skipped

The creator still copies the complete project when you answer no to dependency installation. Enter the project directory and complete installation with the package manager selected for the project:

```bash
cd my-project
pnpm install
pnpm framekit generate
```

With npm, use the corresponding commands:

```bash
cd my-project
npm install
npm exec -- framekit generate
```

`generate` discovers the templates and writes the registry and generated clients. If pnpm reports build scripts that need approval, run `pnpm approve-builds` in the project and repeat the install or generation command as needed.

When installation is enabled, the creator runs the equivalent install command and then generates the catalog. If installation or generation fails, the partially-created directory is preserved so the failure can be diagnosed and the steps above can be run manually.

## Start Studio

After dependencies are installed and the registry exists, start the development server:

```bash
pnpm dev
```

The generated project exposes Studio at `http://localhost:3000`. The root URL redirects to `/editor`. The first login against an empty database needs `FRAMEKIT_ADMIN_PASSWORD`; `FRAMEKIT_ADMIN_USERNAME` is optional and defaults to `admin`. Set these through the runtime environment, not in source control. The complete access and deployment contract will be documented separately.

If PNG export reports that Chromium is unavailable, install the browser used by the server-side renderer:

```bash
pnpm framekit browser install
```

On a Linux machine where system dependencies are not already available, use `pnpm framekit browser install --with-deps`.

## Validate and build

The generated project exposes these commands:

| Command | Behavior |
| --- | --- |
| `pnpm dev` | Generates the registry, watches `src/templates/`, and starts Studio. |
| `pnpm check` | Generates the registry and validates every template definition and content variant. |
| `pnpm build` | Runs the check, then creates the Next.js standalone production build. |
| `pnpm start` | Starts the existing production build without regenerating the registry. |

Use [the project structure guide](/en/users/getting-started/project-structure) to distinguish maintained source files from generated output, then follow [the first-template walkthrough](/en/users/getting-started/first-template).
