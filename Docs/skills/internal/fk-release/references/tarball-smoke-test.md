# Tarball Smoke Test

Run this outside the FrameKit repository.

1. Create an isolated basic consumer project outside this repository. Do not copy a workspace manifest that leaves `@mauriciodmo/framekit` as `workspace:*`; replace that dependency with the local core tarball before running `pnpm install`.
2. Install the FrameKit tarball:

   ```sh
   pnpm add <path-to-framekit-tgz>
   ```

3. In that project, run:

   ```sh
   pnpm check
   pnpm build
   ```

4. Create a separate minimal runner with `npm init -y`, install the `create-framekit` tarball, and run `create-framekit <new-directory>` from outside the repository. Using `npm init -y` avoids version-specific `pnpm init` metadata in the temporary runner.
5. In the generated project, replace its FrameKit dependency with the local FrameKit tarball. Run:

   ```sh
   pnpm install
   pnpm check
   pnpm build
   ```

6. Confirm `src/generated/framekit/templates.ts` was generated and is gitignored. Inspect both tarball contents for `workspace:` or references to the original repository; local `file:` references created only in the temporary consumer are expected.
