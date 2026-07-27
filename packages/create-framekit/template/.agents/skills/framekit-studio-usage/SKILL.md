---
name: framekit-studio-usage
description: Help users operate or troubleshoot FrameKit Studio in a generated project, including catalog navigation, editing, locales, preview, themes, PNG export, and Studio-specific failures.
---

# FrameKit Studio Usage

Keep advice tied to the observed behavior and use the project's existing commands.

## References

- Read [Using Studio](references/using-studio.md) for navigation, editing, locales, preview, themes, persistence, and export.
- Read [Image Fields](../framekit-template-creation/references/image-fields.md) for image previews, assets, variants, and uploads.
- Read [Troubleshooting](references/troubleshooting.md) for catalog, CSS, registry, dev-server, and PNG failures.
- Read [Project integration](../framekit-project-setup/references/integration.md) when embedding Studio in another App Router project.

## Method

1. Classify the issue as Studio behavior, template/catalog, project setup, or production.
2. Run `framekit check` for definition or resolved-data errors, then `framekit generate` after discovery changes. Run `framekit build` before `framekit start`.
3. State the cause, smallest fix, and relevant limitation. Do not promise server sync, collaboration, non-PNG export, scale or DPI controls, or interface languages beyond English and Spanish.
