---
title: Definición de plantilla
description: Define los metadatos, las dimensiones, los campos, el contenido, las variantes y la función de renderizado que conforman una plantilla de FrameKit.
sidebar:
  order: 2
---

`defineTemplate` valida una definición de plantilla completa y conserva sus tipos para el renderizador. La importación pública es `@mauriciodmo/framekit`.

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Promotion card',
    description: 'A card for a promotion',
    marketingDescription: 'Present an offer clearly',
    tags: ['social', 'promotion']
  },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({ label: 'Title', required: true, minLength: 1, maxLength: 80 }),
    accentColor: field.color({ label: 'Accent', defaultValue: '#173d31' })
  },
  content: {
    default: { title: 'A clear offer' }
  },
  variants: {
    default: 'default',
    labels: { default: 'Default' }
  },
  render ({ data, width, height }) {
    return (
      <article style={{ width, height, color: data.accentColor }}>
        {data.title}
      </article>
    )
  }
})
```

## Estructura requerida

Una definición completa contiene:

- `meta`, un objeto de metadatos plano;
- `width` y `height`, enteros finitos positivos;
- `fields`, un registro creado con el espacio de nombres singular `field`;
- `content`, con al menos una entrada de variante que contenga únicamente claves de campos declaradas;
- `variants`, con una clave de contenido `default` no vacía y `labels` opcional; y
- `render`, una función que devuelve un nodo de React.

`meta.title` es obligatorio y no puede estar vacío. Las únicas claves de metadatos aceptadas son `title`, `description`, `marketingDescription` y `tags`; cuando está presente, `tags` es un array de cadenas. El título proviene de los metadatos validados, no del nombre del directorio de la plantilla.

`width` y `height` definen las dimensiones fijas de salida. El renderizador recibe esos valores, por lo que el arte principal debe usarlos como dimensiones de su lienzo. Las dimensiones no finitas, no enteras o no positivas hacen que falle la validación de la definición.

## Ubicación del archivo

Crea `src/templates/<template-slug>/template.tsx`. Los segmentos de directorio usan letras minúsculas, números y guiones simples, de acuerdo con `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Los directorios cuyo nombre comienza por `.` o `_` se ignoran. Cuando un directorio contiene `template.tsx`, se convierte en un límite de plantilla; los archivos y subdirectorios que haya debajo permanecen privados de esa plantilla.

Consulta [campos](/es/users/concepts/templates/fields), [contenido y variantes](/es/users/concepts/templates/content-and-variants) y la [referencia de plantillas](/es/users/reference/template) para conocer los contratos individuales.
