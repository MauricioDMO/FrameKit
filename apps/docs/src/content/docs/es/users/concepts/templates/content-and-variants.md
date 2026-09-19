---
title: Contenido y variantes
description: Modela las variantes de contenido propias de la plantilla y comprende cómo FrameKit resuelve los valores de los campos.
sidebar:
  order: 3
---

`content` contiene un registro de claves de variantes propias de la plantilla. Cada entrada es un registro parcial de valores para los campos declarados por esa plantilla.

```tsx
content: {
  moon: { title: 'Oferta', alignment: 'center' },
  fjord: { title: 'Offer', alignment: 'left' }
},
variants: {
  default: 'moon',
  labels: {
    moon: 'Lunar',
    fjord: 'Fjordic'
  }
}
```

## Las claves de las variantes pertenecen a la plantilla

Las claves de contenido son cadenas propias de la plantilla. El validador actual de definiciones no impone una regla de nomenclatura ni exige que las claves de contenido no estén vacías. `variants.default` es la excepción: debe ser una cadena no vacía y debe nombrar una entrada en `content`. `language` no tiene un significado reservado, y ni `en` ni `es` se tratan como un campo de idioma o una variante especial por parte del contrato de la plantilla. Son claves ordinarias, a menos que la plantilla les dé un significado.

`variants.default` debe nombrar una entrada en `content`. `variants.labels` es opcional; cada clave de etiqueta debe nombrar una entrada de contenido y cada etiqueta debe ser una cadena no vacía. Las claves de `content` se convierten en el tipo de `variant` en las propiedades de renderizado. Una entrada de contenido solo puede contener claves de campos declaradas en `fields`, y cada valor debe tener el tipo en tiempo de ejecución del campo.

## Orden de resolución

Para una variante seleccionada, FrameKit resuelve los datos en este orden:

1. Primero se usa el `defaultValue` del campo. Los campos de cadena sin un valor predeterminado comienzan como `''`, los booleanos sin un valor predeterminado comienzan como `false`, y los campos numéricos siempre tienen un valor predeterminado numérico finito.
2. Los valores de `content[variant]` reemplazan esos valores predeterminados.
3. Las ediciones del usuario reemplazan los valores de la variante.

El resultado es el objeto `data` que se pasa a `render`. `resolveTemplateData` aplica el mismo orden al resolver datos mediante programación:

```tsx
import { resolveTemplateData } from '@mauriciodmo/framekit'

const data = resolveTemplateData(definition, 'moon', {
  title: 'Edited offer'
})
```

Una variante desconocida o una clave de campo desconocida es un error. Los valores ya deben tener el tipo en tiempo de ejecución del campo; FrameKit no convierte cadenas numéricas en números ni cadenas booleanas en valores booleanos.

Los recursos de imagen añaden otra fuente para los campos de imagen. Una imagen cuyo ámbito es una variante usa primero el recurso de la variante correspondiente y después un recurso común correspondiente. Una imagen cuyo ámbito es común usa el recurso común correspondiente. Un recurso aplicable reemplaza el valor de imagen resuelto; si no existe uno, se aplica el orden anterior de valor predeterminado, contenido y edición. Consulta [recursos](/es/users/concepts/templates/assets) y la [referencia de plantillas](/es/users/reference/template).
