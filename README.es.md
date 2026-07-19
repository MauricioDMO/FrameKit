# FrameKit

Editor de imágenes basado en plantillas con React/Next.js, Studio visual, CLI y generación de código.

[English](README.md)

Este es un alfa prerelease. La instalación del paquete via `pnpm dlx` requiere confirmación de publicación en npm.

## Inicio Rápido

```bash
# Después de confirmar la publicación en npm:
pnpm dlx @mauriciodmo/create-framekit my-project
cd my-project
pnpm dev
```

## Ejemplo

```tsx
import { defineTemplate, fields } from "@mauriciodmo/framekit";

export default defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: "Título", required: true }),
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

## Enlaces

- [Documentation](Docs/en/README.md)
- [Documentación](Docs/es/README.md)
- [README del paquete @mauriciodmo/framekit](packages/framekit/README.md)
- [Licencia](LICENSE)

Para desarrollo del repositorio: `pnpm install --frozen-lockfile && pnpm dev`
