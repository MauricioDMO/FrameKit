# FrameKit Execution Plans

These English plans are the implementation or closure-contract source of truth
for the GitHub issues they cover. The GitHub issue state is the status source
of truth; the status shown
here is a planning snapshot, not a replacement for the issue. Plans, public
documentation, and code must be updated together in the same implementation
work.

No release version is preselected by these plans. The release that contains a
breaking contract change is chosen later by maintainers.

## Execution index

1. [#1 — Canonical Template Contract](./issue-01-canonical-template-contract.md)
   — establish the versionless contract shared by Studio and future server
   rendering; this is the foundation for the execution sequence below.
2. [#2 — Runtime Requirements](./issue-02-runtime-requirements.md) — completed
   baseline.

## Active execution order

3. [#3 — Template Metadata](./issue-03-template-metadata.md) — add the exact
   `meta` contract and update current templates.
4. [#4 — Content Variants](./issue-04-content-variants.md) — replace the
   locale/language shape atomically after the canonical contract is in place.
5. [#5 — Semantic Fields](./issue-05-semantic-fields.md) — make the field API
   singular and establish the semantic text, color, and image fields.
6. [#6 — Choice Field](./issue-06-choice-field.md) — add closed-set string
   values with native select editing.
7. [#7 — Boolean Field](./issue-07-boolean-field.md) — carry real booleans
   through content, editing, and rendering.
8. [#8 — Number Field](./issue-08-number-field.md) — carry finite numbers with
   explicit bounds and step behavior.
9. [#9 — Typed Data Pipeline](./issue-09-typed-data-pipeline.md) — unify typed
   resolution, validation, and the last-valid-preview boundary.
12. [#12 — Generated Template Registry](./issue-12-generated-template-registry.md)
    — generate canonical metadata, dimensions, variants, assets, and lazy
    loaders with automatic development and build lifecycle integration.
13. [#13 — Studio Canonical Contract Integration](./issue-13-studio-canonical-contract.md)
    — consume the final registry, metadata, variants, typed state, validation,
    persistence, and native controls end to end in Studio.
14. [#14 — Documentation and Migration](./issue-14-documentation-and-migration.md)
    — perform the final versionless EN/ES audit, consolidate rolling migration
    and changelog records, and synchronize canonical skills.
15. [#15 — Testing and Release Gates](./issue-15-testing-and-release-gates.md) —
    close cross-layer coverage gaps and define permanent CI, pre-publication
    tarball, and post-publication registry gates without selecting a version.

Issue #3 depends on #1. Issue #4 follows #3 so current templates receive one
coherent contract update. Issues #5–#8 establish the field contracts consumed by
#9, which completes the canonical data contract. Issue #12 then generates its
registry summary, and #13 completes Studio integration. Neither registry nor
Studio work is pulled into #3 or #4. Issue #14 is the final documentation audit;
it does not defer the per-issue documentation requirements below. Issue #15 is
the final versionless verification and distribution gate.

GitHub issues #10 (compatibility) and #16 (version-specific release) are
obsolete and excluded from active execution.

## Closed decision records

- [#10 — Legacy Compatibility](./issue-10-legacy-compatibility.md) — closed as
  not planned. The canonical contract replaces the current contract directly;
  no runtime compatibility layer or deprecation window will be added.
- [#11 — Source Migration Command](./issue-11-source-migration-command.md) —
  closed as not planned. Contract changes are documented manual source edits;
  no automatic TSX migration command will be added for this transition.
- [#16 — Version-specific 0.6 beta release](https://github.com/MauricioDMO/FrameKit/issues/16)
  — closed as not planned. No execution plan exists by design; maintainers
  choose package versions only during release preparation and apply #15 gates.

## Shared Definition of Done for active issues

Before closing any active issue—including foundational #1 and each issue in the
active order #3 -> #4 -> #5 -> #6 -> #7 -> #8 -> #9 -> #12 -> #13 -> #14 ->
#15—maintainers must complete all of the following:

- code implementation and focused tests;
- English and Spanish public documentation;
- an entry in the root `CHANGELOG.md` under `Unreleased`;
- the rolling
  `Docs/en/getting-started/migration-next.md` and
  `Docs/es/getting-started/migration-next.md` guides, including an explicit
  no-migration note when the change is additive;
- updated generated starter/examples;
- links between the implementation, its plan, and its GitHub issue.

Do not create the changelog entry or migration guides while writing these
plans. They are implementation deliverables.

## Index rules

- Keep the public contract in the issue plan even when implementation details
  move between files.
- Treat rejected properties and compatibility behavior in a plan as tests,
  not suggestions.
- Preserve the current image and asset behavior unless a later issue explicitly
  changes it.
