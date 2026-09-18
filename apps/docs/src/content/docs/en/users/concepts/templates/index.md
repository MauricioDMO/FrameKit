---
title: Templates
description: Understand how FrameKit discovers, validates, resolves, and renders code-defined templates.
sidebar:
  order: 1
  hidden: true
---

A FrameKit template is a code-defined React render function plus the metadata, dimensions, fields, content, variants, and assets that supply its inputs. Templates live under `src/templates/` and are discovered from directories containing a `template.tsx` file.

## Template concepts

- [Template definition](/en/users/concepts/templates/definition) — the required shape, metadata, dimensions, and render boundary.
- [Content and variants](/en/users/concepts/templates/content-and-variants) — template-owned content keys, labels, and data precedence.
- [Fields](/en/users/concepts/templates/fields) — the six editable field kinds and their constraints.
- [Assets](/en/users/concepts/templates/assets) — template-local images, public images, discovery, and manifests.
- [Generated registry](/en/users/concepts/templates/generated-registry) — the generated metadata and lazy loaders.
- [Rendering](/en/users/concepts/templates/rendering) — the typed values supplied to `render`.

## Authoring guides

- [Create a template](/en/users/guides/create-template) — write a complete inline definition.
- [Split a template definition](/en/users/guides/split-template-definition) — separate definition data from a more complex React component.
- [Use image assets](/en/users/guides/use-image-assets) — add common, variant, and public images.

For the complete versionless contract and validation behavior, see the [template reference](/en/users/reference/template).
