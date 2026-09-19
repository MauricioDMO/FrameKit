---
title: Usar recursos de imagen
description: Añade imágenes comunes, de variante y públicas a una plantilla de FrameKit.
sidebar:
  order: 3
---

Usa `field.image` para un valor de imagen. Las imágenes locales de la plantilla deben estar en el directorio `assets` de la plantilla, junto a `template.tsx`.

```text
src/templates/social-card/
├── assets/
│   ├── common/
│   │   └── logo.svg
│   └── moon/
│       └── hero.webp
└── template.tsx
```

## Haz coincidir el scope del campo con el directorio

El scope de imagen predeterminado es `variant`. Un campo con scope `variant` primero usa el directorio de la variante seleccionada y después recurre al directorio común. Usa `scope: 'common'` cuando la misma imagen pertenezca a todas las variantes.

```tsx
fields: {
  hero: field.image({ label: 'Hero image' }),
  logo: field.image({ label: 'Logo', scope: 'common' })
}
```

El basename del asset debe coincidir con la clave del campo. Para los campos anteriores, usa `assets/moon/hero.webp` y `assets/common/logo.svg`. La clave de variante en la ruta del asset es un nombre de directorio de asset; debe coincidir con la variante de contenido que quieres renderizar.

## Añadir contenido de variante

El contenido puede proporcionar una cadena de fallback para un campo de imagen:

```tsx
content: {
  moon: {
    hero: '/assets/fallbacks/moon-hero.png'
  },
  fjord: {
    hero: '/assets/fallbacks/fjord-hero.png'
  }
},
variants: {
  default: 'moon',
  labels: { moon: 'Moon', fjord: 'Fjord' }
}
```

Cuando existe un asset descubierto que coincide, FrameKit proporciona su URL generada en `assets` y la aplica al campo de imagen. Sin uno, la imagen sigue la precedencia normal de valor predeterminado, contenido y edición.

## Usar una imagen pública

Los archivos dentro de `public` no forman parte del escaneo de assets de la plantilla. Haz referencia a ellos con una URL relativa a la raíz en `defaultValue` o en el contenido:

```tsx
logo: field.image({
  label: 'Brand logo',
  scope: 'common',
  defaultValue: '/assets/logos/brand.svg'
})
```

## Validar y regenerar

Conserva las imágenes de origen en los directorios de assets de la plantilla, haz coincidir cada basename con su campo de imagen y regenera después de cambiarlas:

```bash
pnpm framekit generate
```

No edites el manifiesto generado ni los archivos copiados. Consulta [recursos de plantilla](/es/users/concepts/templates/assets) y la [referencia de plantillas](/es/users/reference/template) para conocer el contrato del manifiesto, `scope` y la URL generada.
