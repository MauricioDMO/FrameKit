---
title: create-framekit CLI
description: Create a FrameKit project interactively or non-interactively and update its official skills.
sidebar:
  order: 13
---

`create-framekit` is distributed as `@mauriciodmo/create-framekit` and copies the official starter template into a new project directory.

## Create a project

```text
create-framekit [project-directory] [-y|-n]
```

Without `-y` or `-n`, the creator prompts for a missing project name, a package manager when it cannot detect one, whether to install dependencies, whether pnpm should run `approve-builds`, and whether to initialize Git. The supported package managers are pnpm and npm.

When dependency installation is selected, the creator runs the selected package manager's install command and then generates the catalog. With pnpm, it can run `pnpm approve-builds` before generation. When Git is selected, it runs `git init`, stages the project, and creates the `Initial FrameKit project` commit.

The destination must not already exist, including as an empty directory.

### Non-interactive flags

`-y` accepts the prompts and `-n` rejects them. If either flag is used without a directory, the destination defaults to `./framekit` and the package manager defaults to pnpm when no package manager was detected.

```bash
pnpm dlx @mauriciodmo/create-framekit -y
pnpm dlx @mauriciodmo/create-framekit my-project -n
```

With npm, the equivalent published invocation is:

```bash
npm exec --yes @mauriciodmo/create-framekit -- my-project
```

When npm is selected, the creator removes the generated project's `pnpm-workspace.yaml` before installing.

## `update-skills`

Copy the official skills shipped with the installed creator into an existing project:

```text
create-framekit update-skills [project-directory]
```

The directory defaults to `.` and must already exist. The command replaces matching official skill directories under `.agents/skills/`; other directories are not selected by this update.

```bash
pnpm dlx @mauriciodmo/create-framekit update-skills
npm exec --yes @mauriciodmo/create-framekit -- update-skills ./my-framekit
```

See [create a project](/en/users/getting-started/create-project), [project structure](/en/users/getting-started/project-structure), and the [framekit CLI](/en/users/reference/cli/framekit).
