# Publishing a Release

Publish both packages from the repository root with pnpm. Do not use `npm publish --workspace` or `npm publish --prefix`: this repository defines workspaces through pnpm and the npm command can fail while processing the manifest.

## Before Publishing

1. Update both package versions and the `create-framekit` template dependency:

   - `packages/framekit/package.json`
   - `packages/create-framekit/package.json`
   - `packages/create-framekit/template/package.json`

2. Run the release gate:

   ```sh
   pnpm lint
   pnpm test
   pnpm typecheck
   pnpm build
   pnpm --filter @mauriciodmo/framekit pack
   pnpm --filter @mauriciodmo/create-framekit pack
   ```

3. Perform the [tarball smoke test](testing-and-distribution.md#tarball-smoke-test-manual).
4. Commit the version change and create an annotated tag, for example:

   ```sh
   git commit -am "chore(release): publish 0.5.0"
   git tag -a v0.5.0 -m "Release v0.5.0"
   ```

## Publish

Check the npm session and publish FrameKit first because the CLI's generated project depends on it:

```sh
npm whoami
pnpm --filter @mauriciodmo/framekit publish --access public --tag latest
pnpm --filter @mauriciodmo/create-framekit publish --access public --tag latest
```

For a prerelease, replace `latest` with the appropriate channel, such as `alpha`.

After both commands finish successfully, push the commit and tag:

```sh
git push origin main --follow-tags
```

---

[English](./release.md) · [Español](../../es/development/release.md)
