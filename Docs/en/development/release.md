# Publishing a Release

Publish the changed package or packages from the repository root with pnpm. Do not use `npm publish --workspace` or `npm publish --prefix`: this repository defines workspaces through pnpm and the npm command can fail while processing the manifest.

## Before Publishing

1. Version packages independently. Update only the package with release changes. A `create-framekit` release does not require a new `@mauriciodmo/framekit` version; keep the template dependency at the current published core version unless the template requires a new core API.

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
4. Create one release commit per version. A commit must not introduce two different package versions. Both packages may share one commit only when they are released at the exact same version:

   ```sh
   git commit -am "chore(release): publish <package> <version>"
   ```

5. Create annotated package tags. Use `framekit-v<version>` for the core package and `create-framekit-v<version>` for the CLI. Create the generic `v<version>` tag only when both packages share the same version and release commit. A synchronized release therefore has at most three tags: one generic tag and one package tag per package.

   ```sh
   git tag -a create-framekit-v<version> -m "Release create-framekit v<version>"
   git tag -a framekit-v<version> -m "Release FrameKit v<version>"
   git tag -a v<version> -m "Release v<version>"
   ```

## Publish

Publishing is a manual handoff. The assistant must not run `publish` or `git push`. Check the npm session and give the user the commands for each changed package. If both packages are being released, publish FrameKit first because the CLI's generated project depends on it:

```sh
npm whoami
# Include only the packages changed in this release.
pnpm --filter @mauriciodmo/framekit publish --access public --tag latest
pnpm --filter @mauriciodmo/create-framekit publish --access public --tag latest
```

For a prerelease, replace `latest` with the appropriate channel, such as `alpha`. Do not add `--otp` to the command. If npm requests an OTP, enter it directly in your interactive terminal.

After the publish commands finish successfully, give the user this push command; do not run it automatically:

```sh
git push origin main --follow-tags
```

---

[English](./release.md) · [Español](../../es/development/release.md)
