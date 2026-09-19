---
title: Contributor prerequisites
description: Check the Node.js, pnpm, and repository installation requirements for FrameKit development.
---

# Contributor prerequisites

FrameKit is a private pnpm monorepo. Start from the repository root and use the versions declared by the root `package.json`:

- Node.js `>=22.13.0`.
- pnpm `>=11.14.0`.

The root also pins the package manager with `packageManager: "pnpm@11.14.0"`. The workspace includes `apps/*` and `packages/*` through `pnpm-workspace.yaml`.

## Install dependencies

From the repository root, install the lockfile-resolved dependencies:

```bash
pnpm install --frozen-lockfile
```

This is the clean-checkout installation path for the workspace. After installation, `pnpm check:runtime` can verify the repository's runtime, manifest, documentation, and CI version contract.

## Continue

Follow [local development](/en/contributors/getting-started/local-development) to build the public package and start the first-party Studio. For a generated application instead, use [user getting started](/en/users/getting-started).
