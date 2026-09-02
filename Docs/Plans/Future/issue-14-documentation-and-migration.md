# Issue #14 — Documentation and Migration

- **GitHub issue:** https://github.com/MauricioDMO/FrameKit/issues/14
- **Status:** Active; GitHub issue state is authoritative.
- **Release:** No version preselected; document the `Unreleased` contract.
- **Depends on:** Final implemented behavior from #2–#8 and #12–#13.

## Objective

Perform the final English/Spanish documentation audit for the canonical
contract, consolidate its versionless rolling migration guidance and
`Unreleased` changelog, and synchronize FrameKit skills from their canonical
sources. This issue verifies and completes documentation; it does not define or
implement another runtime contract.

## Initial baseline (before implementation)

- The published runtime manifest is currently `0.8.1`; the future release that
  carries the canonical contract has not been selected.
- Public README and documentation examples still describe plural `fields`,
  textarea, locale/language content, string-only data, and editor persistence
  `v1` because the active implementation issues have not landed.
- There are equivalent English and Spanish documentation trees, but no rolling
  `Docs/en/getting-started/migration-next.md` or Spanish counterpart yet.
- The root `CHANGELOG.md` does not yet exist. The first active implementation
  change must create its `Unreleased` section, and every following issue must
  update it rather than postponing all entries to #14.
- The versioned English and Spanish `migration-v0.8.0.md` guides describe a
  historical released migration and must remain historical.
- Canonical skills live under `Docs/skills`; synchronized internal and generated
  project copies are produced by `pnpm sync:skills`. Current skill guidance also
  reflects the pre-canonical contract.

## Documentation contract

- Describe implemented current and `Unreleased` behavior without naming a
  future package version.
- Keep English and Spanish topic coverage equivalent. Wording may differ, but
  contracts, commands, examples, limitations, and links must agree.
- Main documentation teaches only the canonical contract. Obsolete APIs may
  appear only in clearly historical or migration-specific context.
- Distinguish Studio interface locale from generic template variants everywhere.
- Do not present future server image generation, advanced catalog, persistence,
  or extension ideas as implemented.
- Public documentation examples must agree with executable starter/type fixtures where
  practical; do not build a general Markdown snippet compiler for this issue.

## Required coverage

### Main presentation

Update and align root `README.md`, `README.es.md`,
`packages/framekit/README.md`, and `packages/create-framekit/README.md`.

Main examples and capability lists must cover required metadata, explicit
variants, singular `field`, canonical field values, automatic registry
generation, Studio behavior, current runtime requirements, and real
limitations. They must state that a server image-generation API is future work.

### Public documentation

Audit every affected pair below `Docs/en` and `Docs/es`, including getting
started, existing-project integration, template authoring, Studio, template
contract, public API, CLI, troubleshooting, repository/testing guidance, brand
references, and both documentation indexes.

The final text must match #3–#8 and #12–#13 for metadata, variants, field
factories, choice/boolean/number typing, image behavior, typed resolution and
validation boundaries, registry shape, automatic generation, Studio
persistence, preview, export, and errors.

### Rolling migration guides

Maintain these versionless files throughout implementation and consolidate them
in this final audit:

- `Docs/en/getting-started/migration-next.md`;
- `Docs/es/getting-started/migration-next.md`.

Together they describe manual adoption of metadata, variants, localStorage `v2`
invalidation, singular `field`, textarea removal, choice, boolean, typed
numbers, typed resolution and validation, generated registry, and Studio
integration. Include additive no-migration notes required by the shared gate.

Do not include a target release number, compatibility period, deprecation
diagnostics, coercion, or `framekit migrate`. Preserve `migration-v0.8.0.md` as a
released historical guide; only repair broken links or objectively stale
cross-references that do not rewrite its historical contract.

### Changelog

Verify root `CHANGELOG.md` has one versionless `Unreleased` section covering all
public additions, changes, removals, and migration effects from active issues.
Entries must agree with both rolling guides. Versioning and archiving
`Unreleased` belong to release preparation, not this issue.

### Skills

Update only canonical sources under `Docs/skills`, especially template, Studio,
setup, release, and troubleshooting references affected by the contract. Run
`pnpm sync:skills` to regenerate `.agents/skills` and create-framekit template
copies; never edit those targets directly or add another sync system.

## Ordered implementation steps

1. Inventory final public exports, generated registry, CLI lifecycle, starter,
   Studio UI/state, runtime requirements, and limitations from code after #13.
2. Compare that inventory against root/package READMEs and every affected EN/ES
   pair; record concrete omissions and contradictions before editing.
3. Update the four README surfaces with one canonical runnable template example
   and accurate capabilities, requirements, and limitations.
4. Correct public references and guides in pairs. Remove obsolete teaching of
   plural factories, textarea, locale/language content, string numbers,
   discriminated resolver results, old registry exports, and persistence `v1`.
5. Consolidate both rolling guides in implementation order #3–#8 and #12–#13,
   preserving explicit manual steps and additive no-migration notes.
6. Audit accumulated `CHANGELOG.md` `Unreleased` entries against implementation
   issues and migration guides without inventing a release version.
7. Update canonical `Docs/skills` sources, then run `pnpm sync:skills` once.
8. Search current docs and skills for rejected APIs and version promises;
   classify each remaining match as a closure decision, interface locale,
   historical text, or error.
9. Exercise documented Quick Start and generated starter behavior, then run
   documentation and repository verification.
10. Link implementation docs, this plan, GitHub issue, changelog, and guides.

## Verification

- Verify root/package README Quick Start commands against a generated project on
  the documented runtime baseline.
- Run starter generation, `framekit check`, typecheck, and build; ensure central
  snippets match executable templates/type fixtures.
- Compare EN/ES indexes and affected pairs for equivalent topics and links.
- Check internal Markdown links and anchors with existing tooling or a focused
  link check if one exists; do not add a documentation framework.
- Search current docs and canonical skills for rejected plural fields,
  textarea, template locale/language, numeric strings, revision/mode,
  discriminated resolver results, global last-valid preview, compatibility, and
  future-version claims; classify historical and closure-decision matches.
- Run `pnpm sync:skills` and verify sources and generated copies agree.
- Run `pnpm check:runtime`, `pnpm lint`, `pnpm test`, `pnpm typecheck`, and
  `pnpm build`.
- Coordinate external package/starter smoke verification with #15 rather than
  duplicating its release-gate contract.

## Completion criteria

- Main and public English/Spanish documentation teach only the implemented
  canonical contract and have equivalent coverage.
- Both versionless rolling guides and root `Unreleased` changelog are complete
  and mutually consistent.
- Historical released migration documentation remains historical.
- Canonical skills and both synchronized target trees describe final behavior.
- Central documentation examples and Quick Start are executable on the supported runtime.
- No future release version, compatibility promise, migration command, or
  unimplemented capability is presented as current.

## Out of scope

- Choosing, tagging, publishing, or documenting a final release version.
- Renaming `migration-next.md` for a release or rewriting historical guides.
- New APIs, runtime behavior, UI features, languages, or a marketing website.
- Legacy compatibility, deprecation diagnostics, or automatic source migration.
- The discriminated resolver and global last-valid-preview design rejected by
  #9.
- Implementing server image generation or advanced roadmap features.
- Defining release gates or package smoke matrices; those belong to #15.
