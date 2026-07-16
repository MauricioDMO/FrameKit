# Arquitectura

[Volver al índice](README.md)

## Flujo general

```text
src/templates
    ↓
script de generación
    ↓
registro servidor de configuraciones + registro cliente de componentes
    ↓
layout y ruta dinámica
    ↓
barra lateral + editor + exportación PNG
```

## Plantillas como fuente de verdad

Cada plantilla contiene:

- `config.ts`: metadatos, tamaño, campos y valores iniciales.
- `template.tsx`: representación visual de la imagen.

Las categorías pueden contener `_folder.json` para controlar título y orden.

## Registros generados

`scripts/generate-template-registry.mjs` recorre `src/templates` y genera:

- `src/generated/template-registry.ts`: importaciones dinámicas de los componentes visuales.
- `src/generated/template-config-registry.ts`: importaciones estáticas de las configuraciones tipadas.

El empaquetador puede identificar todas las importaciones porque las rutas generadas son estáticas. Los archivos de `src/generated/` no deben editarse manualmente.

## Servidor

`read-template-catalog.ts` usa `node:fs` para descubrir la jerarquía de carpetas. Combina esa estructura con el registro de configuraciones y produce nodos serializables para la navegación.

`get-template-config.ts` valida los segmentos del slug y obtiene la configuración desde el registro servidor.

El layout de `/editor` y la página `[[...slug]]` son Server Components. El runtime se fija en Node.js porque el catálogo usa el sistema de archivos.

## Cliente

La barra lateral, los campos, la vista previa y el editor son Client Components porque usan navegación, eventos, estado, `ResizeObserver`, fuentes del documento y descarga del navegador.

El cliente nunca recibe rutas del sistema ni usa `node:fs`; recibe únicamente configuraciones y nodos serializables.

## Producción standalone

`next.config.ts` incluye `_folder.json` y `config.ts` en el rastreo de archivos. Esto conserva la estructura necesaria para el escaneo de categorías dentro del build `standalone`.

## Límites de confianza

Las configuraciones son código local compilado y validado mediante `satisfies TemplateConfig`. No se usa validación runtime adicional. Si en el futuro las configuraciones provienen de una API, base de datos o carga de usuario, valida esa entrada en el límite antes de convertirla en `TemplateConfig`.

Consulta [Creación de plantillas](creating-templates.md) para el flujo práctico.
