# Issue #2 — Runtime Requirements

- **GitHub issue:** https://github.com/MauricioDMO/FrameKit/issues/2
- **Status:** Completed baseline.
- **Release:** No version preselected; this plan records the existing baseline.

## Objective

Record and preserve the runtime versions already enforced consistently by the
workspace, published packages, project starter, creator CLI, and CI.

## Current baseline

- The root workspace and the public packages declare Node.js `>=22.13.0` and
  pnpm `>=11.14.0` in their manifests.
- The generated project template declares the same engines.
- The creator checks the current Node.js runtime and checks pnpm when pnpm is
  selected. The FrameKit CLI checks Node.js and an explicitly detected pnpm
  user agent.
- `scripts/check-runtime-contract.mjs` verifies manifest and documentation
  consistency and checks `.github/workflows/ci.yml`.
- CI tests Node.js `22.13.0` and `24`, uses pnpm `11.14.0`, runs the runtime
  contract check, and then installs, builds, lints, tests, type-checks, and
  packages the public workspaces.
- The creator documentation also describes npm 10.x or later as an alternative
  package manager. There is no `engines.npm` declaration or npm version
  assertion; this baseline therefore does not claim machine-enforced npm
  support beyond that documented alternative.

## Agreed public contract

- Supported Node.js runtime: `>=22.13.0`.
- Supported pnpm runtime: `>=11.14.0`.
- CI minimum coverage: Node.js `22.13.0` and `24`, with pnpm `11.14.0`.
- All checked manifests, runtime guards, CI configuration, and checked runtime
  documentation must agree with those values.
- npm remains a documented creator alternative only; do not silently turn its
  documented version into a manifest or runtime contract in this issue.

## Ordered implementation steps

This issue is complete. The maintenance sequence for the completed baseline is:

1. Keep the root, public package, and generated-project engine declarations
   aligned.
2. Keep CLI/creator runtime guards and `check:runtime` aligned with those
   declarations.
3. Keep CI's Node.js matrix and pnpm setup aligned, then run the full checks
   before changing any runtime requirement.
4. If a future issue changes the baseline, update manifests, guards, CI,
   English docs, Spanish docs, and the migration/changelog records together;
   do not change only one package.

## Documentation and migration requirements

The baseline is already documented in English and Spanish. Any future runtime
change must update all checked runtime documentation and the rolling migration
guides in both languages. This completed issue does not require a new
migration entry by itself.

## Verification

- `pnpm check:runtime`
- Inspect the engine fields in the root, public package, and starter manifests.
- Confirm CI uses the declared Node.js matrix and pnpm version.
- Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm typecheck`, and
  `pnpm build` when changing the baseline.

## Completion criteria

- The documented and machine-checked baseline is Node.js `>=22.13.0` and pnpm
  `>=11.14.0`.
- CI covers Node.js 22 and 24 with pnpm 11.14.0.
- The runtime contract check passes.

## Out of scope

- Selecting a future release version; issue #16 is obsolete.
- Compatibility policy or migration design; issue #10 is obsolete.
- Raising or lowering the runtime baseline without a new, explicitly scoped
  issue.
