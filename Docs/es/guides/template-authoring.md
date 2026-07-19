# Creación de plantillas

Una plantilla es un directorio bajo `src/templates/` que contiene un archivo `template.tsx` con un export default. FrameKit descubre las plantillas escaneando el directorio `src/templates/` y registrando cada directorio que tenga un archivo `template.tsx`.

## Convenciones de directorios

Las plantillas viven en directorios dentro de `src/templates/`. Cada nombre de directorio debe seguir el patrón:

```
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Esto significa solo letras minúsculas, números y guiones: sin mayúsculas, guiones bajos ni caracteres especiales. Por ejemplo: `blog-banner`, `social-card`, `email-header`.

**Directorios ignorados:** Los directorios que comienzan con `.` o `_` se omiten durante el descubrimiento. Usa estos prefijos para directorios privados o auxiliares que no deben tratarse como plantillas.

**Límites de plantilla:** Cuando FrameKit encuentra un `template.tsx` dentro de un directorio, trata ese directorio como un límite de plantilla. Cualquier subdirectorio dentro de él forma parte de la estructura privada de la plantilla y no se explora en busca de plantillas adicionales. Esto permite organizar archivos auxiliares, componentes y recursos junto a la plantilla sin crear plantillas anidadas.

## Generación de slugs

El slug es la ruta desde `src/templates/` hasta el directorio de la plantilla, con los segmentos unidos por barras. Por ejemplo, `src/templates/social-cards/instagram/post` se convierte en `social-cards/instagram/post`.

Los títulos mostrados en la interfaz de Studio se derivan de los nombres de directorio separando por guiones y poniendo en mayúscula la inicial de cada palabra. Por ejemplo, `social-cards` se convierte en "Social Cards" e `instagram-post` se convierte en "Instagram Post".

El registro de plantillas generado se ordena alfabéticamente por slug. En la interfaz de Studio, las plantillas y carpetas se ordenan alfabéticamente por sus títulos humanizados.

## Formas de creación

FrameKit soporta dos formas para definir plantillas. Ambas producen el mismo resultado final; elige la forma que se ajuste a la complejidad de tu plantilla.

### Plantilla en línea

Para plantillas directas, define todo en un único archivo `template.tsx`:

```tsx
import { defineTemplate, fields, Markdown } from '@mauriciodmo/framekit'

export default defineTemplate({
  width: 1200,
  height: 800,
  fields: {
    title: fields.text({ label: 'Title', required: true }),
    accentColor: fields.color({ label: 'Accent Color', defaultValue: '#b9f8d2' }),
  },
  content: {
    en: {
      language: 'English',
      title: 'Your next story starts here',
    },
    es: {
      language: 'Español',
      title: 'Tu próxima historia empieza aquí',
    },
  },
  render({ data, locale, width, height }) {
    return (
      <article
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #10271f, #39775f)',
          color: '#f5fff8',
        }}
      >
        <Markdown value={data.title} style={{ fontSize: 72 }} />
      </article>
    )
  },
})
```

### Definición extraída

Para plantillas con lógica de renderizado compleja, separa la definición del componente React usando `defineTemplateBase`. Esto permite colocar componentes de arte, utilitarios y recursos en subdirectorios privados sin afectar el descubrimiento de plantillas.

```tsx
// definition.ts
import { defineTemplateBase, fields } from '@mauriciodmo/framekit'
import type { TemplateRenderProps } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Title' }),
    accentColor: fields.color({ label: 'Accent', defaultValue: '#b9f8d2' }),
  },
  content: {
    aurora: { language: 'Aurora', title: 'Northern light' },
    desert: { language: 'Desert', title: 'Open horizon' },
  },
})

export type ArtworkProps = TemplateRenderProps<typeof templateBase>
```

```tsx
// artwork.tsx
import type { ArtworkProps } from './definition'

export function Artwork({ data, locale, width, height }: ArtworkProps) {
  return (
    <article lang={locale} style={{ width, height, color: data.accentColor }}>
      {data.title}
    </article>
  )
}
```

```tsx
// template.tsx
import { defineTemplate } from '@mauriciodmo/framekit'
import { Artwork } from './artwork'
import { templateBase } from './definition'

export default defineTemplate({
  ...templateBase,
  render: Artwork,
})
```

## Estructura de la definición de plantilla

Cada definición de plantilla requiere cinco propiedades:

- `width` — un entero positivo que especifica el ancho de salida de la plantilla en píxeles
- `height` — un entero positivo que especifica la altura de salida de la plantilla en píxeles
- `fields` — un registro en el que cada clave es un nombre de campo y cada valor es un descriptor de campo (text, textarea, number, color o url)
- `content` — un registro con al menos una entrada de locale, donde cada una contiene una cadena `language` y valores de campo parciales
- `render` — una función que recibe propiedades tipadas y devuelve un nodo React

## Contenido y locales

Las claves de locale son cadenas arbitrarias. No están restringidas a etiquetas de idioma: puedes usar cualquier identificador que tenga sentido para tu plantilla, como `en`, `es`, `moon`, `fjord` o `variant-a`. Cada entrada de locale debe incluir una propiedad `language` con una etiqueta legible para las personas y puede incluir valores para cualquiera de los campos definidos en la plantilla. Los campos que no estén presentes en un locale comienzan con su `defaultValue` si se declaró; de lo contrario, permanecen vacíos. La precedencia completa durante el renderizado está documentada en [Orden de resolución de datos](../reference/template-contract.md#data-resolution-order): valores predeterminados -> contenido del locale -> ediciones del usuario.

La clave `language` dentro de cada entrada de locale está reservada. Se usa solo como etiqueta de visualización en la interfaz de Studio y nunca se incluye en el objeto `data` que se pasa a `render`.

```tsx
content: {
  fjord: { language: 'Fjordic', title: 'Offer' },
  moon: { language: 'Lunar', title: 'Oferta' },
}
```

En este ejemplo, el tipo `locale` es `'fjord' | 'moon'`, no una unión global de idiomas.

## Props de renderizado

La función `render` recibe un único objeto con cuatro propiedades:

- `data` — un objeto que contiene todas las claves de campo como cadenas tras la resolución. En Studio, los valores se aplican en este orden: valores predeterminados de los campos, contenido del locale y, por último, ediciones del usuario.
- `locale` — la clave del locale actualmente seleccionado, tipado como una unión de todas las claves de contenido.
- `width` — el ancho de la plantilla como tipo literal.
- `height` — la altura de la plantilla como tipo literal.

## Regeneración automática

Al ejecutar `framekit dev`, FrameKit observa el directorio `src/templates/` en busca de cambios estructurales. Agregar o eliminar un directorio o archivo `template.tsx` activa el nuevo registro de las plantillas. La edición del contenido de un archivo `template.tsx` existente depende de Hot Module Replacement (HMR) de Next.js para actualizar la instancia en ejecución.

## Claves reservadas

La clave `language` está reservada dentro de `fields` y no puede usarse como nombre de campo. FrameKit lo rechaza tanto en tiempo de compilación como en tiempo de ejecución. Cada entrada de `content` debe contener una propiedad `language` de tipo cadena.

---

[English](../../en/guides/template-authoring.md) · [Español](./template-authoring.md)
