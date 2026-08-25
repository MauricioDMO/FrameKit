# Issue #3 — Template Metadata

- **GitHub issue:** https://github.com/MauricioDMO/FrameKit/issues/3
- **Status:** Active; GitHub issue state is authoritative.
- **Release:** No version preselected.

## Objective

Make every template self-describing through one small, validated `meta`
object, without moving catalog policy into the template contract.

## Current baseline

- `TemplateBase` and `TemplateDefinition` have no `meta` property in
  `packages/framekit/src/types.ts`.
- `validateTemplateBase` validates dimensions, fields, and content but has no
  metadata validation.
- Current starter templates have no metadata object.
- Generated registry entries currently derive `title` from the filesystem
  slug in `packages/framekit/src/codegen/create-template-module.ts`.
- The older roadmap proposal included `order`, `keywords`, `status`, and
  `revision`; those properties are not part of this execution contract.

## Agreed public contract

Every template definition must contain:

```tsx
meta: {
  title: 'Square promotion',
  description: 'A promotional image for discounts and product offers',
  marketingDescription: 'Present the offer, show its price, and motivate the customer to buy',
  tags: ['social', 'promotion'],
}
```

Contract rules:

- `meta.title` is required and must be a non-empty string.
- `meta.description` is optional and, when present, is a string.
- `meta.marketingDescription` is optional and, when present, is a string. It
  describes the concrete communication goal: for example, presenting a
  service, explaining prices, highlighting benefits, or motivating an action.
- `meta.tags` is optional and, when present, is an array of strings.
- `meta` accepts only `title`, `description`, `marketingDescription`, and
  `tags`; any other metadata property is invalid.
- The contract contains no `revision`, `status`, `keywords`, or `order`.
- There is no slug fallback and no compatibility alias: a definition without
  a valid `meta.title` fails validation rather than deriving one from its
  directory name or accepting an older property.
- Slug and folder hierarchy remain filesystem concerns. Registry summaries and
  Studio metadata consumption are explicitly deferred to #12/#13.

## Ordered implementation steps

1. Add the public metadata type to `packages/framekit/src/types.ts` and make
   it required on `TemplateBase`/`TemplateDefinition` and their typed input.
2. Extend `validateTemplateBase`/`validateTemplateDefinition` to validate the
   exact four-property contract and reject missing, malformed, or unsupported
   metadata properties. Preserve the existing actionable validation errors.
3. Add `meta` to every current template in the implementation scope,
   including `packages/create-framekit/template/src/templates/example/template.tsx`.
   Do not use directory-derived titles to satisfy the contract.
4. Update type tests and runtime validation tests for required title, optional
   description/marketing description/tags, invalid values, and rejection of
   `revision`, `status`, `keywords`, and `order`.
5. Leave generated registry summaries and Studio metadata rendering unchanged;
   add only the contract data needed for #12/#13 to consume later.
6. Apply the shared Definition of Done below, including both language docs,
   changelog/migration records, generated starter output, and plan/issue
   links.

## Documentation and migration requirements

Update English and Spanish template-authoring and template-contract/API docs
   with the exact `meta` shape, the distinction between the functional and
   marketing descriptions, and the no-fallback rule. Document the required
template updates in both rolling migration guides. Because adding a required
property to existing definitions is not additive for template authors, the
migration note must include the explicit `meta.title` update; no release
version is named.

## Verification

- `pnpm --filter @mauriciodmo/framekit test`
- `pnpm --filter @mauriciodmo/framekit typecheck`
- `pnpm --filter @mauriciodmo/framekit build`
- `pnpm test`, `pnpm typecheck`, and `pnpm build`
- `pnpm check:runtime`
- Run `framekit check` on the generated starter and verify a missing or
  malformed `meta` object fails with the expected validation error.

## Completion criteria

- Every current template validates with a required `meta.title`.
- Only `title`, `description`, `marketingDescription`, and `tags` are accepted
  by the public metadata contract.
- No slug fallback, compatibility alias, registry-summary change, or Studio
  metadata-consumption change is introduced.
- Tests, both public-language docs, migration/changelog records, generated
  starter output, and links satisfy the shared Definition of Done.

## Shared Definition of Done

For this active issue: code implementation, tests, English and Spanish public docs,
root `CHANGELOG.md` under `Unreleased`, rolling English and Spanish
`migration-next.md` guides, generated starter output, and plan/issue links
are required. The migration guides must explicitly describe the required
`meta.title` update; the no-migration note applies only to additive changes.

## Out of scope

- `revision`, `status`, `keywords`, `order`, or any other metadata property.
- Slug fallback or compatibility aliases.
- Registry summaries, generated catalog title selection, and Studio metadata
  consumption; those belong to #12/#13.
- Preview generation, catalog search, sorting, or filtering.
