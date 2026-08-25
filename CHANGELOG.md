# Changelog

## Unreleased

### Changed

- Established the versionless canonical template contract: required `meta` and
  `variants` objects, field-only `content`, typed `variant` render props, shared
  validation, and deterministic data resolution. See [plan #1](Docs/Plans/Future/issue-01-canonical-template-contract.md)
  and [GitHub issue #1](https://github.com/MauricioDMO/FrameKit/issues/1).
- Updated the Studio templates, generated starter source, public documentation,
  and focused tests to use the canonical shape. Registry metadata policy remains
  deferred to issues #12 and #13.
- Added the exact template metadata contract: required non-empty `meta.title`,
  optional functional and marketing descriptions, optional string tags, and
  rejection of unsupported metadata properties. See [plan #3](Docs/Plans/Future/issue-03-template-metadata.md)
  and [GitHub issue #3](https://github.com/MauricioDMO/FrameKit/issues/3).
