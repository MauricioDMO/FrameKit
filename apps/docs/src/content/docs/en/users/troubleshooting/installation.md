---
title: Troubleshoot installation
description: Diagnose project creation, dependency installation, generation, and development-server startup problems.
sidebar:
  order: 2
---

## The creator refuses the destination

**Symptom:** `create-framekit` reports that the target directory already exists.

**Probable cause:** The destination exists, including when it is empty. The creator does not overwrite it.

**Check:** Verify the exact destination path before running the creator.

**Fix:** Choose a new directory name, or remove or rename the existing directory only after confirming that it contains nothing you need. See [Create a project](/en/users/getting-started/create-project).

## Dependencies or the `framekit` command are missing

**Symptom:** `pnpm dev`, `pnpm framekit generate`, or another project command cannot find installed dependencies or the FrameKit CLI.

**Probable cause:** Installation was skipped or did not finish.

**Check:** From the generated project root, verify that `node_modules` is present and inspect the preceding install error.

**Fix:** Install dependencies, then generate the project files:

```bash
pnpm install
pnpm framekit generate
```

If pnpm asks for build-script approval, run `pnpm approve-builds` and repeat the required install or generation command. Do not use `--ignore-scripts` as a general repair.

## Generation fails during setup

**Symptom:** `pnpm framekit generate` stops with an error while creating the registry.

**Probable cause:** A template or brand source file is invalid, an import fails, or a discovered path does not satisfy the source contract.

**Check:** Run the command from the project root and read the first reported source path. Then run:

```bash
pnpm framekit check
```

**Fix:** Correct the reported file under `src/templates/` or `src/brand/`, then run `pnpm framekit generate` again. Use [Templates and assets troubleshooting](/en/users/troubleshooting/templates-and-assets) for discovery rules.

## The development server cannot start on its port

**Symptom:** `pnpm dev` exits because the requested port is unavailable.

**Probable cause:** Another process is using the selected port, or `PORT` is outside `1` through `65535`.

**Check:** Check the process using the port and inspect the value of `PORT`.

**Fix:** Stop the conflicting process or choose an available valid port, for example:

```bash
PORT=3001 pnpm dev
```

On Windows, set `PORT` with the syntax for your shell before running `pnpm dev`.

## PNG export cannot find Chromium after installation

**Symptom:** The project starts, but Studio export reports that the browser is unavailable.

**Probable cause:** The Playwright Chromium browser has not been installed for the project environment.

**Check:** Run the browser installation command from the project root.

**Fix:** Install Chromium, adding `--with-deps` on Linux when system dependencies are missing:

```bash
pnpm framekit browser install
pnpm framekit browser install --with-deps
```

Use the second command instead of the first on a Linux environment that needs the browser's system dependencies. See [Troubleshoot image rendering](/en/users/troubleshooting/rendering).
