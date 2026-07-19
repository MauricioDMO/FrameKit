# FrameKit

React/Next.js template-based image editor with a visual Studio, CLI, and code generation.

[Español](README.es.md)

This is a prerelease alpha. Package installation via `pnpm dlx` requires confirmed npm publication.

## Quick Start

```bash
# After npm publication is confirmed:
pnpm dlx @mauriciodmo/create-framekit my-project
cd my-project
pnpm dev
```

## Example

```tsx
import { defineTemplate, fields } from "@mauriciodmo/framekit";

export default defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: "Title", required: true }),
  },
  content: {
    en: { language: "English", title: "Hello" },
    es: { language: "Español", title: "Hola" },
  },
  render({ data, locale, width, height }) {
    return <div style={{ width, height }}>{data.title} ({locale})</div>;
  },
});
```

## Links

- [Documentation](Docs/en/README.md)
- [Documentación](Docs/es/README.md)
- [@mauriciodmo/framekit package README](packages/framekit/README.md)
- [Contributing](CONTRIBUTING.md)
- [License](LICENSE)

For repository development: `pnpm install --frozen-lockfile && pnpm dev`
