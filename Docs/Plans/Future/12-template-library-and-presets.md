# 12. Template Library and Presets

## Objective

Allow users to start from high-quality examples without shipping a large template catalog inside the core package.

## Distribution model

The core package should not contain a large library.

Templates should be distributed through:

- Official repository.
- Separate npm package.
- `framekit add`.
- Starter selection during `create-framekit`.
- Organization-owned packages.

## Initial collections

### Social starter

Possible templates:

- Square post.
- Portrait post.
- Story.
- Horizontal banner.
- Thumbnail.
- Quote.
- Promotion.

### Business starter

Possible templates:

- Product offer.
- Service announcement.
- Testimonial.
- Price list card.
- Event notice.
- Recruitment post.

### Minimal starter

Examples focused on learning:

- Basic text.
- Number and slider.
- Choice field.
- Boolean field.
- Color field.
- Image field.
- Multiple variants.
- Extracted artwork component.

## Official template requirements

Every official template should include:

- Complete metadata.
- Stable slug.
- Generated preview.
- Valid initial values.
- Type-safe fields.
- Verified export.
- Licensed assets.
- No unnecessary remote requests.
- Short usage notes.
- Supported FrameKit version range.
- Template revision.

## Collection manifest

A collection may include:

```ts
type FrameKitCollection = {
  name: string
  version: string
  description?: string
  framekitRange: string
  templates: Array<{
    source: string
    targetSlug: string
  }>
}
```

The exact format should remain simple and reviewable.

## Installation behavior

`framekit add` should:

- Resolve the collection.
- Show source and version.
- Warn when code will be installed.
- Check target conflicts.
- Copy templates and assets.
- Avoid overwriting without approval.
- Run generation and validation.
- Print installed slugs.

## Dimension presets

Common sizes may be provided as helpers:

```tsx
import { sizes } from '@mauriciodmo/framekit/presets'

defineTemplate({
  ...sizes.square,
})
```

Presets should remain generic and should not prevent custom dimensions.

Possible presets:

```text
square
portrait
story
landscape
thumbnail
banner
```

Platform-specific aliases may live in a separate preset package.

## Brand collections

Organizations may publish private or public collections containing:

- Brand colors.
- Fonts.
- Shared artwork.
- Templates.
- Field conventions.
- Asset restrictions.

FrameKit should not require a centralized marketplace to support this.

## Security

Template packages contain executable code.

Installation must clearly communicate trust expectations.

## Completion criteria

- `create-framekit` can select a starter.
- `framekit add` installs templates without altering unrelated files.
- Official templates do not increase core package size.
- Every official template has preview and license information.
- Presets remain generic.
- Collection compatibility is checked before installation.
