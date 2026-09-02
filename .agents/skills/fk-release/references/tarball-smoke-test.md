# Tarball Smoke Test

Run the complete sequence from the **Tarball Smoke Test (Manual)** section of
`Docs/en/development/testing-and-distribution.md` outside the FrameKit
repository's consumer directories. It is intentionally version-independent.

The sequence must:

1. build and pack both public packages into a fresh temporary directory;
2. inspect expected package files and reject tests, secrets, `workspace:` metadata, local `link:`/relative `file:` paths, and checkout paths;
3. install the creator tarball in a separate `npm init -y` runner and scaffold a project with `-n`;
4. replace the generated FrameKit dependency with the core tarball and run `npm install`, `npx --no-install framekit generate`, `npx --no-install framekit check`, and `npx --no-install framekit build`;
5. start the generated standalone server with `npx --no-install framekit start`, poll `http://127.0.0.1:<port>/editor` until it returns successfully, and clean up the process.

The generated project must contain `src/generated/framekit/templates.ts`, and
its `.gitignore` must ignore that path. `file:` references created by the
temporary consumer are expected; neither package archive may point back to the
original workspace.
