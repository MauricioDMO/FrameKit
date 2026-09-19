---
title: Adding CLI commands
description: Extend the FrameKit and create-framekit CLIs with tested syntax, usage behavior, and consumer validation.
---

# Adding CLI commands

FrameKit publishes two binaries with different owners and argument contracts.
Change the parser, dispatch, usage text, tests, and consumer path together.

## Know both CLIs

| Binary | Source and build entry | Current command shape |
| --- | --- | --- |
| `framekit` | `packages/framekit/src/tooling/cli/index.ts` -> `dist/cli.js`, wrapped by `bin/framekit.js` | `generate`, `check`, `dev`, `build`, `start`, and `browser install [--with-deps]` |
| `create-framekit` | `packages/create-framekit/src/cli.ts` -> `dist/cli.js` | <code>[project-directory] [-y&#124;-n]</code> and `update-skills [project-directory]` |

The FrameKit CLI uses `process.cwd()` as the project root and rejects extra
arguments. Its browser command delegates to the package-owned Playwright CLI.
The creator parses one optional project directory and the `-y` or `-n` answer;
`update-skills` accepts an optional project directory of its own.

## Update a command safely

1. Define the accepted arguments, invalid forms, exit behavior, and usage text
   before changing dispatch.
2. Update the owning parser and command branch. Keep project filesystem work in
   the command helper rather than duplicating it in the parser.
3. Keep the package manifest binary and build entry aligned. Run the package
   build so the command is tested through its built output as well as its
   source.
4. Update the relevant user-facing CLI reference when the public syntax
   changes, without changing the contributor workflow into a second API
   reference.

## Test syntax and behavior

For `framekit`, the spawn-based suite at
`packages/framekit/src/tooling/cli/__tests__/cli.test.ts` covers missing,
unknown, and extra arguments, invalid browser forms, command failures, and
successful generation, checking, and start behavior. Browser delegation has
focused coverage in `browser.test.ts`; runtime requirements have coverage in
`runtime.test.ts`.

For `create-framekit`, keep project-helper coverage in
`packages/create-framekit/src/__tests__/cli.test.ts` and runtime-version
coverage in `runtime.test.ts`. Add explicit parser and usage cases whenever a
creator command or option changes. Cover accepted forms, conflicting or
unknown options, missing directories, exit codes, and the message shown to the
user. If the parser stays private, test it through the exported `main` or the
built binary rather than weakening the public command contract.

Run the focused suites from the repository root:

```bash
pnpm --filter @mauriciodmo/framekit exec vitest run src/tooling/cli
pnpm --filter @mauriciodmo/create-framekit test
```

## Validate a real consumer

A CLI test that runs in a temporary directory is useful, but it does not prove
that the packed binaries, manifest targets, and generated consumer agree. For
changes to either public CLI, run:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm smoke:tarballs
```

The tarball smoke creates isolated consumers, installs the packages, resolves
public exports, runs `create-framekit`, and exercises the generated project's
`framekit generate`, `check`, `build`, and `start` commands. Run
`pnpm test:e2e` as well when the command changes browser-facing behavior.
