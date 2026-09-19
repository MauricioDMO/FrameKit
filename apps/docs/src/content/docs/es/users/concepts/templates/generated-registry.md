---
title: Registro de plantillas generado
description: Comprende el registro de plantillas generado, sus metadatos, el manifiesto de recursos y los cargadores diferidos.
sidebar:
  order: 6
---

FrameKit descubre las plantillas y escribe módulos generados en `src/generated/framekit/`. El registro de plantillas es una salida desechable; cambia el origen en `src/templates/` y vuelve a generar en lugar de editar los archivos generados.

## Entradas del registro

El array `templates` generado contiene una `TemplateRegistryEntry` por cada plantilla descubierta. Cada entrada contiene:

- `slug`, la ruta separada por barras desde `src/templates/`;
- `segments`, los segmentos de ruta originales;
- `meta` validado;
- `width` y `height`;
- `variants` y `variantKeys`;
- el manifiesto `assets` generado; y
- `load`, una función de carga diferida que importa la definición de la plantilla.

El resumen conserva en `variantKeys` el orden declarado de las claves de contenido. Las entradas del registro se ordenan alfabéticamente por `slug` durante el descubrimiento. La definición de plantilla cargada posteriormente debe mantener las mismas dimensiones y claves de variantes de contenido representadas por la entrada.

El módulo de plantilla generado tiene la forma pública que espera `FrameKitStudio`:

```ts
import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

export const templates: TemplateRegistryEntry[] = [
  // generated entries
]
```

El código fuente generado no es una superficie de autoría. No edites manualmente `src/generated/framekit/templates.ts` ni los archivos copiados en `public/framekit/`.

## Cuándo se ejecuta la generación

Usa el comando de una sola ejecución cuando necesites volver a generar explícitamente:

```bash
pnpm framekit generate
```

Los demás comandos del ciclo de vida se comportan así:

- `pnpm framekit dev` genera antes de iniciar y observa los cambios en `src/templates/` y `src/brand/`;
- `pnpm framekit check` genera antes de validar las plantillas y el contenido resuelto;
- `pnpm framekit build` ejecuta la comprobación, que genera antes de la compilación de Next.js; y
- `pnpm framekit start` lee la salida de producción existente y no genera.

La generación requiere al menos una plantilla descubierta. Escribe el registro de plantillas, el registro de marcas, las copias de recursos y los clientes generados; el registro de marcas queda vacío si el proyecto no tiene componentes de marca.

Para consultar la definición que produce cada resumen del registro, consulta la [definición de plantilla](/es/users/concepts/templates/definition). Para consultar el contrato exacto de la entrada, consulta la [referencia de plantillas](/es/users/reference/template).
