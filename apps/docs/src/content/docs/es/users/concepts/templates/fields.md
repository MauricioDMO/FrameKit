---
title: Campos de plantilla
description: Configura campos de texto, numéricos, booleanos, de opción, de color y de imagen con el contrato actual de FrameKit.
sidebar:
  order: 4
---

Declara valores editables en `fields` con la exportación singular `field` de `@mauriciodmo/framekit`. Los seis tipos de campo son `text`, `number`, `boolean`, `choice`, `color` e `image`.

Todos los descriptores de campo requieren una `label` no vacía. El contenido, las ediciones, los datos resueltos y las props de renderizado conservan sus tipos en tiempo de ejecución: cadenas para `text`, `color`, `image` y `choice`; números finitos para `number`; y booleanos para `boolean`.

## Texto

`field.text` crea un campo de texto multilínea. Acepta `label`, `placeholder` opcional, `defaultValue` opcional, `required` opcional y `minLength` y `maxLength` opcionales.

```tsx
title: field.text({
  label: 'Title',
  placeholder: 'Write a title',
  defaultValue: 'Your title',
  required: true,
  minLength: 1,
  maxLength: 80
})
```

El texto es obligatorio de forma predeterminada y, si no se proporciona `defaultValue`, comienza como `''`. `minLength` y `maxLength` deben ser enteros finitos no negativos, y `minLength` no puede superar `maxLength`. La validación de obligatoriedad recorta solo para decidir si el valor está vacío; la longitud se mide sobre el valor original, incluidos los espacios y saltos de línea.

## Número

`field.number` requiere un `defaultValue` numérico finito. Acepta un `placeholder` de cadena opcional, límites `min` y `max` finitos opcionales, un `step` finito positivo opcional (predeterminado en `1`) y `control: 'input' | 'slider'` (predeterminado en `'input'`). Los campos number no aceptan `required`.

```tsx
count: field.number({
  label: 'Count',
  placeholder: 'Enter a count',
  defaultValue: 10,
  min: 0,
  max: 100,
  step: 5
}),
opacity: field.number({
  label: 'Opacity',
  defaultValue: 100,
  min: 0,
  max: 100,
  step: 1,
  control: 'slider'
})
```

El control `input` predeterminado es una entrada numérica nativa y usa `placeholder` cuando se proporciona. `slider` es una entrada de rango nativa; no muestra un placeholder y requiere límites `min` y `max` finitos explícitos. Cuando se proporcionan ambos límites, `min` no debe superar `max`; los valores y valores predeterminados deben satisfacer los límites y el step. Los valores confirmados deben ser números finitos. Las cadenas numéricas no son válidas; no se convierten.

## Booleano

`field.boolean` acepta únicamente `label` y un `defaultValue` booleano opcional. Si se omite, el valor predeterminado es `false`.

```tsx
showLogo: field.boolean({
  label: 'Show logo',
  defaultValue: true
})
```

Los valores booleanos siguen siendo booleanos en el contenido, las ediciones, los datos resueltos y las props de renderizado. Usa `field.choice` cuando un valor necesite más de dos estados.

## Opción

`field.choice` crea un conjunto cerrado de valores de cadena. Su array `options` debe ser no vacío y conservar su orden. Cada opción debe tener un `value` de cadena único y no vacío, y un `label` de cadena no vacío. `defaultValue` es obligatorio y debe coincidir con un valor de opción.

```tsx
alignment: field.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ],
  defaultValue: 'center'
})
```

Los campos choice no aceptan `required`, `control` ni `step`. El contenido y las ediciones deben usar uno de los valores de opción declarados.

## Color

`field.color` usa las mismas opciones `label`, `placeholder`, `required` y `defaultValue` que los demás campos de cadena. La validación de datos recorta la cadena enviada antes de comprobarla, por lo que los espacios circundantes se ignoran para esta comprobación. Después de recortarlos, los valores no vacíos deben ser colores hexadecimales de seis dígitos en formato `#RRGGBB`, sin distinguir mayúsculas y minúsculas.

```tsx
accentColor: field.color({
  label: 'Accent color',
  defaultValue: '#173d31'
})
```

Los campos color son obligatorios de forma predeterminada. Establece `required: false` para permitir una cadena vacía.

## Imagen

`field.image` acepta las opciones de los campos de cadena además de `scope: 'common' | 'variant'`. El ámbito predeterminado es `variant`.

```tsx
hero: field.image({ label: 'Hero image' }),
background: field.image({ label: 'Background', scope: 'common' })
```

Una imagen con ámbito de variante busca primero el recurso de la variante seleccionada y después un recurso común. Una imagen con ámbito común usa el recurso común. Si no hay un recurso coincidente, el campo sigue el orden normal de resolución de valores de cadena. Consulta [usar recursos de imagen](/es/users/guides/use-image-assets).

## Obligatoriedad y validación

Los campos text, color e image son obligatorios de forma predeterminada; `required: false` permite una cadena vacía. Los campos number y choice requieren valores predeterminados válidos, mientras que los campos boolean siempre se resuelven como booleanos. La validación de definiciones comprueba la forma y las opciones de los campos. La validación de datos comprueba los valores resueltos e informa de códigos estructurados como `required`, `invalid_number`, `invalid_choice`, `invalid_color` e `invalid_boolean`, además de códigos de restricciones numéricas y de texto.

Para consultar el contrato completo de validación, consulta la [referencia de plantillas](/es/users/reference/template).
