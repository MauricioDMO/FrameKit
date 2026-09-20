---
name: fk-studio
description: Help users operate or troubleshoot FrameKit Studio in a generated project, including registry-backed catalog navigation, editing, generic variants, interface localization, typed fields, preview, themes, PNG export, and Studio-specific failures.
---

# FrameKit Studio

Keep advice tied to the observed behavior and use the project's existing commands.

For template editing, treat the generated `TemplateRegistryEntry` as Studio's
contract. `entry.meta.title` is the canonical title for navigation and the
selected editor heading; show `description`, `marketingDescription`, and
`tags` only when present. Use the generic localized **Variant**/`Variante`
label: `variants.default` selects the initial variant, optional
`variants.labels?.[key] ?? key` supplies option text, and variant keys are
arbitrary and independent from the EN/ES interface locale.
The generated `templates` registry is the single registry: consume its summary,
asset manifest, and lazy `load` function directly, without a slug-title fallback
or a Studio adapter/parallel registry.

Read [Using Studio](references/using-studio.md), [Image Fields](../fk-templates/references/image-fields.md), and [Troubleshooting](references/troubleshooting.md) as needed. Use [Project integration](../fk-setup/references/integration.md) for another App Router project.

## Method

1. Classify the issue as Studio, template/catalog, setup, or production.
2. Run `framekit check` for definition or resolved-data errors, `framekit generate` after discovery changes, and `framekit build` before `framekit start`.
3. State the cause, smallest fix, and limitation. Remember that edits persist only as typed string/finite-number/boolean data under `framekit:<slug>:v2`; there is no v1 migration or compatibility promise. Incomplete number drafts stay inside the control, while preview/export/copy use committed resolved data. Number values must satisfy finite, bound, and step validation; choices must be declared strings and booleans must be real booleans.
4. Distinguish invalid-definition, data, upload, export, load, and not-found states. Raw loader errors are not exposed; Studio shows localized template/brand load messages. Do not promise server sync, collaboration, non-PNG export, scale/DPI controls, or languages beyond English and Spanish.
