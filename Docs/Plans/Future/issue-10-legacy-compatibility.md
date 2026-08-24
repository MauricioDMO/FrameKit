# Issue #10 — Legacy Compatibility

- **GitHub issue:** https://github.com/MauricioDMO/FrameKit/issues/10
- **Status:** Closed as not planned; GitHub issue state is authoritative.
- **Release:** Not applicable.

## Decision

FrameKit will replace the current template contract directly with the canonical
contract defined by issues #1 and #3–#9. It will not add a runtime compatibility
layer for earlier `0.x` contracts.

The current locale/language, textarea, plural field factory, and string-number
behavior is the implementation being replaced, not a second supported input
format. Keeping it after the canonical contract lands would create two public
models without a user or persisted-data requirement.

## Consequences

- `defineTemplate`, `defineTemplateBase`, `framekit check`, Studio, codegen, and
  future server rendering accept only the canonical contract after the owning
  issues are implemented.
- There is no legacy normalizer, compatibility matrix, deprecation diagnostic
  family, removal timeline, alias, fallback, or coercion path.
- Issue #3 requires metadata directly; #4 replaces locale/language terminology
  and ignores `framekit:<slug>:v1`; #5 removes textarea and the plural field
  namespace; #8 rejects numeric strings; #9 rejects unknown or invalid data.
- Breaking author changes are documented in the English and Spanish rolling
  `migration-next.md` guides by their owning implementation issues.
- Issue #11 rejects source migration automation for this transition. Manual
  source updates do not depend on runtime compatibility or diagnostics.
- A future versioned portable-document format may define its own migration
  policy. That is separate from current template and localStorage compatibility.

## Closure steps

1. Record this decision in the execution index and affected conceptual plans.
2. Replace the GitHub issue proposal with this decision and links to the owning
   execution plans.
3. Close issue #10 as `not planned`.

No runtime implementation, public documentation update, changelog entry,
migration-guide entry, generated artifact, or release assignment is required
for this closure-only issue.

## Verification owned by active issues

The active plans must test the absence of the rejected compatibility behavior:

- #3: definitions without canonical metadata do not receive a fallback.
- #4: locale/language aliases are rejected and localStorage `v1` is ignored.
- #5: plural `fields` and `textarea` APIs are absent.
- #8: string numeric defaults and values are rejected.
- #9: unknown fields/variants, invalid types, and coercion are rejected.

## Out of scope

- Implementing `framekit migrate`; the #11 closure rejects it for this
  transition.
- Migrating localStorage or preserving earlier template contracts.
- Stable legacy diagnostic codes or deprecation periods.
- Future portable-document schema migration.
- Selecting a release version.
