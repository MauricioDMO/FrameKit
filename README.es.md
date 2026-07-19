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

```js
import { defineTemplate } from "@mauriciodmo/framekit";

const template = defineTemplate({
  fields: {
    title: { type: "text", default: "Hello" }
  },
  locales: {
    en: { title: "Hello" },
    es: { title: "Hola" }
  },
  render: ({ fields, locale }) => (
    <div>{fields.title}</div>
  )
});
```

## Enlaces

- [Documentation](Docs/en/README.md)
- [Documentación](Docs/es/README.md)
- [README del paquete @mauriciodmo/framekit](packages/framekit/README.md)
- [Contribuir](CONTRIBUTING.md)
- [Licencia](LICENSE)

Para desarrollo del repositorio: `pnpm install --frozen-lockfile && pnpm dev`
