# Creación de plantillas

[Volver al índice](README.md)

Cada plantilla es una carpeta con dos archivos:

```text
src/templates/<categorías>/<plantilla>/
├── config.ts
└── template.tsx
```

## 1. Crear la ruta

Los nombres de carpeta forman el slug y deben usar minúsculas, números y guiones.

```text
src/templates/publicidad/banner-horizontal/
```

Produce:

```text
/es/editor/publicidad/banner-horizontal
```

Una categoría puede incluir `_folder.json`:

```json
{
  "order": 20,
  "translations": {
    "es": { "title": "Publicidad" },
    "en": { "title": "Advertising" }
  }
}
```

Sin este archivo, el sistema convierte el nombre de carpeta en un título legible. Inclúyelo siempre que el título de la categoría deba traducirse.

## 2. Definir `config.ts`

Usa `defineTemplateConfig` para inferir los idiomas desde `languages` y exigirlos en toda la configuración:

```ts
import { defineTemplateConfig } from '@/lib/templates/types'

export default defineTemplateConfig({
  order: 10,
  width: 1600,
  height: 900,
  languages: {
    es: 'Español',
    en: 'English',
  },
  metadata: {
    es: {
      title: 'Banner horizontal',
      description: 'Banner para campañas web.',
      fileName: 'banner-horizontal',
    },
    en: {
      title: 'Horizontal banner',
      description: 'Banner for web campaigns.',
      fileName: 'horizontal-banner',
    },
  },
  fields: [
    {
      key: 'title',
      type: 'textarea',
      required: true,
      label: { es: 'Título', en: 'Title' },
    },
    {
      key: 'accentColor',
      type: 'color',
      label: { es: 'Color principal', en: 'Primary color' },
    },
  ],
  content: {
    es: { title: 'Una idea que merece ser vista', accentColor: '#b9f8d2' },
    en: { title: 'An idea worth seeing', accentColor: '#b9f8d2' },
  },
})
```

Cada clave de `languages` debe existir en `metadata`, `label`, `placeholder` cuando exista y `content`. Cada entrada de `content` debe declarar todos los `field.key`. **Idioma del diseño** selecciona toda esa configuración.

## 3. Crear `template.tsx`

El componente recibe `data`, `width`, `height` y `locale`. Usa `locale` para localizar cualquier texto fijo dentro del PNG.

```tsx
import type { TemplateProps } from '@/lib/templates/types'

export default function HorizontalBanner({
  data,
  width,
  height,
  locale,
}: TemplateProps) {
  const cta = locale === 'es' ? 'Conoce más' : 'Learn more'

  return (
    <article
      className="flex items-center bg-zinc-950 p-20 text-white"
      style={{ width, height }}
    >
      <h1 className="text-7xl font-black">{data.title}</h1>
      <p>{cta}</p>
    </article>
  )
}
```

Mantén fuera del componente los botones, formularios y funciones de descarga. La plantilla solo representa la imagen.

## 4. Añadir recursos

Guarda imágenes, logos y fuentes públicas bajo `public/`. Usa rutas desde la raíz:

```tsx
// eslint-disable-next-line @next/next/no-img-element
<img src="/images/products/item.webp" alt="" />
```

Para fondos configurables, lee `data.backgroundImage`. Para colores configurables, usa estilos inline porque Tailwind no puede generar clases dinámicas:

```tsx
<div style={{ backgroundColor: data.accentColor }} />
```

## 5. Generar y verificar

Con `pnpm dev`, el watcher detecta la carpeta nueva. También puedes ejecutar:

```bash
pnpm templates:generate
pnpm lint
pnpm build
```

No edites archivos de `src/generated/`; se sobrescriben automáticamente.

Consulta [Arquitectura](architecture.md) para entender los registros y el catálogo. Los agentes deben seguir el [skill de Image Studio](skills/image-studio/SKILL.md).
