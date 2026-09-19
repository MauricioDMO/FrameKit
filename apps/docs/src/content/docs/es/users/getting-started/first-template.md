---
title: Crea tu primera plantilla
description: Añade una plantilla mínima válida de FrameKit y ábrela en Studio.
sidebar:
  order: 5
---

Las plantillas son componentes React definidos en código que se descubren en `src/templates/`. Una plantilla mínima necesita metadatos, dimensiones positivas, contenido para una variante, una variante predeterminada y una función `render`; este ejemplo incluye un campo editable.

## Crea el archivo

Crea `src/templates/first-template/template.tsx`:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'First template',
    description: 'A minimal template for learning the FrameKit workflow.',
  },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({
      label: 'Title',
      required: true,
      minLength: 1,
      maxLength: 80,
    }),
  },
  content: {
    default: {
      title: 'Hello from FrameKit',
    },
  },
  variants: {
    default: 'default',
    labels: {
      default: 'Default',
    },
  },
  render({ data, width, height }) {
    return (
      <article
        className="flex items-center justify-center bg-[#10271f] p-16 text-center text-6xl text-white"
        style={{ width, height }}
      >
        {data.title}
      </article>
    )
  },
})
```

El nombre del directorio se convierte en parte del slug de la plantilla. La exportación predeterminada de `template.tsx` es la definición de plantilla que se puede descubrir. `meta.title` es obligatorio; no se infiere del nombre del directorio.

## Entiende el contrato

- `fields` declara los datos editables y sus reglas de validación. El constructor público es el espacio de nombres singular `field`, así que usa `field.text`, `field.number`, `field.boolean`, `field.choice`, `field.color` o `field.image`.
- `content` proporciona valores para cada variante. Cada entrada debe contener únicamente valores de campos.
- `variants.default` selecciona la clave de contenido inicial. Esa clave debe existir en `content`.
- `render({ data, assets, variant, width, height })` devuelve la salida de React para la variante seleccionada. El ejemplo solo necesita `data`, `width` y `height`.
- `width` y `height` son dimensiones de exportación positivas y están disponibles para el renderizador.

Las claves de variante pertenecen a la plantilla. No son metadatos de idioma reservados; `default`, `en` y `es` son claves ordinarias a menos que la plantilla les asigne un significado.

## Valida y abre Studio

Desde la raíz del proyecto, valida la definición:

```bash
pnpm framekit check
```

La comprobación regenera el registro antes de validar la plantilla y cada variante de contenido. Inicia Studio después de que pase:

```bash
pnpm dev
```

Abre `http://localhost:3000/login`, inicia sesión y selecciona la plantilla desde `/editor`. Durante el desarrollo, los cambios en `src/templates/` activan la regeneración del registro. `pnpm framekit generate` puede regenerarlo explícitamente.

No edites `src/generated/framekit/templates.ts` para registrar la plantilla. El descubrimiento y la generación de código se encargan de ese archivo.

Continúa con [la guía de estructura del proyecto](/es/users/getting-started/project-structure) antes de añadir assets o componentes de marca.
