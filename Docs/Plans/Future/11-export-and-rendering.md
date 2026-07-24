# 11. Export and Rendering

## Objective

Produce correct, configurable, and verifiable output files.

## Export preflight

Before export, FrameKit should verify:

- Resolved field data is valid.
- Fonts have loaded.
- Images have loaded.
- Remote resources are export-compatible.
- Dimensions are valid.
- The target canvas is not tainted.
- Template rendering did not throw.
- Required assets are available.
- The selected format supports the requested transparency behavior.

Export should stop when the result may be incomplete.

## Error categories

Distinguish:

- Data validation failure.
- Missing asset.
- Image load failure.
- Font load failure.
- CORS failure.
- Unsupported browser capability.
- Rendering exception.
- Encoding failure.
- Download failure.

Each error should identify the relevant field, resource, or template when possible.

## Formats

Priority:

1. PNG.
2. JPEG.
3. WebP.

SVG remains out of scope initially because arbitrary React and DOM output cannot be reliably converted to meaningful SVG.

## Export options

Initial options:

- Scale 1x, 2x, and 3x.
- JPEG and WebP quality.
- Transparent background when supported.
- Custom file name.
- Automatic file naming.
- Export current variant.
- Export all variants.
- Export multiple selected templates to ZIP.

## Naming

Suggested default:

```text
<template-slug>-<variant>-<width>x<height>.<format>
```

Names should be sanitized and collision-safe.

## Output dimensions

The exported file must use declared template dimensions multiplied by the selected scale.

Preview zoom must never affect export dimensions.

## Batch export

Batch export should:

- Validate every selected output first or clearly report partial completion.
- Limit concurrency.
- Show progress.
- Allow cancellation.
- Produce a summary of successful and failed outputs.
- Create deterministic file names.

## Headless export

A future CLI command may support:

```bash
framekit export \
  --template social/instagram/post \
  --variant es \
  --data campaign.json \
  --output ./exports
```

This requires a reproducible headless rendering contract.

It should not be added until:

- Browser export is stable.
- Fonts and assets can be loaded deterministically.
- Template code can run in the selected headless environment.
- Failures can be reported clearly.

## Server rendering

Server-side rendering should remain optional.

Possible future use cases:

- Automated campaign generation.
- API-based image rendering.
- Scheduled exports.
- Bulk production.

A server renderer must not become a dependency for local Studio use.

## Completion criteria

- Export never continues silently with failed resources.
- Output dimensions match declared dimensions and scale.
- PNG, JPEG, and WebP work with documented options.
- Batch output uses deterministic names.
- Errors identify the responsible resource or field.
- Preview zoom does not affect export.
