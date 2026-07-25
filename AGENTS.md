# FrameKit Repository Instructions

## Workspace

- This is a private pnpm monorepo. Use pnpm `11.14.0` from the repository root.
- `packages/framekit/` is the public reusable runtime, editor, Studio components, CLI, codegen, and dev server.
- `packages/create-framekit/` is the public project-scaffolding CLI; its `template/` is the generated consumer project.
- `apps/studio/` is the first-party private Next.js app. `examples/basic/` is the consumer-style distribution harness.
- Put reusable consumer-facing code in `packages/framekit/src/`; keep Studio-only code in `apps/studio/src/` and scaffolding logic in `packages/create-framekit/src/`.
- The supported `@mauriciodmo/framekit` imports are `.`, `./editor`, `./studio`, `./studio/root`, `./dev`, and `./styles.css`; do not import `packages/framekit/src/*` as a consumer.

## Commands

- Install with `pnpm install --frozen-lockfile`.
- Run `pnpm dev` only from the repository root. It builds `@mauriciodmo/framekit` before starting Studio because workspace consumers resolve its built `dist/` files.
- Repository checks: `pnpm lint`, `pnpm test`, `pnpm typecheck`, and `pnpm build`.
- Focused checks: `pnpm --filter @mauriciodmo/framekit test`, `pnpm --filter studio test`, and `pnpm --filter @mauriciodmo/create-framekit test`.
- Build a workspace with `pnpm --filter <workspace> build`; build `@mauriciodmo/framekit` before Studio or the example.
- After changing any `package.json`, run `pnpm install` at the root, then `pnpm build`.

## Generated Files

- Do not hand-edit `packages/framekit/dist/`, `**/.framekit/`, or `**/src/generated/framekit/`; they are ignored build/codegen output.
- Run `framekit generate` after adding or removing template files or directories. Templates are discovered under `src/templates/**/template.tsx`.
- Run `framekit check` for definition errors; `framekit build` runs this check before the Next.js build. Run `framekit start` only after a successful build.

## Skills Synchronization

- Never edit `.agents/skills/` or `packages/create-framekit/template/.agents/skills/` directly. Husky synchronizes these copies from `Docs/skills/` via `pnpm sync:skills` during pre-commit.
- When a skill must change, edit its source under `Docs/skills/` and let synchronization regenerate the copies.

## Distribution

- Only `@mauriciodmo/framekit` and `@mauriciodmo/create-framekit` are public packages; the root, Studio, and example are not publish targets.
- For packaging changes, run `pnpm --filter @mauriciodmo/framekit pack` and `pnpm --filter @mauriciodmo/create-framekit pack`, then follow `Docs/en/development/testing-and-distribution.md` for the external consumer smoke test.
