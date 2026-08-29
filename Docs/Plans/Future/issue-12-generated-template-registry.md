# Issue #12 — Generated Template Registry

- **GitHub issue:** https://github.com/MauricioDMO/FrameKit/issues/12
- **Status:** Active; GitHub issue state is authoritative.
- **Release:** No version preselected.
- **Depends on:** #3, #4, and the typed field contract completed by #5–#8.
- **Consumed by:** #13 and future server rendering work.

## Objective

Generate one deterministic, typed template registry containing the canonical
catalog summary needed by Studio and a future server renderer, while preserving
filesystem identity, project assets, and lazy template imports.

Normal development and production flows regenerate automatically. The explicit
`framekit generate` command remains a one-off escape hatch, not a required daily
step.

## Current baseline

- Discovery returns filesystem-derived `slug`, `segments`, and a humanized
  `title` plus the absolute template path.
- Generated entries contain `slug`, the filesystem-derived `title`, `segments`,
  `assets`, and a lazy `load` function.
- The generated module also exports unused derivative `templateManifest` and
  `templateRegistry` values.
- `framekit dev` generates before starting Next.js and watches `template.tsx`,
  template assets, template directories, and brand paths.
- `framekit check` generates before validation; `framekit build` calls `check`
  before the production build. `framekit start` does not generate.
- Template metadata, dimensions, and variant information are not available in
  registry entries before loading the definition.

## Exact registry contract

Export a reusable public root type and use it in generated consumer projects:

```ts
type TemplateRegistryEntry = {
  slug: string
  segments: string[]
  meta: TemplateMeta
  width: number
  height: number
  variants: TemplateVariants
  variantKeys: string[]
  assets: TemplateAssetManifest
  load: () => Promise<{ default: TemplateDefinition }>
}
```

Rules:

- `slug` and `segments` come only from the path below `src/templates`.
- `meta` is the exact #3 contract: required `title`, optional `description`,
  `marketingDescription`, and `tags`, with no other properties.
- `width` and `height` are the validated canonical dimensions.
- `variants` is the exact #4 object containing required `default` and optional
  `labels`; it has no `mode` or additional metadata.
- `variantKeys` is `Object.keys(definition.content)` in declaration order. It
  contains no content values.
- `assets` retains the existing common/variant URL manifest unchanged.
- `load` remains a dynamic import. Summary extraction must not turn generated
  consumer imports into eager imports.
- The registry contains no revision, status, compatibility result, category
  duplicate, field definitions, content values, render function, preview, or
  private implementation data.
- Remove the filesystem-derived top-level `title`; consumers use
  `entry.meta.title` without a fallback.
- Export only `templates: TemplateRegistryEntry[]`. Remove the unused generated
  `templateManifest` and `templateRegistry` derivatives rather than maintaining
  parallel registry shapes.

## Automatic generation contract

- `framekit dev` performs one blocking generation before preparing Next.js.
- During development, the watcher regenerates after any added, changed, or
  removed file or directory below `src/templates`, not only `template.tsx` and
  assets. This covers metadata or variant values imported from private files
  inside a template boundary.
- Brand watching keeps its current behavior.
- Concurrent events remain coalesced by the existing pending-generation flow.
- Generated modules are written only when their serialized content changes, so
  an unrelated private implementation edit does not cause a generated-module
  hot reload.
- `framekit check` generates once before validating definitions and resolved
  data. It does not diagnose staleness because it replaces stale output.
- `framekit build` generates once through `check` before invoking Next.js.
- `framekit start` uses built output and never generates.
- `framekit generate` remains available for one-off regeneration, direct
  type-check preparation, CI, and diagnostics.

## Ordered implementation steps

1. Add and export `TemplateRegistryEntry` from the reusable root runtime types.
   Reuse the canonical metadata, variants, definition, and asset-manifest types;
   do not introduce a Studio-only registry model.
2. Remove the humanized title from `DiscoveredTemplate`; keep only filesystem
   identity and the absolute path required by codegen.
3. Add a summary-collection step that imports each local `template.tsx` with the
   existing `tsx` runtime approach, validates it with
   `validateTemplateDefinition`, and returns only the allowed serializable
   summary. Report import and validation failures with the source file path.
4. Generate the exact entry contract while retaining dynamic `load` imports,
   slug ordering, path normalization, and the current asset manifest.
5. Remove `templateManifest` and `templateRegistry` from generated output. Keep
   `templates` as the single generated registry.
6. Expand `watchTemplates` so every path inside `src/templates` schedules
   generation. Keep generated output outside that watched subtree and preserve
   event coalescing and write-if-changed behavior.
7. Make the minimum Studio plumbing change needed to consume the new entry:
   use `meta.title` in existing navigation and align `FrameKitStudioTemplate`
   with the reusable registry type. Functional description, marketing
   description, tags, dimensions, and variant presentation remain #13.
8. Update codegen/discovery fixtures and regenerate the first-party Studio and
   starter outputs through the normal generator; never hand-edit generated
   files.
9. Apply the shared Definition of Done, including both public documentation
   languages, changelog, rolling migration guides, and issue/plan links.

## Documentation and migration requirements

Update English and Spanish CLI, public API, template-authoring, and generated
registry documentation with the exact entry contract and automatic lifecycle:

- `dev` generates initially and watches all template-boundary files;
- `check` and `build` generate automatically;
- `start` does not generate;
- direct `generate` is an optional one-off command.

Add an `Unreleased` changelog entry and update both rolling `migration-next.md`
guides. The migration must instruct custom generated-registry consumers to run
generation, replace `entry.title` with `entry.meta.title`, and stop importing
`templateManifest` or `templateRegistry`. State that generated files are replaced,
not edited or migrated manually, and that no old registry shape is retained.

## Verification

- Test exact summary extraction for required/optional metadata, dimensions,
  default variant, optional labels, and declaration-ordered variant keys.
- Test deterministic slug ordering, nested categories, path normalization, and
  ignored private nested template boundaries.
- Test that generated output retains dynamic imports and excludes revision,
  mode, compatibility state, fields, content values, and render functions.
- Test common and variant asset manifests and copied URLs without changing image
  precedence or upload behavior.
- Test import, syntax, and definition failures with actionable template paths.
- Test watcher regeneration for `template.tsx`, private helper files, assets,
  file/directory addition, removal, and changes; verify unrelated writes do not
  rewrite an unchanged generated module.
- Test that a second identical generation leaves module content unchanged.
- Type-check generated output against the public registry type and current
  Studio props.
- Regenerate and verify the first-party Studio and generated starter.
- Run focused framekit and Studio tests, then `pnpm lint`, `pnpm test`,
  `pnpm typecheck`, and `pnpm build`.

## Completion criteria

- One generated `templates` registry exposes canonical summaries and lazy
  loaders to Studio and future non-Studio consumers.
- No filesystem title fallback, duplicate registry export, unsupported metadata,
  or eager template import remains.
- Development regeneration is automatic for the complete template boundary;
  check/build generation is automatic and production start is read-only.
- Invalid definitions cannot produce a registry summary.
- Public docs, migration guides, changelog, generated consumers, tests, and
  links satisfy the shared Definition of Done.

## Out of scope

- Catalog pages, search, filtering, sorting, thumbnails, or preview caching.
- Displaying metadata beyond the existing navigation title; that belongs to #13.
- Watching arbitrary files outside `src/templates` as implicit template
  dependencies.
- Redesigning assets, image fields, upload behavior, or image precedence.
- A manual registry, compatibility layer, migration command, or stale-output
  diagnostic.
- Server image-generation implementation or release-version selection.
