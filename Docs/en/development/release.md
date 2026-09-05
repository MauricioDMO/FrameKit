# Publishing a Release

Publish the changed package or packages from the repository root with pnpm. Do not use `npm publish --workspace` or `npm publish --prefix`: this repository defines workspaces through pnpm and the npm command can fail while processing the manifest.

This page is a release procedure, not a release record. It does not confirm
that versions, commits, tags, local checks, CI, smoke tests, or publication have
already happened. The latest [CI run 33948285021](https://github.com/MauricioDMO/FrameKit/actions/runs/33948285021)
passed Ubuntu, Windows, and Chromium. The pre-publication tarball smoke passed
for both isolated consumer paths; its result is recorded in [GitHub issue
#15](https://github.com/MauricioDMO/FrameKit/issues/15). The post-publication
registry smoke remains pending until published packages are available and the
check passes.

## Before Publishing

Use Node.js `>=22.13.0` and pnpm `>=11.14.0` for release work. Verify the
repository contract before running the release gate:

```sh
pnpm check:runtime
```

1. During release preparation, version packages independently. Update only the package with release changes. The version placeholders below do not assign or confirm a completed version. A `create-framekit` release does not require a new `@mauriciodmo/framekit` version; keep the template dependency at the current published core version unless the template requires a new core API.

2. Run the local release gate:

   ```sh
   pnpm --filter @mauriciodmo/framekit build
   pnpm --filter @mauriciodmo/create-framekit build
   pnpm lint
   pnpm test
   pnpm typecheck
   pnpm build
   pnpm --filter @mauriciodmo/framekit pack
   pnpm --filter @mauriciodmo/create-framekit pack
   ```

3. Perform the [pre-publication tarball smoke test](testing-and-distribution.md#pre-publication-tarball-smoke-test). Use the canonical script; the manual creator-path sequence is optional. Do not publish until this local gate passes.
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

Publishing is a manual handoff. The assistant must not run `publish` or `git push`.
Check the npm session and give the user the commands for each changed package.
To keep the post-publication registry gate before final promotion, publish with
a release-time tag that is not the final promotion tag; this guide does not
select that tag or any package version. If both packages are being released,
publish FrameKit first because the CLI's generated project depends on it:

```sh
npm whoami
: "${PUBLISH_TAG:?Set the release-time npm dist-tag}"
# Include only the packages changed in this release.
pnpm --filter @mauriciodmo/framekit publish --access public --tag "$PUBLISH_TAG"
pnpm --filter @mauriciodmo/create-framekit publish --access public --tag "$PUBLISH_TAG"
```

Do not add `--otp` to the command. If npm requests an OTP, enter it directly
in your interactive terminal. After the packages are available, run the
[post-publication npm registry smoke](testing-and-distribution.md#post-publication-npm-registry-smoke-manual-pending-before-promotion)
with exact `CORE_SPEC`, `CREATOR_SPEC`, and `EXPECTED_DIST_TAG` values supplied
during release preparation. A failure blocks promotion, not the initial upload;
record the resolved versions and runtime as described by that check.

After the post-publication smoke passes, the user may promote each released package to its final
dist-tag with `npm dist-tag add <package>@<resolved-version> <final-dist-tag>`.
Use only the packages released in this handoff and the versions returned by the
registry smoke.

After the publish commands finish successfully, give the user this push command; do not run it automatically:

```sh
git push origin main --follow-tags
```

---

[English](./release.md) · [Español](../../es/development/release.md)
