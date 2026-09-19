---
title: Recursos de plantilla
description: Añade imágenes de plantilla que FrameKit pueda descubrir, elige el ámbito común o de variante y comprende las URL de recursos generadas.
sidebar:
  order: 5
---

Las imágenes locales de una plantilla viven en un directorio `assets` junto a `template.tsx`. Coloca los archivos compartidos en `assets/common` y los archivos específicos de una variante en `assets/<variant>`.

```text
src/templates/social-card/
├── assets/
│   ├── common/
│   │   └── logo.svg
│   └── moon/
│       └── hero.webp
└── template.tsx
```

El nombre base se convierte en la clave del recurso. Por tanto, un campo de imagen llamado `hero` usa `assets/moon/hero.webp` para la variante `moon`. Usa `scope: 'common'` para una imagen compartida por todas las variantes; los campos de imagen usan `scope: 'variant'` de forma predeterminada.

## Reglas de descubrimiento de recursos

FrameKit solo analiza los archivos ubicados directamente dentro de `common` o de un directorio de variante. Los archivos no ocultos colocados directamente en `assets` y los subdirectorios dentro de esos directorios se rechazan. Se omiten las entradas ocultas. Las extensiones de imagen compatibles son `.avif`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg` y `.webp`; las demás se ignoran. Los nombres de los recursos deben coincidir con `[A-Za-z0-9][A-Za-z0-9._-]*`, y dos archivos de un mismo directorio no pueden producir la misma clave basada en el nombre base.

El directorio `common` está reservado para recursos compartidos. Los nombres de los demás directorios de recursos deben comenzar por una letra o un número y pueden contener letras, números, guiones bajos y guiones. El nombre del directorio no crea por sí mismo una variante de plantilla; proporciona una entrada del manifiesto para esa clave.

## Imágenes públicas

Los archivos de `public` no se analizan en el manifiesto de recursos de la plantilla. Haz referencia a ellos con una URL relativa a la raíz desde un valor predeterminado del campo o un valor de contenido:

```tsx
logo: field.image({
  label: 'Brand logo',
  defaultValue: '/assets/logos/brand.svg'
})
```

## Manifiesto generado

El generador copia los archivos de plantilla descubiertos en `public/framekit/templates/` y crea un `TemplateAssetManifest` con esta forma:

```ts
{
  common: {
    logo: '/framekit/templates/social-card/common/logo.svg'
  },
  variants: {
    moon: {
      hero: '/framekit/templates/social-card/moon/hero.webp'
    }
  }
}
```

La URL generada se basa en el slug de la plantilla y la ruta del recurso. La prop de renderizado `assets` recibe este manifiesto. Para resolver imágenes, un campo con ámbito de variante usa primero el recurso de la variante seleccionada y después un recurso común; un campo con ámbito común usa el recurso común. Consulta [contenido y variantes](/es/users/concepts/templates/content-and-variants) y [usar recursos de imagen](/es/users/guides/use-image-assets).
