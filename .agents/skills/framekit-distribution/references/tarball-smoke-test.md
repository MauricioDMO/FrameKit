# Tarball Smoke Test

Run this outside the FrameKit repository.

1. Create an isolated basic consumer project.
2. Install the FrameKit tarball:

   ```sh
   pnpm add <path-to-framekit-tgz>
   ```

3. In that project, run:

   ```sh
   pnpm check
   pnpm build
   ```

4. Install the `create-framekit` tarball and run `create-framekit <new-directory>` from outside the repository.
5. In the generated project, replace its FrameKit workspace dependency with the local FrameKit tarball. Run:

   ```sh
   pnpm install
   pnpm check
   pnpm build
   ```

6. Confirm `.framekit/generated/templates.ts` was generated and is gitignored. Confirm both tarballs install and generate without errors, with no reference to the original workspace.
