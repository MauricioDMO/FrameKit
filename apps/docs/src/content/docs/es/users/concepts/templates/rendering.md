---
title: Renderizado de plantillas
description: Usa los datos tipados, el manifiesto de recursos, la variante y las dimensiones fijas proporcionadas al renderizador de plantillas.
sidebar:
  order: 7
---

La función `render` es el límite entre una definición de plantilla y su salida React. FrameKit la llama con exactamente estas entradas:

```tsx
render({ data, assets, variant, width, height }) {
  return (
    <article style={{ width, height }}>
      {data.title}
    </article>
  )
}
```

- `data` contiene todas las claves de campo después de la resolución, con el tipo de valor inferido a partir de ese campo;
- `assets` es el manifiesto generado con mapas `common` y mapas indexados por variante;
- `variant` es la clave de contenido seleccionada, tipada como la unión de las claves de `content`;
- `width` y `height` son las dimensiones numéricas literales de la definición.

El renderizador debe usar `width` y `height` para el lienzo de salida fijo. Son enteros finitos positivos validados en la definición, no sugerencias para un tamaño adaptable.

## Datos de renderizado tipados

El tipo público `TemplateRenderProps` describe el límite de renderizado:

```tsx
import type { TemplateRenderProps } from '@mauriciodmo/framekit'

type Props = TemplateRenderProps<typeof template>
```

Los datos de texto, color, imagen y opción son cadenas. Los datos numéricos son datos numéricos finitos, los datos booleanos son booleanos y los datos de opción se restringen a los valores de opción declarados. Una entrada numérica temporalmente malformada no se confirma como datos de renderizado.

Los valores de los campos se resuelven a partir de los valores predeterminados, después del contenido de la variante seleccionada y, por último, de las ediciones. Un recurso de imagen descubierto aplicable se aplica a un campo de imagen según su ámbito y la precedencia de recursos descrita en [recursos de plantilla](/es/users/concepts/templates/assets).

El renderizador es independiente del estado exclusivo del editor. Recibe los valores resueltos y el manifiesto de recursos; no recibe un descriptor de campo, un objeto de edición ni una configuración regional de la interfaz. Para consultar el contrato completo, consulta [contenido y variantes](/es/users/concepts/templates/content-and-variants) y la [referencia de plantillas](/es/users/reference/template).
