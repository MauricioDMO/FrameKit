# Configuración tipada

[Volver al skill](../SKILL.md)

Importa el tipo compartido y usa `satisfies`:

```ts
import type { TemplateConfig } from '@/lib/templates/types'

const config = {
  title: 'Historia promocional',
  description: 'Historia vertical para Instagram.',
  order: 10,
  width: 1080,
  height: 1920,
  fileName: 'historia-promocional',
  fields: [],
  defaults: {},
} satisfies TemplateConfig

export default config
```

## Propiedades

| Propiedad | Requerida | Descripción |
| --- | --- | --- |
| `title` | Sí | Nombre visible en la navegación y cabecera. |
| `description` | No | Explicación breve del uso. |
| `order` | Sí | Orden ascendente entre plantillas hermanas. |
| `width` | Sí | Ancho final del PNG en píxeles. |
| `height` | Sí | Alto final del PNG en píxeles. |
| `fileName` | No | Nombre de descarga sin extensión. |
| `fields` | Sí | Controles que genera el editor. |
| `defaults` | Sí | Valores iniciales indexados por `field.key`. |

## Tipos de campo

```ts
type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'color'
  | 'number'
```

Cada campo acepta:

```ts
{
  key: 'price',
  label: 'Precio',
  type: 'number',
  placeholder: '99',
  required: true,
  min: 0,
  max: 9999,
}
```

`placeholder`, `required`, `min` y `max` son opcionales. `min` y `max` tienen sentido principalmente para `number`.

## Correspondencia con `defaults`

Los valores de datos siempre son strings:

```ts
fields: [
  { key: 'title', label: 'Título', type: 'textarea' },
  { key: 'price', label: 'Precio', type: 'number' },
],
defaults: {
  title: 'Oferta de temporada',
  price: '99',
},
```

No agregues campos para elementos constantes de identidad visual. Déjalos directamente en `template.tsx` salvo que el usuario necesite modificarlos desde el editor.

## Validación

TypeScript valida configuraciones locales durante lint/build. No añadas Zod para estas configuraciones. Si la información proviene de una API, base de datos o usuario, valida esa entrada en su límite antes de convertirla en `TemplateConfig`.

Continúa con [Diseño y recursos](design-and-assets.md) para consumir `data` correctamente.
