# 04. Template Contract and Metadata

## Objective

Make every template self-describing and catalog-ready without introducing parallel configuration files or manual registries.

## Filesystem contract

The directory path remains the source of the template slug.

```text
src/templates/social/instagram/post/template.tsx
```

Produces:

```text
social/instagram/post
```

A directory without `template.tsx` is a category.

A directory containing `template.tsx` is a template boundary, and its internal files are private implementation details.

## Proposed metadata

```tsx
export default defineTemplate({
  meta: {
    title: 'Square promotion',
    description: 'A promotional image for discounts and product offers',
    tags: ['social', 'instagram', 'promotion'],
    order: 10,
  },

  width: 1080,
  height: 1080,
  fields: {},
  content: {},
  render() {},
})
```

## Metadata properties

### `title`

Human-readable name displayed in Studio.

It should become required under the new contract.

### `description`

Short explanation of the template's purpose.

It should describe when to use the template, not provide a full tutorial.

### `tags`

Cross-cutting classification.

Examples:

- `instagram`
- `story`
- `promotion`
- `product`
- `dark`
- `minimal`

Primary hierarchy still comes from folders.

### `order`

Controls ordering within a category.

Alphabetical title order is the fallback and tie-breaker.

### `keywords`

Optional search-only terms that should not necessarily appear as visible tags.

### `status`

Optional author-facing state:

```text
draft
ready
deprecated
```

Draft templates may be hidden from production catalogs while remaining available during development.

## Preview behavior

The default preview should be generated automatically using:

- The first content variant.
- Initial resolved values.
- Declared dimensions.
- A thumbnail export scale.

A custom preview should only be needed when automatic rendering is not representative.

Generated previews should be cacheable and invalidated when the template or relevant assets change.

## Content variants

The current term `locale` can be too narrow because variants may represent language, campaign, customer, or channel.

Proposed normalized contract:

```tsx
content: {
  es: {
    label: 'Español',
    title: 'Oferta',
  },
  en: {
    label: 'English',
    title: 'Sale',
  },
}
```

Conceptual changes:

- `language` becomes `label`.
- `locale` becomes `variant`.
- Variant keys remain arbitrary strings.
- Studio may display “Language” when the template declares language semantics.
- Studio displays “Variant” by default.

During the 0.x line, `language` may remain supported as a compatibility alias.

## Optional variant metadata

A template may declare:

```tsx
variants: {
  mode: 'language',
  default: 'es',
}
```

Possible modes:

- `language`
- `campaign`
- `client`
- `custom`

This affects Studio labels only. It does not change how data is resolved.

## Metadata that should not enter the core contract

Avoid platform-specific properties such as:

```text
instagramType
facebookPlacement
youtubeFormat
```

Those concepts should be represented through tags, presets, or external collections.

## Template revision

Templates may expose an integer revision:

```tsx
meta: {
  revision: 2,
}
```

This allows stored documents to detect that their source template changed.

The revision does not replace package versions.

## Completion criteria

- Studio can display titles, descriptions, tags, and status without external config files.
- Slugs remain derived from the filesystem.
- Categories are not duplicated in metadata.
- Previews can be generated automatically.
- Content variants are no longer incorrectly limited to language semantics.
- Existing templates have a documented migration path.
- Stored documents can detect template revisions.
