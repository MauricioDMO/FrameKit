---
title: Archivos generados
description: Comprende los registros generados, los recursos copiados y la salida de compilación desechable de FrameKit.
sidebar:
  order: 3
---

FrameKit genera archivos locales del proyecto a partir de la fuente mantenida en `src/templates/` y, cuando existe, en `src/brand/`. La salida generada es desechable: cambia la fuente y ejecuta la generación en lugar de editar los archivos generados.

## Registro generado y clientes

`framekit generate` escribe estos archivos en `src/generated/framekit/`:

```text
src/generated/framekit/
├── brands.ts
├── render-client.tsx
├── studio-client.tsx
└── templates.ts
```

`templates.ts` exporta el arreglo `templates` generado. Cada entrada del registro contiene el slug de la plantilla y los segmentos de su ruta, metadatos validados, dimensiones, variantes, claves de variantes ordenadas según su declaración, un manifiesto de recursos y una función `load` diferida para la definición de la plantilla. `brands.ts` se genera a partir de los componentes de marca del proyecto. Los dos archivos de cliente vinculan los catálogos generados con los puntos de entrada públicos de Studio y del cliente.

El registro generado es una superficie de integración para el proyecto generado, no una superficie de autoría de plantillas. No edites manualmente los archivos de `src/generated/framekit/`; actualiza las plantillas de origen o los componentes de marca y vuelve a generar.

## Recursos de plantilla copiados

La generación elimina y vuelve a crear `public/framekit/templates/`, y después copia en ella los archivos descubiertos en los directorios locales de recursos de las plantillas. Los recursos se descubren a partir de archivos directos en `src/templates/<slug>/assets/common/` y `assets/<variant>`; el manifiesto generado asigna esos archivos a URL como las siguientes:

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

Los archivos públicos que están fuera de esos directorios de recursos de plantilla no se añaden al manifiesto. Siguen siendo archivos de la aplicación y se pueden referenciar con una URL raíz-relativa compatible como `/assets/logos/brand.svg`. Consulta [recursos de plantilla](/es/users/concepts/templates/assets) para conocer las reglas de descubrimiento y nomenclatura.

## Salida de compilación y validación

El proyecto generado reserva estas rutas:

| Ruta | Contenido |
| --- | --- |
| `.framekit/next/` | Salida de producción standalone de Next.js creada por la configuración de Next.js de FrameKit. |
| `.framekit/` | Salida temporal de FrameKit, incluido el directorio temporal utilizado mientras `framekit check` valida las plantillas. |
| `.framekit-data/` | Directorio de la base de datos SQLite predeterminada (`.framekit-data/framekit.sqlite`) cuando la autenticación está activada y no se establece `FRAMEKIT_DATABASE_PATH`. El modo abierto no lo inicializa. |
| `public/framekit/templates/` | Recursos de plantilla copiados durante la generación. |
| `src/generated/framekit/` | Registros generados y vinculaciones de clientes. |

**Advertencia:** Cuando se usa la ruta predeterminada con `FRAMEKIT_AUTH_ENABLED=true`, `.framekit-data/framekit.sqlite` contiene la base de datos SQLite persistente de FrameKit. Conserva el directorio `.framekit-data/` entre reinicios y despliegues; no lo elimines como salida generada. Si estableces `FRAMEKIT_DATABASE_PATH`, conserva el directorio de esa ruta; `:memory:` no es persistente. El modo abierto no crea esta base de datos.

La plantilla del repositorio ignora estas rutas. Las salidas generadas (`.framekit/`, `public/framekit/` y `src/generated/framekit/`) se pueden eliminar y regenerar según corresponda; `.framekit-data/` se ignora para no versionar datos, pero debe conservarse cuando se usa para la base de datos predeterminada en modo autenticado. `framekit start` lee la salida de producción existente; no genera el registro.

Para consultar los comandos que producen estos archivos, consulta la [referencia de la CLI de FrameKit](/es/users/reference/cli/framekit). Para conocer la estructura de origen, consulta [estructura del proyecto](/es/users/getting-started/project-structure).
