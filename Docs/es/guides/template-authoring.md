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

Las imágenes de una plantilla viven en un directorio `assets` junto a `template.tsx`. Coloca las imágenes compartidas en `assets/common`; las imágenes por variante van en un directorio con la misma key del contenido y usan como nombre la key del field. Los archivos compartidos por todo el proyecto viven en `public/assets/<categoría>` y usan URLs explícitas `/assets/...`.

## Generación de slugs

El slug es la ruta desde `src/templates/` hasta el directorio de la plantilla, con los segmentos unidos por barras. Por ejemplo, `src/templates/social-cards/instagram/post` se convierte en `social-cards/instagram/post`.

Los títulos mostrados en el catálogo de Studio actualmente se derivan de los nombres de directorio separando por guiones y poniendo en mayúscula la inicial de cada palabra. Por ejemplo, `social-cards` se convierte en "Social Cards" e `instagram-post` se convierte en "Instagram Post". Este resumen del catálogo es distinto de `meta.title`, que es obligatorio; un `meta.title` ausente o inválido nunca se completa desde el nombre del directorio. Los resúmenes del registro y el consumo de metadata en Studio quedan para los issues [#12](../../Plans/Future/issue-12-generated-template-registry.md) y [#13](../../Plans/Future/issue-13-studio-canonical-contract.md).

El registro de plantillas generado se ordena alfabéticamente por slug. En la interfaz de Studio, las plantillas y carpetas se ordenan alfabéticamente por sus títulos humanizados.

## Formas de creación

FrameKit soporta dos formas para definir plantillas. Ambas producen el mismo resultado final; elige la forma que se ajuste a la complejidad de tu plantilla.

### Plantilla en línea

Para plantillas directas, define todo en un único archivo `template.tsx`:

```tsx
import { defineTemplate, field, Markdown } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Tarjeta social',
    description: 'Una tarjeta cuadrada para publicaciones y campañas sociales',
    marketingDescription: 'Presentar el mensaje con claridad y motivar a la audiencia a actuar',
    tags: ['social', 'promoción'],
  },
  width: 1200,
  height: 800,
  fields: {
    title: field.text({ label: 'Title', required: true, minLength: 1, maxLength: 80 }),
    accentColor: field.color({ label: 'Accent Color', defaultValue: '#b9f8d2' }),
  },
  content: {
    en: {
      title: 'Your next story starts here',
    },
    es: {
      title: 'Tu próxima historia empieza aquí',
    },
  },
  variants: { default: 'en', labels: { en: 'English', es: 'Español' } },
  render({ data, variant, width, height }) {
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
import { defineTemplateBase, field } from '@mauriciodmo/framekit'
import type { TemplateRenderProps } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  meta: {
    title: 'Tarjeta social extraída',
    description: 'Una definición reutilizable para una tarjeta social',
    marketingDescription: 'Explicar la oferta y dejar clara la siguiente acción',
    tags: ['social'],
  },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({ label: 'Title' }),
    accentColor: field.color({ label: 'Accent', defaultValue: '#b9f8d2' }),
  },
  content: {
    aurora: { title: 'Northern light' },
    desert: { title: 'Open horizon' },
  },
  variants: { default: 'aurora', labels: { aurora: 'Aurora', desert: 'Desert' } },
})

export type ArtworkProps = TemplateRenderProps<typeof templateBase>
```

```tsx
// artwork.tsx
import type { ArtworkProps } from './definition'

export function Artwork({ data, variant, width, height }: ArtworkProps) {
  return (
    <article data-variant={variant} style={{ width, height, color: data.accentColor }}>
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

Cada definición de plantilla requiere estas propiedades:

- `meta` — un objeto plano reservado para la metadata de la plantilla
- `width` — un entero positivo que especifica el ancho de salida de la plantilla en píxeles
- `height` — un entero positivo que especifica la altura de salida de la plantilla en píxeles
- `fields` — un registro en el que cada clave es un nombre de campo y cada valor es un descriptor de campo (text, number, color, image, choice o boolean), creado con el export singular `field`
- `variants` — un objeto con una key `default` de contenido y labels de visualización opcionales
- `content` — un registro con al menos una entrada de variante que contiene solo valores parciales de fields
- `render` — una función que recibe propiedades tipadas y devuelve un nodo React

### Metadata De La Plantilla

`meta` es el objeto de metadata autodescriptivo de la plantilla. Acepta
exactamente estas propiedades:

- `title` (obligatorio): un título de plantilla no vacío.
- `description` (opcional): una descripción funcional del propósito de la plantilla.
- `marketingDescription` (opcional): el objetivo concreto de comunicación, como presentar un servicio, explicar precios, destacar beneficios o motivar una acción.
- `tags` (opcional): un array de strings para el uso posterior del catálogo.

`meta` no acepta `revision`, `status`, `keywords`, `order` ni ninguna otra
propiedad. No existe fallback al slug ni alias de compatibilidad: una definición
sin un `meta.title` válido falla la validación. El registro actual todavía deriva
su resumen de catálogo del sistema de archivos; el consumo de metadata pertenece
a los issues #12 y #13.

## API De Fields

El paquete raíz exporta `field`, no `fields`. La propiedad de la definición de
plantilla sigue llamándose `fields`:

```tsx
fields: {
  title: field.text({
    label: 'Título',
    placeholder: 'Escribe un título',
    minLength: 1,
    maxLength: 80,
  }),
}
```

`field.text` siempre renderiza un `<textarea>` nativo y conserva los saltos de
línea. `minLength` y `maxLength` son enteros finitos no negativos opcionales;
`minLength` no puede superar a `maxLength`. No existe `field.textarea` ni un alias
de compatibilidad `fields`.

`field.choice` renderiza un `<select>` nativo para un conjunto cerrado de valores
string. Su array `options` debe ser no vacío y ordenado, con strings `value` y
`label` no vacíos y valores únicos. `defaultValue` es obligatorio y debe
coincidir con uno de esos valores. Los campos choice no aceptan `required` ni
`control`, y un valor no declarado falla la validación con `invalid_choice`.

```tsx
alignment: field.choice({
  label: 'Alineación',
  options: [
    { value: 'left', label: 'Izquierda' },
    { value: 'center', label: 'Centro' },
    { value: 'right', label: 'Derecha' },
  ],
  defaultValue: 'center',
})
```

`field.boolean` renderiza un checkbox nativo para un valor binario. Solo acepta
`label` y un `defaultValue` booleano opcional; si se omite, el valor
predeterminado es `false`. El contenido, las ediciones y los datos de render de
un field boolean permanecen como booleanos, sin convertir `'true'` ni `'false'`.
Usa `field.choice` para valores de tres estados.

```tsx
showLogo: field.boolean({
  label: 'Mostrar logo',
  defaultValue: true,
})
```

## Contenido y variantes

Las claves de variante son cadenas arbitrarias. No están restringidas a etiquetas de idioma: puedes usar cualquier identificador que tenga sentido para tu plantilla, como `en`, `es`, `moon`, `fjord` o `variant-a`. Cada entrada puede incluir valores para cualquiera de los fields definidos en la plantilla. Los fields que no estén presentes en una variante comienzan con su `defaultValue` si se declaró; de lo contrario, permanecen vacíos. La precedencia completa durante el renderizado está documentada en [Orden de resolución de datos](../reference/template-contract.md#data-resolution-order): valores predeterminados -> contenido de la variante -> ediciones del usuario.

Usa `variants.labels` para las labels legibles de las opciones. Es opcional y
cada key de label debe coincidir con una key de variante de contenido. Si falta
una label, Studio usa la key de la variante. Las entradas de `content` no
contienen metadata como `language`; cada key de contenido debe ser un field
editable.

```tsx
variants: {
  default: 'fjord',
  labels: { fjord: 'Fjordic', moon: 'Lunar' },
},
content: {
  fjord: { title: 'Offer' },
  moon: { title: 'Oferta' },
}
```

En este ejemplo, el tipo `variant` es `'fjord' | 'moon'`, no una unión global de idiomas.

## Props de renderizado

La función `render` recibe únicamente inputs de renderizado:

- `data` — un objeto que contiene todas las claves de field con el tipo definido
  por cada field tras la resolución. Los valores de text, color, image y choice
  son strings; los valores boolean son booleanos. En Studio, los valores se
  aplican en este orden: valores predeterminados de los fields, contenido de la
  variante y, por último, ediciones del usuario.
- `assets` — URLs generadas para los assets comunes y por variante de la plantilla.
- `variant` — la key de la variante actualmente seleccionada, tipada como una unión de todas las keys de contenido.
- `width` — el ancho de la plantilla como tipo literal.
- `height` — la altura de la plantilla como tipo literal.

La función de renderizado es independiente del estado de Studio y de APIs del editor exclusivas del navegador. Un field de imagen resuelve una cadena URL para el navegador. Los fields por variante usan `assets/<variant>/<field-key>.*`; los comunes usan `assets/common/<field-key>.*`. Una imagen pública puede referenciarse con una ruta desde la raíz como `/assets/logos/brand.svg` en `defaultValue` o en el contenido de la variante. Los archivos públicos no se escanean dentro del manifest de assets de la plantilla.

```tsx
fields: {
  hero: field.image({ label: 'Hero image' }),
  background: field.image({ label: 'Background', scope: 'common' }),
},
```

```text
src/templates/social-card/assets/
├── common/background.webp
└── en/hero.webp
```

```tsx
logo: field.image({
  label: 'Logo de marca',
  defaultValue: '/assets/logos/brand.svg',
})
```

## Regeneración automática

Al ejecutar `framekit dev`, FrameKit observa `src/` en busca de cambios que afectan los registros generados de plantillas y componentes de marca:

- Dentro de `src/templates/`, agregar o eliminar directorios, o agregar, eliminar o modificar un archivo `template.tsx` o un archivo dentro de un directorio `assets`, activa la regeneración. Los cambios en otros archivos de código de la plantilla no activan la regeneración mediante este watcher; HMR de Next.js aún puede actualizar la instancia en ejecución.
- Dentro de `src/brand/`, agregar, eliminar o modificar archivos o directorios activa la regeneración. Los componentes de marca se descubren de forma recursiva y cada directorio de componente debe cumplir el contrato de `src/brand` descrito en la guía de [Componentes de marca](./brand-components.md).

Para una regeneración puntual, ejecuta `framekit generate`. El comando compartido de generación requiere al menos una plantilla; descubre tanto las plantillas como los componentes de marca y luego escribe `src/generated/framekit/templates.ts` y `src/generated/framekit/brands.ts`.

## Claves reservadas

La clave `language` está reservada dentro de `fields` y no puede usarse como nombre de field. FrameKit la rechaza tanto en tiempo de compilación como en tiempo de ejecución. Las entradas de `content` contienen solo valores de fields; una propiedad `language` se rechaza como key desconocida. Las definiciones no tienen una propiedad de versión ni una forma alternativa de compatibilidad. La metadata solo acepta `title`, `description`, `marketingDescription` y `tags`; las propiedades no soportadas se rechazan.

---

[English](../../en/guides/template-authoring.md) · [Español](./template-authoring.md) · [Plan Futuro #3](../../Plans/Future/issue-03-template-metadata.md) · [Issue #3 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/3) · [Plan Futuro #4](../../Plans/Future/issue-04-content-variants.md) · [Issue #4 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/4) · [Plan Futuro #5](../../Plans/Future/issue-05-semantic-fields.md) · [Issue #5 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/5) · [Plan Futuro #6](../../Plans/Future/issue-06-choice-field.md) · [Issue #6 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/6) · [Plan Futuro #7](../../Plans/Future/issue-07-boolean-field.md) · [Issue #7 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/7)
