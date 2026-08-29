# FrameKit Execution Plans

These English plans are the implementation or closure-contract source of truth
for the GitHub issues they cover. The GitHub issue state is the status source
of truth; the status shown
here is a planning snapshot, not a replacement for the issue. Plans, public
documentation, and code must be updated together in the same implementation
work.

No release version is preselected by these plans. The release that contains a
breaking contract change is chosen later by maintainers.

## Consumer and fixture boundary

The canonical in-repository consumer fixture is
`packages/create-framekit/template/`. Distribution smoke consumers are
temporary projects created outside this repository. Any “starter” or “generated
starter” requirement below refers to that template and its generated output.

## Execution index

1. [#1 — Canonical Template Contract](https://github.com/MauricioDMO/FrameKit/issues/1)
   — completed foundation for the versionless contract shared by Studio and
   future server rendering.
2. [#2 — Runtime Requirements](https://github.com/MauricioDMO/FrameKit/issues/2)
   — completed baseline.
3. [#3 — Template Metadata](https://github.com/MauricioDMO/FrameKit/issues/3)
   — completed canonical metadata contract.
4. [#4 — Content Variants](https://github.com/MauricioDMO/FrameKit/issues/4)
   — completed generic variant contract.
5. [#5 — Semantic Fields](https://github.com/MauricioDMO/FrameKit/issues/5)
   — completed singular semantic field API.
6. [#6 — Choice Field](https://github.com/MauricioDMO/FrameKit/issues/6)
   — completed closed-set choice field.
7. [#7 — Boolean Field](https://github.com/MauricioDMO/FrameKit/issues/7)
   — completed boolean field contract.
8. [#8 — Number Field](https://github.com/MauricioDMO/FrameKit/issues/8)
   — completed typed number field contract.

## Active execution order

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

Issues #1–#8 are completed and their detailed plan files are retained in Git
history. Issue #12 generates the registry summary, and #13 completes Studio
integration. Issue #14 is the final documentation audit; it does not defer the
per-issue documentation requirements below. Issue #15 is the final versionless
verification and distribution gate.

GitHub issues #9–#11 and #16 are closed as not planned and excluded from active
execution.

## Closed decision records

- [#9 — Typed Data Pipeline](https://github.com/MauricioDMO/FrameKit/issues/9) —
  closed as not planned after #5–#8 delivered typed field inference, resolution,
  validation, editor state, and render data. The remaining
  discriminated-resolver and global last-valid-preview redesign was rejected
  without a concrete bug.
- [#10 — Legacy Compatibility](https://github.com/MauricioDMO/FrameKit/issues/10)
  — closed as not planned. The canonical contract replaces the current
  contract directly; no runtime compatibility layer or deprecation window will
  be added.
- [#11 — Source Migration Command](https://github.com/MauricioDMO/FrameKit/issues/11) —
  closed as not planned. Contract changes are documented manual source edits;
  no automatic TSX migration command will be added for this transition.
- [#16 — Version-specific 0.6 beta release](https://github.com/MauricioDMO/FrameKit/issues/16)
  — closed as not planned. No execution plan exists by design; maintainers
  choose package versions only during release preparation and apply #15 gates.

## Shared Definition of Done for active issues

Before closing each issue in the active order #12 -> #13 -> #14 -> #15,
maintainers must complete all of the following:

- code implementation and focused tests;
- English and Spanish public documentation;
- an entry in the root `CHANGELOG.md` under `Unreleased`;
- the rolling
  `Docs/en/getting-started/migration-next.md` and
  `Docs/es/getting-started/migration-next.md` guides, including an explicit
  no-migration note when the change is additive;
- updated generated starter output from `packages/create-framekit/template/`;
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
