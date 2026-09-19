---
title: Troubleshoot the generated registry
description: Diagnose missing, stale, or invalid generated FrameKit modules.
sidebar:
  order: 4
---

## Generated modules are missing

**Symptom:** Imports such as `@framekit/generated/templates` or the generated Studio client cannot be resolved.

**Probable cause:** The project has not completed generation, or the generated directory was removed.

**Check:** Confirm that `src/generated/framekit/` is absent or does not contain `templates.ts`, `brands.ts`, and the generated clients.

**Fix:** From the project root, run:

```bash
pnpm framekit generate
```

If generation fails, fix the source error first. See [Project structure](/en/users/getting-started/project-structure) for the generated paths.

## Studio still shows an old template or brand list

**Symptom:** A changed, added, or removed template or brand is not reflected in Studio.

**Probable cause:** The registry was not regenerated, or a development generation failed.

**Check:** Inspect the development-server output for a generation error and compare the source directories with the generated registry.

**Fix:** Correct the source, run `pnpm framekit generate`, and reload Studio. During development, restart `pnpm framekit dev` if the refreshed registry is not picked up.

## Generated files were edited but the change does not persist

**Symptom:** A manual change under `src/generated/framekit/` or `public/framekit/` disappears or has no effect.

**Probable cause:** Those directories are generated output and are replaced by FrameKit commands.

**Check:** Find the corresponding source template or brand component under `src/templates/` or `src/brand/`. For copied template assets, inspect the source under `src/templates/<template>/assets/`.

**Fix:** Edit the maintained source, then run `pnpm framekit check` or `pnpm framekit generate` as appropriate. Never use generated output as the source of truth.

## Generation fails while loading a template

**Symptom:** `generate` reports an import or template-loading error instead of writing the registry.

**Probable cause:** A template module or one of its imports fails to load, or its definition cannot be validated.

**Check:** Run `pnpm framekit generate` from the project root and use the reported source path to test the failing import or definition.

**Fix:** Correct the module or definition, then rerun `pnpm framekit check` and `pnpm framekit generate`.

## Copied assets are stale or absent

**Symptom:** A generated template entry exists, but its asset is not available under the public project output.

**Probable cause:** Asset discovery failed or the registry was generated before the source asset was added or changed.

**Check:** Verify the asset layout and naming rules in [Templates and assets troubleshooting](/en/users/troubleshooting/templates-and-assets), then inspect the generation output.

**Fix:** Correct the source asset and run `pnpm framekit generate`. The command refreshes copied template assets together with the registry.
