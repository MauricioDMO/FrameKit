# Repository tooling

This directory contains repository-maintenance scripts that are not part of the published FrameKit runtime.

- `check-runtime-contract.mjs` validates workspace runtime/version contracts.
- `eslint-standard.mjs` provides the shared ESLint Standard configuration.
- `smoke-tarballs.mjs` validates packed public packages against isolated consumers.
- `smoke-docker.mjs` validates the published package through the generated Docker image.
- `sync-skills.mjs` synchronizes authored skills into their tracked/generated copies.

Package-specific build tooling remains inside its owning package, for example `packages/framekit/scripts/`.
