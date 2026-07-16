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
/editor/publicidad/banner-horizontal
```

Una categoría puede incluir `_folder.json`:

```json
{
  "title": "Publicidad",
  "order": 20
}
```

Sin este archivo, el sistema convierte el nombre de carpeta en un título legible.

## 2. Definir `config.ts`

Usa `satisfies TemplateConfig` para obtener autocompletado y validación de TypeScript:

```ts
import type { TemplateConfig } from '@/lib/templates/types'

const config = {
  title: 'Banner horizontal',
  description: 'Banner para campañas web.',
  order: 10,
  width: 1600,
  height: 900,
  fileName: 'banner-horizontal',
  fields: [
    {
      key: 'title',
      label: 'Título',
      type: 'textarea',
      required: true,
    },
    {
      key: 'accentColor',
      label: 'Color principal',
      type: 'color',
    },
  ],
  defaults: {
    title: 'Una idea que merece ser vista',
    accentColor: '#b9f8d2',
  },
} satisfies TemplateConfig

export default config
```

Cada `field.key` debe tener un valor string correspondiente en `defaults`.

## 3. Crear `template.tsx`

El componente recibe únicamente `data`, `width` y `height`:

```tsx
import type { TemplateProps } from '@/lib/templates/types'

export default function HorizontalBanner({
  data,
  width,
  height,
}: TemplateProps) {
  return (
    <article
      className="flex items-center bg-zinc-950 p-20 text-white"
      style={{ width, height }}
    >
      <h1 className="text-7xl font-black">{data.title}</h1>
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
