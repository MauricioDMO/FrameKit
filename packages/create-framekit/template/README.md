# FrameKit Project

```
pnpm dev
```

Templates live in `src/templates`. A directory containing `template.tsx`
appears automatically in the Studio editor.

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
