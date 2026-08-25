# FrameKit Project

```
pnpm dev
```

Templates live in `src/templates`. A directory containing `template.tsx`
appears automatically in the Studio editor.

FrameKit projects require Node.js `>=22.13.0`. Use pnpm `>=11.14.0` or npm 10
or later to install dependencies.

Shared public company information can live in `src/profile.ts`. The file is
intentionally flexible and can export any clear structure; template authors
should read its comments and ask which values to show when there are multiple
contact options.

Template definitions use an exact `meta` object, `variants`, and field-only
`content` entries. `meta.title` is required; optional metadata is limited to
`description`, `marketingDescription`, and `tags`. A missing title is invalid and
is never derived from the template directory.
Template images live beside the template in `assets/common` or in a directory
named after a content variant. Variant image files use the field key as their
filename. Shared project images belong in `public/assets/<category>` and can be
referenced by an image field with a root-relative value such as
`/assets/logos/brand.svg`.

The included example template uses the inline pattern with `defineTemplate`.
For complex layouts, see the extracted definition pattern with
[`defineTemplateBase`](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/guides/template-authoring.md#extracted-definition).

## Available commands

- `pnpm dev` — start the development server
- `pnpm check` — validate all templates
- `pnpm build` — validate and build for production
- `pnpm start` — start the production server

## Documentation

- [Documentation](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/README.md)
- [Documentación](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/es/README.md)
