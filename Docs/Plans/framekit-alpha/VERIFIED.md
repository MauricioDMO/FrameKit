# Framekit Alpha — Estado de Verificación

## Verificados ✅

| Plan | Descripción                | Verificado el |
| ---- | -------------------------- | ------------- |
| 00   | Contrato y base de pruebas | 2026-07-17    |
| 01   | Núcleo dentro de Studio    | 2026-07-17    |
| 02   | Generación estática        | 2026-07-17    |
| 03   | Editor                     | 2026-07-17    |
| 04   | Navegación y migración     | 2026-07-18    |
| 04.5 | Endurecimiento del contrato | 2026-07-18   |
| 05   | Pruebas de la aplicación   | 2026-07-18    |

La tabla conserva el historial de lo verificado.

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

### Detalle 05-application-tests.md
- Vitest usa Node por defecto y `jsdom` solo en las pruebas del editor.
- Scanner, manifiesto, navegación, resolución, validadores y estado tienen cobertura unitaria.
- La generación se prueba con árboles temporales, segmentos inválidos, directorios ignorados, orden estable e imports relativos.
- La plantilla piloto se carga mediante el loader generado y se valida su `default export`.
- Las fixtures positivas y negativas de tipos se ejecutan dentro de `pnpm typecheck`.
- Se añadió integración para `defineTemplateBase` con componente extraído conservando la inferencia de tipos.
- La ubicación futura de las pruebas queda separada por propiedad entre `packages/framekit` y `apps/studio`.
- `pnpm lint`, `pnpm test`, `pnpm typecheck` y `pnpm build` pasan desde una instalación limpia.

## Pendientes 🔲

| Plan | Descripción       |
| ---- | ----------------- |
| 06   | Workspace         |
| 07   | Framekit package  |
| 08   | CLI               |
| 09   | Create framekit   |
| 10   | Distribution      |
| 11   | Release           |
