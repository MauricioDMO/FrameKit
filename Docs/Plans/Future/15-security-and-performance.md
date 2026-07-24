# 15. Security and Performance

## Objective

Document trust boundaries and prevent templates, assets, imported files, or CLI operations from damaging user projects or producing unreliable output.

## Trust model

A FrameKit template is React code and can execute JavaScript.

Therefore:

- Templates should only be installed from trusted sources.
- FrameKit should not claim to sandbox untrusted templates unless a real isolation boundary exists.
- Template packages have the same trust implications as other npm dependencies.
- A public demo should execute only reviewed templates.
- Imported document data must never be treated as executable code.

## CLI security

Protect against:

- Path traversal.
- Writes outside the selected project.
- Accidental overwrite.
- Malicious package or collection names.
- Unnecessary shell execution.
- Unexpected symbolic links.
- Oversized files.
- Unsafe archive extraction.
- Command injection.
- Untrusted lifecycle scripts where avoidable.

CLI operations should:

- Resolve real paths.
- Verify destination boundaries.
- Show overwrite plans.
- Use child processes without a shell when possible.
- Validate archive entries before extraction.

## Asset security

Protect against:

- False MIME declarations.
- Active SVG content.
- Excessive file size.
- Excessive image dimensions.
- ZIP bombs.
- Non-HTTP(S) remote URLs.
- Unexpected remote tracking.
- Canvas tainting.
- Missing cleanup of Object URLs.
- Corrupted imported data.

## Remote resources

Studio should make remote dependencies visible.

A template or document using remote assets should be able to report:

- Host.
- Resource type.
- Load status.
- Export compatibility.

Privacy-sensitive deployments may disable remote resources entirely.

## Performance targets

Measure:

- Studio startup time.
- Catalog generation time.
- Template load time.
- Preview generation time.
- Memory use.
- Export duration.
- Behavior with one hundred or more templates.
- Behavior with large images.
- Generated registry size.
- Published package size.

## Performance strategies

Possible strategies:

- Lazy-load templates.
- Lazy-load previews.
- Cache previews.
- Virtualize large lists when needed.
- Debounce persistence.
- Limit preview concurrency.
- Release object URLs and large buffers.
- Avoid rerendering the entire shell for field-local changes.
- Memoize resolved metadata where safe.
- Split heavy optional features.

## Resource limits

Define defaults for:

- Maximum local image size.
- Maximum imported archive size.
- Maximum extracted archive size.
- Maximum image dimensions.
- Maximum number of batch exports.
- Maximum concurrent preview jobs.
- Maximum retained undo history.

Limits should be configurable but safe by default.

## Dependency security

Maintain:

- Lockfile.
- Automated dependency updates.
- Dependency review for pull requests.
- npm provenance.
- Documented response to compromised dependencies.
- Minimal runtime dependency surface.

## Completion criteria

- The trust model is documented.
- CLI writes remain inside the intended destination.
- Imported archives are safely validated.
- Studio rejects or warns about dangerous assets.
- Previews load on demand.
- Baseline performance measurements exist.
- Resource limits prevent obvious memory and storage abuse.
