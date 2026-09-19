---
title: Core package API
description: Define, validate, resolve, and render FrameKit template data with the root package import.
sidebar:
  order: 2
---

**Import:** `@mauriciodmo/framekit`  
**Environment:** shared; the exported core helpers do not require a browser, and `Markdown` can render in server or client React code.

The root entrypoint owns the template contract: definition builders, field builders, validation, variant and default-value helpers, data resolution, and the `Markdown` component.

## Main exports

- `defineTemplate` and `defineTemplateBase` define the canonical template shape.
- `field` provides `text`, `color`, `number`, `image`, `choice`, and `boolean` field builders.
- `validateTemplateBase`, `validateTemplateDefinition`, and `validateTemplateData` validate definitions and resolved values.
- `resolveTemplateData`, `getVariants`, and `getDefaultValues` provide data and variant helpers.
- `Markdown` renders the supported lightweight markdown subset.
- Public types include `TemplateDefinition`, `TemplateBase`, `TemplateRegistryEntry`, `TemplateRenderProps`, `InferTemplateData`, field descriptors, asset manifests, variants, and validation errors.

## Minimal example

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Square promotion' },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({ label: 'Title' })
  },
  variants: { default: 'en' },
  content: { en: { title: 'Hello' } },
  render ({ data, width, height }) {
    return <article style={{ width, height }}>{data.title}</article>
  }
})
```

## Bundle and runtime constraints

Use this entrypoint for template source and shared helpers. It is not a replacement for the client, Studio, Next.js, or server entrypoints. The `Markdown` component supports inline formatting and optional simple lists; it is not a full CommonMark renderer.

See the [template reference](/en/users/reference/template), [create a template](/en/users/guides/create-template), and [package API index](/en/users/reference/package-api).
