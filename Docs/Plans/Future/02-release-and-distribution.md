# 02. Release and Distribution

## Objective

Publish reproducible and verifiable releases without relying on long-lived npm tokens or fragile manual procedures.

## Main decisions

- Node.js 22 should be the minimum supported workspace runtime.
- The exact minimum Node.js version must be compatible with the selected pnpm version.
- npm publishing should use Trusted Publishing with OIDC.
- Releases should be created from Git tags or an approved release workflow.
- Package versions should remain coordinated while they share a tightly coupled contract.
- Manual publishing should remain documented only as a recovery path.
- A package should not be promoted to `latest` until installation from the public registry is verified.

## Scope

### Runtime compatibility

Align `engines` across:

- Workspace root.
- Main package.
- Project creator.
- Generated project template.
- Documentation.
- CI matrix.

The repository must not claim support for a runtime that the package manager or generated project cannot use.

### Version management

Adopt Changesets or an equivalent process for:

- Recording user-visible changes.
- Selecting version increments.
- Coordinating package versions.
- Generating changelogs.
- Preparing release pull requests.
- Creating pre-release versions.

### npm distribution tags

Define explicit use of:

- `alpha`
- `beta`
- `next`
- `latest`

Suggested policy:

- `alpha`: incomplete or rapidly changing contracts.
- `beta`: feature-complete release candidate with known limitations.
- `next`: optional preview line for upcoming stable behavior.
- `latest`: recommended production version.

### Publishing workflow

The release workflow should:

1. Check out the exact release commit.
2. Install dependencies using the lockfile.
3. Run workspace verification.
4. Build every publishable package.
5. Inspect tarball contents.
6. Publish with npm provenance.
7. Create or update the GitHub Release.
8. Attach release notes.
9. Verify that npm exposes the expected version and dist-tag.
10. Run a registry-based smoke installation.

### Package content verification

For each package, verify:

- Expected executable files.
- Built JavaScript.
- Type declarations.
- CSS output where applicable.
- README.
- License.
- No source-only test fixtures.
- No local build directories.
- No secrets.
- No generated consumer files that do not belong in the package.

### Rollback and recovery

Document:

- How to deprecate a broken npm version.
- How to move dist-tags.
- How to republish a corrected version.
- How to verify whether a failure is in npm, CI, or the package.
- Why already published versions must not be overwritten.

## Out of scope

- Automatic deployment of user projects.
- Hosting Studio as a required SaaS.
- Supporting every active Node.js version.

## Completion criteria

- A release can be initiated through the documented versioning process.
- No permanent npm token is required in GitHub Secrets.
- Changelogs are produced consistently.
- Published packages contain only expected files.
- Installation is verified from npm, not only from the monorepo.
- Broken releases can be deprecated and removed from recommended tags.
