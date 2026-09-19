---
title: API principal del paquete
description: Define, valida, resuelve y renderiza datos de plantillas de FrameKit con la importación del paquete raíz.
sidebar:
  order: 2
---

**Importación:** `@mauriciodmo/framekit`  
**Entorno:** compartido; las funciones auxiliares principales exportadas no requieren un navegador, y `Markdown` puede renderizarse en código React de servidor o de cliente.

El punto de entrada raíz define el contrato de las plantillas: constructores de definiciones, constructores de campos, validación, funciones auxiliares de variantes y valores predeterminados, resolución de datos y el componente `Markdown`.

## Exportaciones principales

- `defineTemplate` y `defineTemplateBase` definen la forma canónica de la plantilla.
- `field` proporciona constructores de campos `text`, `color`, `number`, `image`, `choice` y `boolean`.
- `validateTemplateBase`, `validateTemplateDefinition` y `validateTemplateData` validan las definiciones y los valores resueltos.
- `resolveTemplateData`, `getVariants` y `getDefaultValues` proporcionan funciones auxiliares de datos y variantes.
- `Markdown` renderiza el subconjunto ligero de Markdown compatible.
- Los tipos públicos incluyen `TemplateDefinition`, `TemplateBase`, `TemplateRegistryEntry`, `TemplateRenderProps`, `InferTemplateData`, descriptores de campos, manifiestos de recursos, variantes y errores de validación.

## Ejemplo mínimo

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Square promotion' },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({ label: 'Title' })
  },
  variants: { default: 'en' },
  content: { en: { title: 'Hello' } },
  render ({ data, width, height }) {
    return <article style={{ width, height }}>{data.title}</article>
  }
})
```

## Restricciones del bundle y del tiempo de ejecución

Usa este punto de entrada para el código fuente de las plantillas y las funciones auxiliares compartidas. No sustituye a los puntos de entrada de cliente, Studio, Next.js o servidor. El componente `Markdown` admite formato en línea y listas simples opcionales; no es un renderizador completo de CommonMark.

Consulta la [referencia de plantillas](/es/users/reference/template), [crear una plantilla](/es/users/guides/create-template) y el [índice de la API del paquete](/es/users/reference/package-api).
