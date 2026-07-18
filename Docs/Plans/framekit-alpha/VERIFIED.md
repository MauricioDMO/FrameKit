# Framekit Alpha — Estado de Verificación

## Verificados ✅

| Plan | Descripción                | Verificado el |
| ---- | -------------------------- | ------------- |
| 00   | Contrato y base de pruebas | 2026-07-17    |
| 01   | Núcleo dentro de Studio    | 2026-07-17    |
| 02   | Generación estática        | 2026-07-17    |
| 03   | Editor                     | 2026-07-17    |
| 04   | Navegación y migración     | 2026-07-18    |

La tabla conserva el historial de lo verificado. Una revisión posterior encontró
brechas de contrato que no invalidan la migración realizada, pero sí bloquean la
extracción y publicación hasta cerrar la fase 04.5.

## Revisión posterior

- El scanner confundía cualquier subdirectorio de una plantilla con una plantilla hija.
- `render` no infería todavía las claves concretas de `fields` y `content`.
- Las fixtures positivas describían inferencia mediante comentarios, sin comprobarla.
- La validación de datos contenía mensajes en español y la definición runtime no inspeccionaba cada descriptor ni `render`.
- El reset mutaba el objeto anidado anterior y limpiaba errores con una clave de locale incorrecta.
- El editor perdía `min` y `max` y enfocaba el contenedor del campo.
- La plantilla piloto repetía defaults dentro de cada locale.
- La solución acordada añade `defineTemplateBase` para separar definición y componente conservando autocompletado y tipos exactos.

### Detalle 00-contract.md
- Tipos: `TemplateFieldKind` (`text | textarea | number | color | url`)
- `TemplateDefinition`, `TemplateRenderProps`, `InferTemplateData` públicos
- `min`/`max` solo en `fields.number`
- Validación runtime: dimensiones, campos reservados, content, language
- 6 type fixtures creadas y typecheck passing
- UI del editor usa i18n (desviación aceptada del plan original)

### Detalle 01-core.md
- Archivos en `src/lib/framekit/core/` y `src/lib/framekit/markdown/`
- `fields.text`, `fields.textarea`, `fields.number` (c/min/max), `fields.color`, `fields.url`
- `defineTemplate`, `getDefaultValues`, `getLocales`, `resolveTemplateData`, `validateTemplateDefinition`
- `Markdown` component
- Plantilla piloto migrada: `src/templates/redes-sociales/instagram/promocion-cuadrada/template.tsx`
- `config.ts` eliminado de la plantilla piloto

### Detalle 02-codegen.md
- Scanner en `scripts/generate-template-registry.mjs`
- `src/.framekit/manifest.ts` y `registry.ts` generados
- `writeIfChanged` para evitar reinicios
- `src/generated/`, `read-template-catalog.ts`, `get-template-config.ts` eliminados
- `outputFileTracingIncludes` eliminado de next.config

### Detalle 03-editor.md
- Carga de template via `templateRegistry[slug]`
- Estados: loading, error, invalid, ready
- `selectedLocale` = primera clave de content
- `resolveTemplateData` para preview y exportación
- Persistencia en `localStorage` (`framekit:<slug>:v1`)
- Validación runtime de datos (required, number min/max, url)
- Exportación PNG con `document.fonts.ready`
- Zoom, arrastre, escala, tema conservados

### Detalle 04-migration.md
- `generate-template-registry.mjs` busca `template.tsx` a cualquier profundidad
- Genera `src/.framekit/manifest.ts` y `registry.ts`
- `manifestToNavigation()` deriva categorías de segmentos, reutiliza prefijos, humaniza nombres
- Enlaces con formato `/editor/<slug>` ordenados por título
- Tipos de navegación en `manifest-to-navigation.ts` (no en `types.ts`)
- Ruta `[[...slug]]` valida slug contra manifiesto y carga via `templateRegistry`
- Raíz redirige a `/editor`
- Plantilla piloto migrada sin `config.ts`
- `src/generated/`, `read-template-catalog.ts`, `get-template-config.ts`, `src/lib/templates/types.ts` eliminados
- i18n con `es`/`en`, `LocaleProvider`, `LanguageSelect` conservados
- `selectedLocale` independiente del locale de interfaz
- `_folder.json` eliminado; scanner ignora archivos que empiezan con `_`
- Sin referencias al contrato legado

## Pendientes 🔲

| Plan | Descripción       |
| ---- | ----------------- |
| 04.5 | Endurecimiento del contrato |
| 05   | Application tests |
| 06   | Workspace         |
| 07   | Framekit package  |
| 08   | CLI               |
| 09   | Create framekit   |
| 10   | Distribution      |
| 11   | Release           |
