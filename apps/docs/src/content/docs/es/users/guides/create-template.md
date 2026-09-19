---
title: Crear una plantilla
description: Crea, valida y regenera una definición completa de plantilla de FrameKit.
sidebar:
  order: 1
---

Crea un directorio bajo `src/templates/` con un nombre en minúsculas y kebab-case, y añade un `template.tsx` que exporte por defecto. La siguiente es una plantilla completa válida:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Social card',
    description: 'A square card for social posts',
    marketingDescription: 'Present the message and motivate an action',
    tags: ['social', 'promotion']
  },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({
      label: 'Title',
      required: true,
      minLength: 1,
      maxLength: 80
    }),
    accentColor: field.color({
      label: 'Accent color',
      defaultValue: '#173d31'
    })
  },
  content: {
    default: {
      title: 'Your next story starts here'
    }
  },
  variants: {
    default: 'default',
    labels: {
      default: 'Default'
    }
  },
  render ({ data, width, height }) {
    return (
      <article
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 72,
          background: '#10271f',
          color: data.accentColor,
          fontSize: 72
        }}
      >
        {data.title}
      </article>
    )
  }
})
```

## Comprobar la definición

Ejecuta la comprobación del proyecto desde la raíz del proyecto:

```bash
pnpm framekit check
```

La comprobación regenera el registro, valida la definición, resuelve cada variante de contenido sin modificaciones y valida los datos resultantes. Detecta metadatos, dimensiones, opciones de campos, valores de contenido y restricciones numéricas no válidos antes de usar la plantilla.

## Regenerar durante el desarrollo

Para actualizar el registro una sola vez, ejecuta:

```bash
pnpm framekit generate
```

`pnpm framekit dev` genera antes de iniciar y observa los cambios en `src/templates/` y `src/brand/`. `pnpm framekit build` también genera mediante su paso de comprobación. `pnpm framekit start` es de solo lectura con respecto a la generación y espera una compilación de producción existente.

No edites directamente los archivos generados. Edita `src/templates/<name>/template.tsx` y después regenera. La [definición de plantilla](/es/users/concepts/templates/definition), los [campos](/es/users/concepts/templates/fields) y la [referencia de plantillas](/es/users/reference/template) explican los contratos individuales.
