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

- `config.ts`: dimensiones compartidas, idiomas propios y contenido localizado.
- `template.tsx`: representación visual de la imagen; recibe el idioma del diseño para sus textos fijos.

Las categorías pueden contener `_folder.json` para controlar título y orden.

## Registros generados

`scripts/generate-template-registry.mjs` recorre `src/templates` y genera:

- `src/generated/template-registry.ts`: importaciones dinámicas de los componentes visuales.
- `src/generated/template-config-registry.ts`: importaciones estáticas de las configuraciones tipadas.

El empaquetador puede identificar todas las importaciones porque las rutas generadas son estáticas. Los archivos de `src/generated/` no deben editarse manualmente.

## Servidor

`read-template-catalog.ts` usa `node:fs` para descubrir la jerarquía de carpetas. Combina esa estructura con el registro de configuraciones, resuelve el idioma de la interfaz y produce nodos serializables para la navegación.

`get-template-config.ts` valida los segmentos del slug y obtiene la configuración completa desde el registro servidor.

Las rutas viven bajo `/{locale}/editor`; `proxy.ts` añade el locale según `Accept-Language` cuando falta. El layout y la página `[[...slug]]` son Server Components. El runtime se fija en Node.js porque el catálogo usa el sistema de archivos.

## Cliente

La barra lateral, los campos, la vista previa y el editor son Client Components porque usan navegación, eventos, estado, `ResizeObserver`, fuentes del documento y descarga del navegador.

Cada `config.ts` declara `languages`, `metadata`, `fields` y `content`. El idioma del diseño se resuelve contra `languages`; si no existe, se usa su primera clave. Ese idioma determina título, descripción, etiquetas, placeholders, valores iniciales, nombre de descarga y el `locale` recibido por la plantilla. El selector es el primer control del formulario. El contenido se guarda en `sessionStorage` por slug para sobrevivir al cambio del idioma de la interfaz durante la sesión.

El cliente nunca recibe rutas del sistema ni usa `node:fs`; recibe únicamente configuraciones y nodos serializables.

## Producción standalone

`next.config.ts` incluye `_folder.json` y `config.ts` en el rastreo de archivos. Esto conserva la estructura necesaria para el escaneo de categorías dentro del build `standalone`.

## Límites de confianza

`defineTemplateConfig` infiere las claves de `languages` y exige que `metadata`, cada `label`/`placeholder` y `content` las completen. También exige que cada entrada de `content` incluya todos los `field.key`. `title` es obligatorio; `description` y `fileName` son opcionales. Las configuraciones son código local compilado y validado por TypeScript; no se usa validación runtime adicional.

Consulta [Creación de plantillas](creating-templates.md) para el flujo práctico.
