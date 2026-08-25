# Rolling Migration Guide

This guide records the next versionless migration work. No release version has
been selected yet.

## Canonical Template Contract

Issue [#1](https://github.com/MauricioDMO/FrameKit/issues/1) establishes one
template shape for Studio and the future server-rendering boundary. Update each
template definition to include:

```tsx
export default defineTemplate({
  meta: { title: 'Template title' },
  width: 1200,
  height: 630,
  fields: { title: fields.text({ label: 'Title' }) },
  variants: { default: 'en', labels: { en: 'English' } },
  content: { en: { title: 'Hello' } },
  render({ data, assets, variant, width, height }) {
    return <article style={{ width, height }}>{data.title}</article>
  },
})
```

Required source changes:

- add the `meta` and `variants` objects;
- move display names to `variants.labels`;
- remove entry-level `language` properties; content entries contain field values only;
- rename the render input from `locale` to `variant`;
- remove any unsupported top-level version or alternate contract property;
- run `framekit generate`, `framekit check`, and `framekit build`.

This is a breaking template-source change. There is no compatibility alias or
automatic migration command. The exact metadata refinements and later field
changes are tracked separately in the future execution plans.

See the [canonical contract plan](../../Plans/Future/issue-01-canonical-template-contract.md)
and the [template contract reference](../reference/template-contract.md).
