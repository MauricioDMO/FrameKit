# Configuración tipada

[Volver al skill](../SKILL.md)

Usa `defineTemplateConfig`. Las claves de `languages` son la fuente de verdad para todo el contenido localizado:

```ts
import { defineTemplateConfig } from '@/lib/templates/types'

export default defineTemplateConfig({
  order: 10,
  width: 1080,
  height: 1920,
  languages: { es: 'Español', en: 'English' },
  metadata: {
    es: { title: 'Historia promocional', fileName: 'historia-promocional' },
    en: { title: 'Promotional story', fileName: 'promotional-story' },
  },
  fields: [
    {
      key: 'title',
      type: 'textarea',
      label: { es: 'Título', en: 'Title' },
      placeholder: { es: 'Oferta de temporada', en: 'Seasonal offer' },
    },
  ],
  content: {
    es: { title: 'Oferta de temporada' },
    en: { title: 'Seasonal offer' },
  },
})
```

## Propiedades

| Propiedad | Requerida | Descripción |
| --- | --- | --- |
| `order` | Sí | Orden ascendente entre plantillas hermanas. |
| `width` | Sí | Ancho final del PNG en píxeles. |
| `height` | Sí | Alto final del PNG en píxeles. |
| `languages` | Sí | Record de claves del idioma de diseño y su nombre visible. |
| `metadata` | Sí | Título y metadatos por idioma. |
| `fields` | Sí | Controles del editor con etiquetas localizadas. |
| `content` | Sí | Valores iniciales por idioma. |

Cada idioma requiere `metadata[language].title`. `description` y `fileName` son opcionales.

## Reglas de tipos

`defineTemplateConfig` hace fallar TypeScript si:

- Falta una clave de `languages` en `metadata`, un `label`, un `placeholder` declarado o `content`.
- Se declara una clave localizada que no existe en `languages`.
- Un idioma en `content` no incluye todos los `field.key`.

Conserva las mismas claves, tipos y restricciones de campo para cada idioma. Solo localiza etiquetas, placeholders y valores de contenido.

## Tipos de campo

```ts
type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'color'
  | 'number'
```

`required`, `min` y `max` son opcionales. Si se omite `required`, el editor lo resuelve como `true`; usa `required: false` para un campo opcional. `min` y `max` tienen sentido principalmente para `number`.

## Idiomas del diseño

El primer control del formulario muestra `languages`. Al cambiarlo, el editor usa ese idioma para título, descripción, etiquetas, placeholders, valores iniciales, nombre del PNG y `locale` de `TemplateProps`. Si el idioma de la interfaz no está declarado, se usa la primera clave de `languages`.

No agregues campos para elementos constantes de identidad visual. Déjalos en `template.tsx`; si contienen texto, localízalos con `locale`.

Continúa con [Diseño y recursos](design-and-assets.md) para consumir `data` correctamente.
