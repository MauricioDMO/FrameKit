---
title: API del paquete de Next.js
description: Aplica la configuración de producción de Next.js requerida por FrameKit.
sidebar:
  order: 5
---

**Importación:** `@mauriciodmo/framekit/next`  
**Entorno:** herramientas; úsalo desde el módulo de configuración de Next.js.

Este punto de entrada exporta `withFrameKit(config?)`. Devuelve una configuración de Next.js con la salida independiente, el directorio de compilación y la redirección raíz requeridos por FrameKit, a la vez que conserva la configuración personalizada compatible.

## Ejemplo mínimo

```ts
import { withFrameKit } from '@mauriciodmo/framekit/next'

export default withFrameKit({
  reactStrictMode: true
})
```

## Restricciones del bundle y del tiempo de ejecución

Esta es una configuración en tiempo de compilación, no una importación de componente. `withFrameKit` establece `output: 'standalone'` y `distDir: '.framekit/next'`, y añade una redirección temporal de `/` a `/editor`. Se rechaza un `output` o `distDir` diferente; una redirección raíz existente debe ser la misma redirección temporal.

Consulta [integrar un proyecto existente de Next.js](/es/users/getting-started/existing-project), [tiempo de ejecución del despliegue](/es/users/deployment/runtime) y el [índice de la API del paquete](/es/users/reference/package-api).
