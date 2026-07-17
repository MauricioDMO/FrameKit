# 00. Contrato y base de pruebas

## Decisiones cerradas

Esta fase define el único contrato que podrá existir en `0.1.0`. No se conservará compatibilidad con `defineTemplateConfig`, arreglos de campos, `metadata`, `languages`, `order`, `fileName`, `config.ts` ni `_folder.json`.

Una definición debe tener esta forma exacta:

```tsx
import { defineTemplate, fields } from '@/lib/framekit'

export default defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Título', required: true }),
    accentColor: fields.color({ label: 'Color', defaultValue: '#173d31' }),
  },
  content: {
    es: { language: 'Español', title: 'Oferta' },
    en: { language: 'English', title: 'Offer' },
  },
  render({ data, locale, width, height }) {
    return <article lang={locale} style={{ width, height }}>{data.title}</article>
  },
})
```

`fields` es un objeto, no un arreglo. Cada clave se convierte en la clave de `data`. `content[locale]` puede omitir campos que tengan `defaultValue`; los valores que sí incluya reemplazan ese default. `language` solo identifica el idioma visible en el selector y nunca se entrega dentro de `data`.

Todos los valores de `data` son `string`. Un campo `number` controla y valida una cadena numérica, pero no transforma `"19.99"` en `19.99`. No se incluirán `image`, `select`, `boolean`, `array` ni `object` en alpha.

## Implementación

- [x] Declarar `TemplateFieldKind` como la unión `text | textarea | number | color | url`.
- [x] Declarar una base de campo con `label`, `placeholder?`, `required?` y `defaultValue?`, todos los valores editables como `string`.
- [x] Limitar `min` y `max` a `fields.number`; no aceptarlos en los otros cuatro helpers.
- [x] Declarar `TemplateDefinition`, `TemplateRenderProps` e `InferTemplateData` como tipos públicos.
- [x] Hacer que `locale` en `TemplateRenderProps` sea la unión literal de las claves de `content`.
- [x] Hacer que `data` contenga exactamente las claves de `fields`, todas como `string`.
- [x] Hacer que cada entrada de `content` requiera `language: string` y acepte solo claves declaradas en `fields` además de `language`.
- [x] Rechazar `fields.language` a nivel de tipos y también en la validación runtime.
- [x] Exigir `width` y `height` como enteros positivos finitos en la validación runtime.
- [x] Exigir al menos una entrada en `content`; la primera clave de inserción es el locale inicial.
- [x] Eliminar cualquier concepto de título, descripción o nombre de descarga localizado: el título sale del último segmento del slug y el PNG se llama `<slug-con-guiones>.png`.
- [x] Definir la UI inicial del editor en español fijo; las categorías tampoco tendrán traducciones.

## Fixtures de tipos

- [x] Crear una plantilla válida con dos idiomas y comprobar `data.title`, `data.accentColor` y `locale` como `'es' | 'en'`.
- [x] Crear una fixture que declare `fields: { language: fields.text(...) }` y marcarla como error esperado.
- [x] Crear una fixture con `content.es` sin `language` y marcarla como error esperado.
- [x] Crear una fixture con una clave de contenido no declarada y marcarla como error esperado.
- [x] Crear una fixture que pase `min` a un campo que no sea `number` y marcarla como error esperado.
- [x] Crear una fixture que asigne un valor no string a un campo de `content` y marcarla como error esperado.

## Cierre

- [x] Typecheck acepta la plantilla válida y rechaza las cinco fixtures inválidas.
- [x] Ningún tipo público del contrato nuevo importa `Locale`, mensajes o tipos de la aplicación actual.
