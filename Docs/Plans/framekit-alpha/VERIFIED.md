# Framekit Alpha — Estado de Verificación

## Verificados ✅

| Plan | Descripción | Verificado el |
|------|-------------|---------------|
| 00 | Contrato y base de pruebas | 2026-07-17 |
| 01 | Núcleo dentro de Studio | 2026-07-17 |
| 02 | Generación estática | 2026-07-17 |
| 03 | Editor | 2026-07-17 |

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

## Pendientes 🔲

| Plan | Descripción |
|------|-------------|
| 04 | Migration |
| 05 | Application tests |
| 06 | Workspace |
| 07 | Framekit package |
| 08 | CLI |
| 09 | Create framekit |
| 10 | Distribution |
| 11 | Release |
