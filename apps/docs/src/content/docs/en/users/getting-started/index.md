---
title: Getting started
description: Choose a setup path and take a FrameKit project from its prerequisites to its first template.
sidebar:
  order: 1
---

FrameKit projects are Next.js applications with a generated template registry and a server-backed Studio. Choose the route that matches your starting point.

## Choose a setup path

- [Create a project](/en/users/getting-started/create-project) if you are starting a new application. `create-framekit` copies the canonical project template and can install its dependencies for you.
- [Integrate an existing project](/en/users/getting-started/existing-project) if you already have a Next.js application and want to add FrameKit without replacing its application code.

Both paths lead to the same working model:

1. Templates live under `src/templates/`.
2. FrameKit generates `src/generated/framekit/` from those templates.
3. Studio uses the generated clients and protects its routes with the FrameKit access layer.
4. [Your first template](/en/users/getting-started/first-template) is validated before it is shown in Studio.

## Requirements

- Node.js `>=22.13.0`.
- pnpm `>=11.14.0` when using pnpm. The creator also supports npm for installing a generated project.
- An existing project must use Next.js `>=16 <17`, React `>=19 <20`, and React DOM `>=19 <20`.

The generated template pins compatible Next.js and React versions. FrameKit checks the Node.js runtime before its CLI commands run, and the creator checks the pnpm version when pnpm is used for installation.

## After setup

Read [the project structure](/en/users/getting-started/project-structure) before editing generated files. Then follow [the first-template walkthrough](/en/users/getting-started/first-template) to add a template with metadata, a variant, and an editable text field.

Do not edit `src/generated/framekit/`, `public/framekit/`, or `.framekit/` by hand. They are disposable outputs of the generation and build workflows.
