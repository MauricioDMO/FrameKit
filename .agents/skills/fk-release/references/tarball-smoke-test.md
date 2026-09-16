# Tarball Smoke Test

Run the canonical, version-independent script from the repository root:

```sh
node scripts/smoke-tarballs.mjs
```

Pass `--keep-temp` only when a failed run needs its temporary directory for
diagnosis. The script creates consumers outside the FrameKit checkout.

The sequence must:

1. build and pack both public packages into a fresh temporary directory;
2. inspect expected package files and reject tests, secrets, `workspace:` metadata, local `link:`/relative `file:` paths, and checkout paths;
3. install the creator tarball in a separate `npm init -y` runner and scaffold a project with `-n`;
4. replace the generated FrameKit dependency with the core tarball and run `npm install`, `npx --no-install framekit generate`, `npx --no-install framekit check`, and `npx --no-install framekit build`;
5. start the generated standalone server with `npx --no-install framekit start`, poll `http://localhost:<port>/login` until it returns successfully, exercise public and authenticated routes plus the production render handoff, and clean up the process.

The generated project must contain `src/generated/framekit/templates.ts`, and
its `.gitignore` must ignore that path. `file:` references created by the
temporary consumer are expected; neither package archive may point back to the
original workspace. The smoke also checks public export targets, the generated
consumer shape, the removed `/api/v1/images` route, and the standalone route's
render-job token behavior. It does not download a browser or run a Docker build;
those are separate gates. It does not need `NODE_EXTRA_CA_CERTS`; set that
variable only on a separate HTTPS smoke process that uses a private test CA, not
as normal consumer configuration, and keep TLS verification enabled.

## Separate Docker gate

After publication, run the registry-backed Docker smoke with the exact published
version:

```sh
pnpm smoke:docker -- <exact-published-framekit-version>
```

Its child commands receive `CI=1`. The generated Dockerfile sets
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` during dependency installation, then sets
`PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` for browser discovery and installs
Chromium's headless shell explicitly with `framekit browser install --with-deps`.
Ensure `npm`, `pnpm`, and `docker` resolve through `PATH`; these are
release-tooling requirements, not consumer application configuration.
