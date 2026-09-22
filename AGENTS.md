# FrameKit Repository Instructions

## Workspace

- This is a private pnpm monorepo. Use pnpm `11.14.0` from the repository root.
- `packages/framekit/` is the public reusable runtime, editor, Studio components, CLI, codegen, and dev server.
- `packages/create-framekit/` is the public project-scaffolding CLI; its `template/` is the generated consumer project.
- `apps/studio/` is the first-party private Next.js app. `packages/create-framekit/template/` is the canonical generated consumer project.
- Put reusable consumer-facing code in `packages/framekit/src/`; keep Studio-only code in `apps/studio/src/` and scaffolding logic in `packages/create-framekit/src/`.
- The supported `@mauriciodmo/framekit` imports are `.`, `./client`, `./editor`, `./qr`, `./studio`, `./studio/root`, `./dev`, `./next`, `./server`, and `./styles.css`; do not import `packages/framekit/src/*` as a consumer.
- Repository-maintenance scripts live under root `tooling/`; package-specific build tooling stays with its owning package.

## Commands

- Install with `pnpm install --frozen-lockfile`.
- Run `pnpm dev` only from the repository root. It builds `@mauriciodmo/framekit` before starting Studio because workspace consumers resolve its built `dist/` files.
- Repository checks: `pnpm lint`, `pnpm test`, `pnpm typecheck`, and `pnpm build`.
- `pnpm lint` is the full recursive ESLint check and runs before skill synchronization in the pre-commit hook.
- Focused checks: `pnpm --filter @mauriciodmo/framekit test`, `pnpm --filter studio test`, and `pnpm --filter @mauriciodmo/create-framekit test`.
- Build a workspace with `pnpm --filter <workspace> build`; build `@mauriciodmo/framekit` before Studio or a generated consumer.
- After changing any `package.json`, run `pnpm install` at the root, then `pnpm build`.

## Tests and Imports

- Runtime tests belong under the nearest `__tests__/` directory, not beside the implementation file. Mirror the production domain below it, for example `src/core/validation/__tests__/definition/` and `src/core/validation/__tests__/fields/`.
- FrameKit compile-time contract tests live only under `packages/framekit/type-tests/`. Group them by context such as `fields/`, `templates/`, `public-api/`, and `integrations/`; do not create a generic package-level `tests/` directory.
- Browser system tests live under the repository-level `e2e/` directory and are run by Playwright.
- Keep shared runtime-test fixtures inside the relevant `__tests__/` tree. Do not place test-only helpers in production source directories.
- Vitest discovers nested `*.test.ts` and `*.test.tsx` files recursively. Do not add per-directory test configuration unless the environment genuinely differs.
- In package tests, use the configured `@/*` alias for package-local source imports instead of long `../../` chains. `@/*` maps to `src/*` in `packages/framekit/`, `packages/create-framekit/`, `apps/studio/`, and the generated template.
- Keep TypeScript and the test runner aligned when adding an alias: configure both `compilerOptions.paths` and the runner's resolver. A TypeScript-only alias is not enough at runtime.
- Use supported package imports such as `@mauriciodmo/framekit` for consumer-facing or generated-project code. Do not import `packages/framekit/src/*` from a consumer.
- Preserve the existing relative-import style in implementation code unless the package's build configuration also supports the new alias.

## Generated Files

- Linted JavaScript and TypeScript use the ESLint Standard contract: two spaces, single quotes, no semicolons, no trailing commas, and a final newline. Existing Next, TypeScript, and Tailwind rules remain active.
- Do not hand-edit `packages/framekit/dist/`, `**/.framekit/`, `**/dist/`, `**/.next/`, `**/out/`, `**/build/`, `**/public/framekit/`, or `**/src/generated/framekit/`; they are ignored build/codegen output.
- Run `framekit generate` after adding or removing template files or directories. Templates are discovered under `src/templates/**/template.tsx`.
- Run `framekit check` for definition errors; `framekit build` runs this check before the Next.js build. Run `framekit start` only after a successful build.

## Skills Synchronization

- Never edit `.agents/skills/`, `apps/studio/.agents/skills/`, or `packages/create-framekit/template/.agents/skills/` directly. Husky synchronizes these copies from `Docs/skills/` via `pnpm sync:skills` during pre-commit.
- The pre-commit hook must retain `pnpm sync:skills` and explicit staging of all synchronized skill-copy locations after the full lint passes.
- When a skill must change, edit its source under `Docs/skills/` and let synchronization regenerate the copies.

## Distribution

- Only `@mauriciodmo/framekit` and `@mauriciodmo/create-framekit` are public packages; the root and Studio are not publish targets.
- For packaging changes, run `pnpm --filter @mauriciodmo/framekit pack` and `pnpm --filter @mauriciodmo/create-framekit pack`, then follow the [generated consumer guide](https://framekit.mauriciodmo.com/en/contributors/distribution/generated-consumer/) for the external consumer smoke test.
