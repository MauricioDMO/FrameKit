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
| 06   | Workspace                   | 2026-07-18    |

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
- Código reutilizable extraído posteriormente a `packages/framekit/src/core/` y `packages/framekit/src/markdown/`
- `fields.text`, `fields.textarea`, `fields.number` (c/min/max), `fields.color`, `fields.url`
- `defineTemplate`, `getDefaultValues`, `getLocales`, `resolveTemplateData`, `validateTemplateDefinition`
- `Markdown` component
- Plantilla piloto migrada: `apps/studio/src/templates/redes-sociales/instagram/promocion-cuadrada/template.tsx`
- `config.ts` eliminado de la plantilla piloto

### Detalle 02-codegen.md
- Scanner en `packages/framekit/src/codegen/generate-template-registry.mjs`
- `apps/studio/src/.framekit/manifest.ts` y `registry.ts` generados
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
- Genera `apps/studio/src/.framekit/manifest.ts` y `registry.ts`
- `manifestToNavigation()` deriva categorías de segmentos, reutiliza prefijos, humaniza nombres
- Enlaces con formato `/editor/<slug>` ordenados por título
- Tipos de navegación en `packages/framekit/src/editor/navigation.ts` (no en `types.ts`)
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

### Detalle 06-workspace.md
- El root es privado y coordina `apps/*`, `packages/*` y `examples/*` mediante pnpm.
- Studio vive en `apps/studio/` con sus rutas, componentes, i18n, plantilla piloto, assets y scripts locales.
- `@mauriciodmo/framekit` vive en `packages/framekit/` y recibe core, editor, Markdown, codegen, pruebas y fixtures de tipos.
- El codegen se ejecuta desde Studio mediante el script privado del workspace; no hay imports a `packages/framekit/src`.
- `packages/create-framekit` y `examples/basic` existen como workspaces privados independientes.
- Studio consume `@mauriciodmo/framekit` y `@mauriciodmo/framekit/editor` mediante `workspace:*`.
- La API existente del paquete, incluidos validadores, resolvers, descriptores y errores estructurados, queda pública.
- `apps/studio/src/.framekit/manifest.ts` y `registry.ts` son generados e ignorados por Git.
- `apps/studio/src/app/globals.css` escanea `packages/framekit/src` para incluir los estilos del árbol, editor y fields durante la transición.
- La guía operativa está en [`Docs/workspace.md`](../../workspace.md).
- Verificado con `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build` y `pnpm --filter studio dev`.

## Pendientes 🔲

| Plan | Descripción       |
| ---- | ----------------- |
| 07   | Framekit package  |
| 08   | CLI               |
| 09   | Create framekit   |
| 10   | Distribution      |
| 11   | Release           |
