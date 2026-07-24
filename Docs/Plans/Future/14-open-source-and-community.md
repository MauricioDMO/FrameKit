# 14. Open Source and Community

## Objective

Make it easy to report bugs, propose features, contribute templates, and understand project support expectations.

## Repository files

Add and maintain:

```text
CONTRIBUTING.md
SECURITY.md
CODE_OF_CONDUCT.md
CHANGELOG.md
SUPPORT.md
```

## Issue templates

Provide forms for:

- Bug report.
- Feature request.
- Documentation problem.
- Field proposal.
- Template proposal.
- Compatibility problem.

## Field proposal requirements

Every field proposal must answer:

1. What runtime value does it represent?
2. Why can it not be modeled by an existing field?
3. What validation does it require?
4. How is it serialized?
5. How is it imported and exported?
6. What editing workflow does it require?
7. Could it be implemented as a `control` rather than a `kind`?
8. How does it behave in headless or batch export?
9. What migration risks does it introduce?

## Template contribution requirements

A contributed template should include:

- Metadata.
- Stable slug.
- Preview.
- Valid initial content.
- Licensed assets.
- Export verification.
- Supported FrameKit version.
- Short usage description.
- No unnecessary network dependencies.

## Suggested labels

```text
area:cli
area:studio
area:fields
area:templates
area:export
area:docs
area:release
area:assets
type:bug
type:feature
type:proposal
type:documentation
status:blocked
status:ready
good first issue
help wanted
breaking-change
```

## Roadmap and issues

Roadmap documents describe direction and design decisions.

Issues describe actionable units of work.

Not every roadmap paragraph should automatically become an issue.

An issue should have:

- Clear outcome.
- Defined scope.
- Dependencies.
- Completion conditions.
- Relevant plan link.

## Discussions

GitHub Discussions may be used for:

- General questions.
- Design proposals.
- Showcases.
- Template sharing.
- Adoption feedback.

Security reports should never use public discussions.

## Support policy

`SUPPORT.md` should explain:

- Supported release lines.
- How long pre-release versions receive fixes.
- Where to ask usage questions.
- What belongs in an issue.
- What is not guaranteed before 1.0.

## Security reports

`SECURITY.md` should provide:

- Private reporting method.
- Supported versions.
- Expected response process.
- Guidance against public disclosure before review.

## Completion criteria

- Users know where to report bugs and ask questions.
- Field proposals follow a strict evaluation template.
- Vulnerabilities have a private reporting path.
- Template contributions have quality requirements.
- Changelog entries match published releases.
- Issues link back to relevant roadmap plans.
