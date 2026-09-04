# Issue #17 — Persisted Choice Values

- **GitHub issue:** https://github.com/MauricioDMO/FrameKit/issues/17
- **Status:** Active; GitHub issue state is authoritative.
- **Release:** No version selected; the canonical API and planned code
  restructuring remain release work for a future `1.0` decision.
- **Depends on:** #6 and the editor persistence contract used by #13.
- **Consumed by:** #13 Studio integration.

## Objective

Discard a persisted choice override when its value is no longer declared by
the current field definition, without discarding valid sibling edits or
changing the canonical resolver contract.

## Contract

- During persisted-state hydration and definition rebasing, keep a choice value
  only when it matches one of the field's current `options`.
- Remove only the stale choice key; preserve valid fields in the same variant.
- Keep valid variants and the selected variant when they still exist.
- Resolve a discarded choice from the current variant content, or from the
  field default when the content omits it.
- Preserve the existing behavior and runtime types for text, number, boolean,
  color, and image fields.
- Keep persistence at `framekit:<slug>:v2`; this additive correction requires no
  storage-version migration.
- The renderer receives the resolved current choice, never the stale value.

## Verification

- Test valid persisted choices and stale choices with valid siblings.
- Test content/default fallback after a stale override is discarded.
- Test the editor renderer receives the current resolved value.
- Test persisted image data remains valid where it belongs in the existing
  matrix.
- Run focused editor/state tests and the repository verification commands.

## Out Of Scope

- A new resolver result type, discriminated resolver, or global last-valid
  preview state; those designs were rejected by #9.
- Automatic source migration, a new storage version, or a release version.
