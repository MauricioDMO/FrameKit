# Inventario de contenido y contratos — fase 0

- **Estado:** Completado como inventario documental; no publica el sitio ni cambia enlaces.
- **Fecha de revisión:** 2026-09-17.
- **URL canónica aprobada del sitio:** `https://framekit.mauriciodmo.com`.
- **Prefijos de idioma aprobados:** `/en/` y `/es/`.
- **Fuente de este inventario:** el checkout actual. Las rutas, nombres, exports,
  comandos y valores se contrastaron contra código, manifests, configuración
  ejecutable, tests, template canónico y documentación legacy.

La URL anterior es el destino aprobado del sitio documental. No se debe anunciar
como sitio canónico en el producto ni cambiar enlaces del repositorio hasta el
gate de rollout de la fase 10. El contenido publicado deberá vivir bajo
`apps/docs/src/content/docs/`; este archivo solo coordina la migración.

## Fuera de la migración publicada

`Docs/Plans/` y `Docs/skills/` **no** se migran al sitio publicado y no reciben
una disposición de contenido público. `Docs/Plans/` conserva planes y registros
de ejecución; `Docs/skills/` conserva las skills fuente que sincronizan las
copias de `.agents/skills`. La retirada prevista se limita a las copias públicas
legacy de `Docs/en/` y `Docs/es/`, y solo después de que la fase 10 verifique el
sitio en producción y todos los enlaces hayan sido actualizados.

## Disposiciones

| Disposición | Uso en este inventario |
| --- | --- |
| `migrate` | Llevar el tema a una ruta equivalente del sitio, verificando ejemplos y contrato contra la implementación actual. |
| `split` | Separar un documento que mezcla audiencias o responsabilidades en páginas de `users/` y/o `contributors/`. |
| `combine` | Unir contenido superpuesto en una sola responsabilidad publicada y enlazar desde la otra ruta si hace falta. |
| `archive` | Conservar como contexto histórico no normativo, fuera de la referencia de comportamiento actual. |
| `remove` | Retirar la copia legacy después del rollout; no significa borrarla durante esta fase. |

## Inventario de documentación pública actual

La separación EN/ES se conserva durante la migración; las dos listas siguientes
son exhaustivas respecto de los 17 archivos encontrados bajo cada árbol. La
columna de líneas identifica el índice o las secciones que fijan el tema actual;
las disposiciones describen el destino, no una edición de esos archivos en fase 0.

### Inglés

| Archivo actual | Audiencia / tema | Disposición | Evidencia de tema |
| --- | --- | --- | --- |
| `Docs/en/README.md` | Usuarios y contribuidores; índice general de getting started, guías, referencia y desarrollo. | `split` | `Docs/en/README.md:5-30` |
| `Docs/en/getting-started/create-project.md` | Usuarios; instalación, `create-framekit`, configuración, Docker y primer servidor. | `split` | `Docs/en/getting-started/create-project.md:1-17,58-125` |
| `Docs/en/getting-started/existing-project.md` | Usuarios/integradores; integración Next.js, aliases, rutas, generación y variables de runtime. | `split` | `Docs/en/getting-started/existing-project.md:1-18,20-52,161-228` |
| `Docs/en/getting-started/migration-v0.8.0.md` | Usuarios que mantienen proyectos históricos; migración fijada de v0.7.0 a v0.8.0. | `archive` | `Docs/en/getting-started/migration-v0.8.0.md:1-13,15-29` |
| `Docs/en/getting-started/migration-next.md` | Usuarios/integradores; migración rolling del contrato sin versión, API autenticada y cambios de Studio. | `split` | `Docs/en/getting-started/migration-next.md:1-24,269-286,321-428` |
| `Docs/en/guides/template-authoring.md` | Usuarios/autores; descubrimiento, slugs, definición, fields, variantes, assets y codegen. | `split` | `Docs/en/guides/template-authoring.md:1-46,159-187,280-360` |
| `Docs/en/guides/brand-components.md` | Usuarios/autores; contrato de `src/brand`, componente, preview y catálogo. | `combine` | `Docs/en/guides/brand-components.md:1-45,46-89,112-145` |
| `Docs/en/guides/studio.md` | Usuarios; navegación, acceso, edición, persistencia, preview, tema y exportación. | `split` | `Docs/en/guides/studio.md:1-23,43-97,99-131` |
| `Docs/en/reference/template-contract.md` | Usuarios/autores; forma canónica, seis fields, resolución, variantes y validación. | `split` | `Docs/en/reference/template-contract.md:1-68,66-207,225-387` |
| `Docs/en/reference/brand-catalog.md` | Usuarios/autores; descubrimiento, módulo generado y estados de `/brand`. | `combine` | `Docs/en/reference/brand-catalog.md:1-10,10-101,116-157` |
| `Docs/en/reference/markdown.md` | Usuarios/autores; componente `Markdown` y subconjunto soportado. | `migrate` | `Docs/en/reference/markdown.md:1-20,22-78` |
| `Docs/en/reference/cli.md` | Usuarios/contribuidores; ambos CLIs, variables, browser install, generación, check, dev, build y start. | `split` | `Docs/en/reference/cli.md:1-67,71-180,184-213,217-343` |
| `Docs/en/reference/public-api.md` | Usuarios/integradores; exports publicados, types, Studio, server facade, API HTTP y peer dependencies. | `split` | `Docs/en/reference/public-api.md:1-68,72-114,118-267,271-348,390-515,562-590` |
| `Docs/en/development/repository.md` | Contribuidores; workspaces, límites de paquetes, generación y workflow local. | `split` | `Docs/en/development/repository.md:1-23,25-64,78-119,121-162` |
| `Docs/en/development/testing-and-distribution.md` | Contribuidores/release; tests, gates, tarballs, Docker smoke y registry smoke. | `split` | `Docs/en/development/testing-and-distribution.md:1-19,58-114,129-190,192-217,323-432` |
| `Docs/en/development/release.md` | Contribuidores/release; versionado independiente, gates, publicación y tags. | `migrate` | `Docs/en/development/release.md:1-12,14-51,53-93` |
| `Docs/en/development/troubleshooting.md` | Usuarios/contribuidores; fallos de discovery, codegen, acceso, configuración, build y export. | `split` | `Docs/en/development/troubleshooting.md:1-57,141-181,185-242,246-382` |

### Español

| Archivo actual | Audiencia / tema | Disposición | Evidencia de tema |
| --- | --- | --- | --- |
| `Docs/es/README.md` | Usuarios y contribuidores; índice general traducido. | `split` | `Docs/es/README.md:5-30` |
| `Docs/es/getting-started/create-project.md` | Usuarios; creación, prompts, instalación y primer proyecto. | `split` | `Docs/es/getting-started/create-project.md:1-34` |
| `Docs/es/getting-started/existing-project.md` | Usuarios/integradores; integración con Next.js y build. | `split` | `Docs/es/getting-started/existing-project.md:1-35` |
| `Docs/es/getting-started/migration-v0.8.0.md` | Usuarios con proyectos históricos; ruta publicada v0.7.0 → v0.8.0. | `archive` | `Docs/es/getting-started/migration-v0.8.0.md:1-14,16-30` |
| `Docs/es/getting-started/migration-next.md` | Usuarios/integradores; contrato rolling, API autenticada y cambios implementados. | `split` | `Docs/es/getting-started/migration-next.md:1-26` |
| `Docs/es/guides/template-authoring.md` | Usuarios/autores; authoring, slugs, registro y contrato de plantillas. | `split` | `Docs/es/guides/template-authoring.md:1-45` |
| `Docs/es/guides/brand-components.md` | Usuarios/autores; árbol `src/brand`, discovery y authoring. | `combine` | `Docs/es/guides/brand-components.md:1-39,41-45` |
| `Docs/es/guides/studio.md` | Usuarios; Studio, acceso, `/editor`, `/brand`, `/settings`, variantes y locale. | `split` | `Docs/es/guides/studio.md:1-24,26-52` |
| `Docs/es/reference/template-contract.md` | Usuarios/autores; contrato canónico, fields, variantes y render boundary. | `split` | `Docs/es/reference/template-contract.md:1-44` |
| `Docs/es/reference/brand-catalog.md` | Usuarios/autores; discovery, codegen y catálogo de marca. | `combine` | `Docs/es/reference/brand-catalog.md:1-35` |
| `Docs/es/reference/markdown.md` | Usuarios/autores; componente Markdown y sintaxis soportada. | `migrate` | `Docs/es/reference/markdown.md:1-25` |
| `Docs/es/reference/cli.md` | Usuarios/contribuidores; uso de `framekit` y `create-framekit`. | `split` | `Docs/es/reference/cli.md:1-45` |
| `Docs/es/reference/public-api.md` | Usuarios/integradores; puntos de entrada y exports públicos. | `split` | `Docs/es/reference/public-api.md:1-45` |
| `Docs/es/development/repository.md` | Contribuidores; estructura del monorepo y workspaces. | `split` | `Docs/es/development/repository.md:1-23` |
| `Docs/es/development/testing-and-distribution.md` | Contribuidores/release; pruebas y distribución de paquetes. | `split` | `Docs/es/development/testing-and-distribution.md:1-19` |
| `Docs/es/development/release.md` | Contribuidores/release; procedimiento de publicación. | `migrate` | `Docs/es/development/release.md:1-22` |
| `Docs/es/development/troubleshooting.md` | Usuarios/contribuidores; diagnóstico de discovery y catálogos. | `split` | `Docs/es/development/troubleshooting.md:1-30` |

Las rutas `es/` deben mantener la misma jerarquía temática que `en/`, pero no
se debe traducir texto histórico como si fuera contrato actual. La fase 9
verificará la paridad final y la fase 10 retirará ambos árboles legacy; ninguna
de esas acciones forma parte de este inventario.

## README públicos que enlazan la documentación legacy

| Archivo público | Enlaces actuales | Acción posterior de rollout |
| --- | --- | --- |
| `Docs/README.md` | `en/README.md` y `es/README.md` (`Docs/README.md:5-6`). | Actualizar esos enlaces durante el rollout al sitio canónico; mantener `Docs/Plans/` fuera de la disposición de migración. |
| `README.md` | `Docs/en/README.md` y `Docs/es/README.md` (`README.md:106-111`). | En fase 10, sustituir por `https://framekit.mauriciodmo.com/en/` y `https://framekit.mauriciodmo.com/es/`, validar enlaces y solo después retirar los árboles legacy. |
| `README.es.md` | `Docs/en/README.md` y `Docs/es/README.md` (`README.es.md:107-112`). | Misma actualización bilingüe en fase 10; no editar en fase 0. |
| `packages/framekit/README.md` | Índice, guías, CLI y API en `github.com/.../Docs/en/...` (`packages/framekit/README.md:303-309`); también API legacy referenciada en `:250`. | Cambiar a rutas del sitio canónico en fase 10, tras verificar que cada página exista en `/en/` y `/es/`. |
| `packages/create-framekit/README.md` | API, guía de templates e índices EN/ES (`packages/create-framekit/README.md:70-89`). | Cambiar a rutas del sitio canónico en fase 10 y comprobar que el README publicado no apunte a `Docs/**`. |
| `packages/create-framekit/template/README.md` | Guía de authoring y ambos índices legacy (`packages/create-framekit/template/README.md:32-34,96-99`). | Actualizar la copia que se distribuye con el template durante el rollout; verificar el tarball después del cambio. |

No se modifican esos READMEs en esta tarea. La acción se reserva para la fase
10, junto con la auditoría de enlaces y la retirada de `Docs/en/` y `Docs/es/`.

## Manifest de páginas objetivo de las fases 1-8

Este manifest convierte los destinos explícitos de las fases 1-8 en una lista
auditable. Las fases 2-8 nombran primero las rutas inglesas; la fase 9 deberá
crear la contraparte española con la misma jerarquía y responsabilidad. La
disposición describe cómo llega cada destino al sitio, no una edición de la
documentación legacy durante esta fase.

### Fase 1 — Base y navegación

| audiencia | tipo | slug | fuente actual | disposición |
| --- | --- | --- | --- | --- |
| usuarios y contribuidores | índice de idioma | `en/index.mdx` | `Docs/en/README.md:1-30`; `apps/docs/package.json`, `astro.config.mjs`, `content.config.ts` | `split` |
| usuarios | entrada de audiencia | `en/users/index.md` | `Docs/en/README.md:5-16`; fase 1:41-53 | `migrate` |
| contribuidores | entrada de audiencia | `en/contributors/index.md` | `Docs/en/README.md:18-30`; fase 1:41-53 | `migrate` |
| usuarios y contribuidores | índice de idioma | `es/index.mdx` | `Docs/es/README.md:1-30`; configuración i18n de `apps/docs` | `split` |
| usuarios | entrada de audiencia | `es/users/index.md` | `Docs/es/README.md:5-16`; fase 1:41-53 | `migrate` |
| contribuidores | entrada de audiencia | `es/contributors/index.md` | `Docs/es/README.md:18-30`; fase 1:41-53 | `migrate` |

Fuente del destino: `Docs/Plans/documentation-site/01-starlight-foundation-and-navigation.md:26-53`.

### Fase 2 — Inicio para usuarios

| audiencia | tipo | slug | fuente actual | disposición |
| --- | --- | --- | --- | --- |
| usuarios | índice de getting started | `en/users/getting-started/index.md` | `Docs/en/README.md:5-10`; fase 2:25-33 | `combine` |
| usuarios | guía de creación | `en/users/getting-started/create-project.md` | `Docs/en/getting-started/create-project.md:1-129`; `packages/create-framekit/src/**`; template canónico | `migrate` |
| usuarios/integradores | guía de integración | `en/users/getting-started/existing-project.md` | `Docs/en/getting-started/existing-project.md:1-232`; `packages/framekit/src/next/**`, `packages/framekit/src/studio-root.ts` | `migrate` |
| usuarios | referencia de estructura | `en/users/getting-started/project-structure.md` | `packages/create-framekit/template/**`; `Docs/en/development/repository.md:78-119`; fase 2:40-50 | `split` |
| usuarios | tutorial de primer template | `en/users/getting-started/first-template.md` | `packages/create-framekit/template/src/templates/example/template.tsx:1-71`; `Docs/en/guides/template-authoring.md:52-100` | `combine` |

Fuente del destino: `Docs/Plans/documentation-site/02-user-getting-started.md:14-57`.

### Fase 3 — Templates, fields y brand

| audiencia | tipo | slug | fuente actual | disposición |
| --- | --- | --- | --- | --- |
| usuarios/autores | concepto | `en/users/concepts/templates/index.md` | `Docs/en/guides/template-authoring.md:1-46`; `Docs/en/reference/template-contract.md:1-64` | `split` |
| usuarios/autores | referencia de definición | `en/users/concepts/templates/definition.md` | `packages/framekit/src/types.ts:84-186`; `packages/framekit/src/core/define-template.ts:19-46`; `Docs/en/guides/template-authoring.md:159-185` | `migrate` |
| usuarios/autores | concepto de contenido | `en/users/concepts/templates/content-and-variants.md` | `Docs/en/guides/template-authoring.md:280-302`; `Docs/en/reference/template-contract.md:225-283` | `migrate` |
| usuarios/autores | referencia de fields | `en/users/concepts/templates/fields.md` | `packages/framekit/src/core/fields/index.ts:1-16`; `packages/framekit/src/core/__tests__/fields.test.ts:4-154`; `Docs/en/reference/template-contract.md:66-215` | `migrate` |
| usuarios/autores | guía de assets | `en/users/concepts/templates/assets.md` | `packages/framekit/src/tooling/discovery/find-assets.ts`; `Docs/en/guides/template-authoring.md:19-20,318-339` | `split` |
| usuarios/autores | referencia de generated registry | `en/users/concepts/templates/generated-registry.md` | `packages/framekit/src/tooling/codegen/write-template-module.ts:62-119`; codegen tests; `Docs/en/reference/public-api.md:72-114` | `migrate` |
| usuarios/autores | concepto de rendering | `en/users/concepts/templates/rendering.md` | `packages/framekit/src/types.ts:188-196`; `Docs/en/guides/template-authoring.md:304-327`; template canónico | `combine` |
| usuarios/autores | concepto de brand | `en/users/concepts/brand-components.md` | `Docs/en/guides/brand-components.md:1-45`; `packages/framekit/src/tooling/discovery/find-brand-components.ts` | `combine` |
| usuarios/autores | guía de creación | `en/users/guides/create-template.md` | `Docs/en/guides/template-authoring.md:48-157`; template canónico | `combine` |
| usuarios/autores | guía de definición separada | `en/users/guides/split-template-definition.md` | `Docs/en/guides/template-authoring.md:102-157`; `defineTemplateBase` | `migrate` |
| usuarios/autores | guía de imágenes | `en/users/guides/use-image-assets.md` | `Docs/en/reference/template-contract.md:185-207`; `packages/framekit/src/tooling/discovery/find-assets.ts` | `combine` |
| usuarios/autores | guía de brand | `en/users/guides/create-brand-components.md` | `Docs/en/guides/brand-components.md:46-145`; template `src/brand` contract | `migrate` |
| usuarios/autores | referencia de template | `en/users/reference/template.md` | `Docs/en/reference/template-contract.md:1-400`; validators y tipos públicos | `migrate` |
| usuarios/autores | referencia Markdown | `en/users/reference/markdown.md` | `Docs/en/reference/markdown.md:1-82`; `packages/framekit/src/markdown/**` | `migrate` |
| usuarios/autores | referencia brand catalog | `en/users/reference/brand-catalog.md` | `Docs/en/reference/brand-catalog.md:1-157`; `packages/framekit/src/tooling/codegen/create-brand-module.ts` | `combine` |

Fuente del destino: `Docs/Plans/documentation-site/03-templates-fields-and-brand.md:13-66`.

### Fase 4 — Studio, acceso y Editor

| audiencia | tipo | slug | fuente actual | disposición |
| --- | --- | --- | --- | --- |
| usuarios | concepto | `en/users/concepts/studio.md` | `packages/framekit/src/studio/**`; `Docs/en/guides/studio.md:1-131` | `split` |
| usuarios | guía de uso | `en/users/guides/use-studio.md` | `Docs/en/guides/studio.md:5-131`; `packages/framekit/src/editor/**` | `migrate` |
| usuarios | guía de cuenta y tokens | `en/users/guides/manage-account-and-tokens.md` | `packages/framekit/src/studio/settings/**`; `packages/framekit/src/server/access/**`; `Docs/en/guides/studio.md:9-23` | `split` |
| administradores | guía de usuarios | `en/users/guides/manage-users.md` | `packages/framekit/src/studio/settings/admin-users-settings.tsx`; access routes | `migrate` |
| usuarios | troubleshooting de Studio | `en/users/troubleshooting/studio.md` | `Docs/en/development/troubleshooting.md:310-322,361-382`; Studio tests | `combine` |
| usuarios | troubleshooting de acceso | `en/users/troubleshooting/access.md` | `packages/framekit/src/studio/page.tsx:19-39`; access/session routes; `Docs/en/guides/studio.md:9-23` | `migrate` |

Fuente del destino: `Docs/Plans/documentation-site/04-studio-access-and-editor.md:14-72`.

### Fase 5 — API de imágenes, seguridad y deployment

| audiencia | tipo | slug | fuente actual | disposición |
| --- | --- | --- | --- | --- |
| integradores/usuarios | índice HTTP | `en/users/reference/http-api/index.md` | `packages/framekit/src/server/api-handler.ts:7-24`; `Docs/en/reference/public-api.md:310-388` | `combine` |
| integradores/usuarios | referencia access | `en/users/reference/http-api/access.md` | `packages/framekit/src/server/access/http/index.ts:10-75`; access routes | `migrate` |
| integradores/usuarios | referencia image render | `en/users/reference/http-api/image-render.md` | `packages/framekit/src/server/image-handler/**`; `tests/e2e/image-api.spec.ts:3-63` | `migrate` |
| integradores/usuarios | referencia de errores | `en/users/reference/http-api/errors.md` | `packages/framekit/src/server/errors.ts`; image/access error handlers | `migrate` |
| operadores | índice de deployment | `en/users/deployment/index.md` | `Docs/en/getting-started/create-project.md:87-100`; template `Dockerfile` | `combine` |
| operadores | runtime | `en/users/deployment/runtime.md` | `packages/framekit/src/server/config.ts`; `.env.example`; `Docs/en/reference/cli.md:71-111` | `migrate` |
| operadores | Docker y persistencia | `en/users/deployment/docker-and-persistence.md` | `packages/create-framekit/template/Dockerfile:15-54`; `.env.example:1-14` | `migrate` |
| operadores | seguridad y reverse proxies | `en/users/deployment/security-and-reverse-proxies.md` | `packages/framekit/src/server/access/**`; `Docs/en/getting-started/existing-project.md:195-214`; fase 5:68-99 | `migrate` |
| integradores | guía de API | `en/users/guides/render-images-with-the-api.md` | `packages/framekit/src/server/api-handler.ts`; `Docs/en/reference/public-api.md:445-525` | `combine` |
| usuarios | troubleshooting de rendering | `en/users/troubleshooting/rendering.md` | `Docs/en/development/troubleshooting.md:262-382`; image handler tests | `combine` |
| operadores | troubleshooting de deployment | `en/users/troubleshooting/deployment.md` | `packages/create-framekit/template/Dockerfile`; `scripts/smoke-docker.mjs`; `Docs/en/reference/cli.md:126-180` | `combine` |

Fuente del destino: `Docs/Plans/documentation-site/05-image-api-security-and-deployment.md:14-145`.

### Fase 6 — Referencia, migraciones y troubleshooting

| audiencia | tipo | slug | fuente actual | disposición |
| --- | --- | --- | --- | --- |
| usuarios/integradores | índice package API | `en/users/reference/package-api/index.md` | `packages/framekit/package.json:20-61`; `packages/framekit/src/index.ts:1-11`; `Docs/en/reference/public-api.md:3-68` | `combine` |
| usuarios/integradores | referencia core | `en/users/reference/package-api/core.md` | `packages/framekit/src/index.ts:1-11`; `packages/framekit/src/types.ts:3-196` | `migrate` |
| usuarios/integradores | referencia client | `en/users/reference/package-api/client.md` | `packages/framekit/src/client/index.ts:1-3`; `packages/framekit/src/client/render-client.tsx` | `migrate` |
| usuarios/integradores | referencia editor | `en/users/reference/package-api/editor.md` | `packages/framekit/src/editor.ts:1-12` | `migrate` |
| usuarios/integradores | referencia next | `en/users/reference/package-api/next.md` | `packages/framekit/src/next.ts:1`; `Docs/en/getting-started/existing-project.md:20-35` | `migrate` |
| usuarios/integradores | referencia studio | `en/users/reference/package-api/studio.md` | `packages/framekit/src/studio.ts:1-4`; `packages/framekit/src/studio/framekit-studio.tsx` | `migrate` |
| usuarios/integradores | referencia studio root | `en/users/reference/package-api/studio-root.md` | `packages/framekit/src/studio-root.ts:1-2`; `packages/framekit/src/studio/page.tsx:19-39` | `migrate` |
| contribuidores avanzados | referencia dev | `en/users/reference/package-api/dev.md` | `packages/framekit/src/dev.ts:1-13`; tooling source | `migrate` |
| integradores/usuarios | referencia server | `en/users/reference/package-api/server.md` | `packages/framekit/src/server.ts:1-12`; server source | `migrate` |
| usuarios/integradores | referencia styles | `en/users/reference/package-api/styles.md` | `packages/framekit/package.json:56-61`; `packages/framekit/README.md:268-292` | `migrate` |
| usuarios | índice CLI | `en/users/reference/cli/index.md` | `Docs/en/reference/cli.md:1-67`; root CLI manifest/bin | `combine` |
| usuarios | referencia framekit CLI | `en/users/reference/cli/framekit.md` | `packages/framekit/src/tooling/cli/index.ts:12-56`; `Docs/en/reference/cli.md:217-343` | `migrate` |
| usuarios | referencia creator CLI | `en/users/reference/cli/create-framekit.md` | `packages/create-framekit/src/cli.ts:20-121`; `Docs/en/reference/cli.md:18-67` | `migrate` |
| usuarios | configuración | `en/users/reference/configuration.md` | `.env.example:1-14`; `Docs/en/reference/cli.md:71-157`; root scripts | `combine` |
| usuarios/contribuidores | archivos generados | `en/users/reference/generated-files.md` | `packages/framekit/src/tooling/codegen/write-template-module.ts:13-119`; `Docs/en/reference/cli.md:217-229` | `migrate` |
| usuarios | estilos y theme | `en/users/reference/styles-and-theming.md` | `packages/framekit/package.json:56-61`; `Docs/en/reference/public-api.md:529-558`; `Docs/en/guides/studio.md:99-118` | `combine` |
| usuarios | índice de migraciones | `en/users/migrations/index.md` | `Docs/en/getting-started/migration-next.md:1-24`; `migration-v0.8.0.md:1-13` | `combine` |
| usuarios con proyectos históricos | migración archivada | `en/users/migrations/v0.8.md` | `Docs/en/getting-started/migration-v0.8.0.md:1-223` | `archive` |
| usuarios/integradores | migración actual | `en/users/migrations/next.md` | `Docs/en/getting-started/migration-next.md:1-657` | `migrate` |
| usuarios | índice troubleshooting | `en/users/troubleshooting/index.md` | `Docs/en/development/troubleshooting.md:1-424` | `combine` |
| usuarios | troubleshooting instalación | `en/users/troubleshooting/installation.md` | `Docs/en/getting-started/create-project.md:3-56`; `Docs/en/development/troubleshooting.md:185-207` | `combine` |
| usuarios/autores | troubleshooting templates/assets | `en/users/troubleshooting/templates-and-assets.md` | `Docs/en/development/troubleshooting.md:7-137`; discovery/codegen tests | `migrate` |
| usuarios/contribuidores | troubleshooting registry | `en/users/troubleshooting/generated-registry.md` | `Docs/en/development/troubleshooting.md:141-159,386-395`; codegen source | `migrate` |
| usuarios | troubleshooting Studio | `en/users/troubleshooting/studio.md` | `Docs/en/development/troubleshooting.md:310-322,361-382` | `combine` |
| usuarios | troubleshooting acceso | `en/users/troubleshooting/access.md` | `packages/framekit/src/studio/page.tsx:19-39`; access tests and routes | `combine` |
| integradores | troubleshooting rendering | `en/users/troubleshooting/rendering.md` | `Docs/en/development/troubleshooting.md:262-382`; image API tests | `combine` |
| operadores | troubleshooting deployment | `en/users/troubleshooting/deployment.md` | `Docs/en/development/troubleshooting.md:235-268,334-357`; Docker/smoke scripts | `combine` |

Fuente del destino: `Docs/Plans/documentation-site/06-user-reference-migrations-and-troubleshooting.md:14-136`.

### Fase 7 — Onboarding y arquitectura de contribuidores

| audiencia | tipo | slug | fuente actual | disposición |
| --- | --- | --- | --- | --- |
| contribuidores | índice | `en/contributors/index.md` | `Docs/en/development/repository.md:1-23`; fase 1 `en/contributors/index.md` | `combine` |
| contribuidores | índice de onboarding | `en/contributors/getting-started/index.md` | `Docs/en/development/repository.md:121-162`; `AGENTS.md` | `combine` |
| contribuidores | prerrequisitos | `en/contributors/getting-started/prerequisites.md` | root `package.json:1-19`; `AGENTS.md`; fase 7:47-56 | `migrate` |
| contribuidores | desarrollo local | `en/contributors/getting-started/local-development.md` | `Docs/en/development/repository.md:121-162`; root scripts | `migrate` |
| contribuidores | índice de arquitectura | `en/contributors/architecture/index.md` | `Docs/en/development/repository.md:94-119`; fase 7:72-86 | `combine` |
| contribuidores | arquitectura del repositorio | `en/contributors/architecture/repository.md` | `Docs/en/development/repository.md:3-23,78-119` | `migrate` |
| contribuidores | arquitectura de paquetes | `en/contributors/architecture/packages.md` | `packages/framekit/package.json:1-119`; `packages/create-framekit/package.json:1-64`; `apps/studio/package.json` | `migrate` |
| contribuidores | código generado | `en/contributors/architecture/generated-code.md` | `packages/framekit/src/tooling/codegen/write-template-module.ts:90-119`; template generated outputs | `migrate` |
| contribuidores | Studio y Editor | `en/contributors/architecture/studio-and-editor.md` | `packages/framekit/src/editor/**`; `packages/framekit/src/studio/**`; `apps/studio/src/app/**` | `migrate` |
| contribuidores | server y access | `en/contributors/architecture/server-and-access.md` | `packages/framekit/src/server/**`; `apps/studio/src/app/api/framekit/[...action]/route.ts:1-12` | `migrate` |
| contribuidores | tooling y codegen | `en/contributors/architecture/tooling-and-codegen.md` | `packages/framekit/src/tooling/**`; `packages/framekit/src/dev.ts:1-13` | `migrate` |
| contribuidores | índice de desarrollo | `en/contributors/development/index.md` | `Docs/en/development/repository.md:121-162`; `AGENTS.md` | `combine` |
| contribuidores | límites de imports | `en/contributors/development/import-boundaries.md` | `Docs/en/development/repository.md:64,94-119`; `Docs/Plans/maintainability-roadmap/06-architectural-import-boundaries.md` | `migrate` |

Fuente del destino: `Docs/Plans/documentation-site/07-contributor-onboarding-and-architecture.md:14-95`.

### Fase 8 — Workflow, testing, distribución, releases y documentación

| audiencia | tipo | slug | fuente actual | disposición |
| --- | --- | --- | --- | --- |
| contribuidores | workflow | `en/contributors/development/workflow.md` | root `package.json:9-19`; `AGENTS.md`; `Docs/en/development/repository.md:121-162` | `migrate` |
| contribuidores | convenciones | `en/contributors/development/coding-conventions.md` | `AGENTS.md`; `Docs/en/development/repository.md:47-50` | `migrate` |
| contribuidores | guía de features | `en/contributors/development/adding-features.md` | `AGENTS.md`; package source/tests | `migrate` |
| contribuidores | añadir entrypoints | `en/contributors/development/adding-entrypoints.md` | `packages/framekit/package.json:20-61`; entrypoints `src/*.ts` | `migrate` |
| contribuidores | añadir comandos CLI | `en/contributors/development/adding-cli-commands.md` | `packages/framekit/src/tooling/cli/index.ts:12-56`; `packages/create-framekit/src/cli.ts:20-121`; CLI tests | `migrate` |
| contribuidores | dependencias | `en/contributors/development/dependencies.md` | root `package.json:21-27`; package manifests; `AGENTS.md` | `migrate` |
| contribuidores | índice de testing | `en/contributors/testing/index.md` | `Docs/en/development/testing-and-distribution.md:1-19,58-92`; root CI | `combine` |
| contribuidores | unit e integration | `en/contributors/testing/unit-and-integration.md` | package test scripts; Vitest tests; `Docs/en/development/testing-and-distribution.md:12-19,58-72` | `migrate` |
| contribuidores | E2E y smoke | `en/contributors/testing/e2e-and-smoke.md` | `tests/e2e/image-api.spec.ts`; `scripts/smoke-tarballs.mjs`; `scripts/smoke-docker.mjs` | `migrate` |
| contribuidores | CI | `en/contributors/testing/ci.md` | `.github/workflows/ci.yml:1-105`; `scripts/check-runtime-contract.mjs:60-73` | `migrate` |
| contribuidores | índice de distribución | `en/contributors/distribution/index.md` | `Docs/en/development/testing-and-distribution.md:129-217` | `combine` |
| contribuidores | exports de paquetes | `en/contributors/distribution/package-exports.md` | package manifests; `packages/framekit/src/*.ts`; `scripts/check-runtime-contract.mjs` | `migrate` |
| contribuidores | consumer generado | `en/contributors/distribution/generated-consumer.md` | `packages/create-framekit/template/**`; `scripts/smoke-tarballs.mjs` | `migrate` |
| contribuidores | índice de releases | `en/contributors/releases/index.md` | `Docs/en/development/release.md:1-12`; fase 8:76-84 | `combine` |
| contribuidores | versionado y changelog | `en/contributors/releases/versioning-and-changelog.md` | `CHANGELOG.md`; `Docs/en/development/release.md:14-51` | `migrate` |
| contribuidores | publicación | `en/contributors/releases/publishing.md` | `Docs/en/development/release.md:53-93`; package manifests; smoke scripts | `migrate` |
| contribuidores | índice de documentación | `en/contributors/documentation/index.md` | `Docs/Plans/documentation-site/README.md:11-15,122-132`; legacy docs | `combine` |
| contribuidores | escritura y estructura | `en/contributors/documentation/writing-and-structure.md` | `Docs/Plans/documentation-site/README.md:122-129`; `apps/docs/AGENTS.md` | `migrate` |
| contribuidores | traducciones y Mermaid | `en/contributors/documentation/translations-and-mermaid.md` | `Docs/Plans/documentation-site/01-starlight-foundation-and-navigation.md:30-37`; fase 9 | `migrate` |

Fuente del destino: `Docs/Plans/documentation-site/08-contributor-workflow-testing-and-releases.md:14-94`.

## Matriz de superficie pública que debe cubrir el sitio

### Exports por entrypoint

| Entrypoint publicado | Runtime principal | Tipos principales / límites | Evidencia |
| --- | --- | --- | --- |
| `@mauriciodmo/framekit` (`.`) | `defineTemplate`, `defineTemplateBase`, `field`, `Markdown`, `validateTemplateBase`, `validateTemplateData`, `validateTemplateDefinition`, `resolveTemplateData`, `getVariants`, `getDefaultValues` | `TemplateFieldKind`, descriptores de fields, `TemplateAssetManifest`, `TemplateMeta`, `TemplateVariants`, `TemplateBase`, `TemplateDefinition`, `TemplateRegistryEntry`, `TemplateRenderProps`, `TemplateContent`, `TemplateContentEntry`, `InferTemplateData`, `TemplateDataValidationError`; shared/core API. | `packages/framekit/src/index.ts:1-11`; `packages/framekit/src/types.ts:3-5,61-64,84-103,149-198` |
| `@mauriciodmo/framekit/client` (`./client`) | `createRenderClient` | No agrega tipos públicos propios; client-only factory para el private render page y registry generado. | `packages/framekit/src/client/index.ts:1-3`; `packages/framekit/src/client/render-client.tsx:55-135` |
| `@mauriciodmo/framekit/editor` (`./editor`) | `FrameKitEditor`, `TemplateCanvas`, `FrameKitNavigation`, `humanizeSegment`, `manifestToNavigation`, toast exports | `EditorMessages`, `BasicToastProps`, `ToastOptions`, `ToastPosition`, `TemplateNavigationFolder`, `TemplateNavigationItem`, `TemplateNavigationNode`; client/editor UI. | `packages/framekit/src/editor.ts:1-12` |
| `@mauriciodmo/framekit/next` (`./next`) | `withFrameKit` | Configuración Next.js; no tipos runtime adicionales publicados por este entrypoint. | `packages/framekit/src/next.ts:1`; `packages/framekit/package.json:36-40` |
| `@mauriciodmo/framekit/studio` (`./studio`) | `FrameKitStudio`, `frameKitMessages`, `getFrameKitLocale` | `FrameKitStudioBrand`, `FrameKitStudioSection`, `StudioUser`, `FrameKitLocale`, `FrameKitStudioMessages`; client Studio con editor, brand y settings. | `packages/framekit/src/studio.ts:1-4`; `packages/framekit/src/studio/types.ts:3-22` |
| `@mauriciodmo/framekit/studio/root` (`./studio/root`) | `FrameKitStudioRoot`, `createLoginPage`, `createStudioPage` | Server components/factories; `createStudioPage` recibe un client component `{ user: StudioUser }` y no debe importarse en client code. | `packages/framekit/src/studio-root.ts:1-2`; `packages/framekit/src/studio/page.tsx:19-39` |
| `@mauriciodmo/framekit/dev` (`./dev`) | `createDevServer`, `findTemplates`, `findBrandComponents`, `collectTemplateSummaries`, `createTemplateModule`, `createBrandModule`, `writeTemplateModule`, `watchTemplates`, `getServerOptions` | `DevServer`, `DevServerOptions`, `DiscoveredTemplate`, `DiscoveredBrandComponent`, `TemplateSummary`, `TemplateWatcher`; server/tooling-only. | `packages/framekit/src/dev.ts:1-13`; `packages/framekit/package.json:51-55` |
| `@mauriciodmo/framekit/server` (`./server`) | `createFrameKitApiHandler`, `createStudioImageHandler`, `createStudioAccessHandler`, `prepareRenderInputs`, `renderTemplateImage`, `createRenderPage`, `createRenderJob`, `loadRenderRequest`, `deleteRenderJob`, `ImageRenderError` | `ImageRenderRequest`, `ImageRenderRuntimeConfig`, `ResolvedRenderPayload`, `ImageRenderErrorCode`, `ImageRenderFailure`, `ApiTokenMetadata`, `CreatedApiToken`, `CreatedRenderJob`, `RenderJobTestOptions`; Node/server-only, no browser bundle. | `packages/framekit/src/server.ts:1-12`; `packages/framekit/package.json:56-60` |
| `@mauriciodmo/framekit/styles.css` (`./styles.css`) | CSS stylesheet, no JS runtime symbols | Public palette variables and utilities; CSS-only import. | `packages/framekit/package.json:56-61`; `Docs/en/reference/public-api.md:529-558` |

La lista anterior agrupa símbolos por responsabilidad, pero conserva todos los
entrypoints publicados por el manifest. No se deben documentar imports directos
desde `packages/framekit/src/**` ni símbolos internos que no estén en esos
entrypoints.

| Superficie | Contrato que debe documentarse | Evidencia verificable |
| --- | --- | --- |
| Paquete y exports | `@mauriciodmo/framekit` es ESM público, versión actual `0.8.1`, bin `framekit`; exports `.`, `./client`, `./editor`, `./next`, `./studio`, `./studio/root`, `./dev`, `./server` y `./styles.css`. No son imports de consumidor los paths `packages/framekit/src/**`. | `packages/framekit/package.json:1-3,17-61,82-103`; `packages/framekit/src/types.ts:3-5,149-196`; `Docs/en/reference/public-api.md:3-68,562-590` |
| Segundo paquete y CLI creator | `@mauriciodmo/create-framekit` es público, versión actual `0.8.3`, bin `create-framekit`; crea en un directorio nuevo, acepta `[project-directory] [-y|-n]` y ofrece `update-skills [project-directory]`. Con `-y` o `-n` sin nombre usa `./framekit`; `update-skills` acepta el directorio opcional y usa `.` por defecto. Detecta pnpm/npm desde `npm_config_user_agent` y, si no puede detectarlo, pregunta con default pnpm; pregunta instalación con default sí. La creación ejecuta `<package-manager> install`, y con pnpm y la instalación activa pregunta/ejecuta `pnpm approve-builds` con default sí; también pregunta inicialización de Git con default sí y, si se acepta, ejecuta `git init`, `git add -A` y el commit inicial. | `packages/create-framekit/package.json:1-3,25-31,46-53`; `packages/create-framekit/src/cli.ts:20-113`; `packages/create-framekit/src/prompts.ts:15-40`; `packages/create-framekit/src/package-manager.ts:4-9,41-60`; `packages/create-framekit/src/project.ts:33-84`; `packages/create-framekit/src/__tests__/cli.test.ts:25-90` |
| CLI `framekit` | Comandos: `generate`, `check`, `dev`, `build`, `start` y `browser install [--with-deps]`; usan `process.cwd()` y rechazan argumentos extra. `check` genera antes de validar; `build` ejecuta `check`; `start` es read-only respecto al registry. | `packages/framekit/src/tooling/cli/index.ts:12-49`; `packages/framekit/src/tooling/cli/generate.ts:4-7`; `packages/framekit/src/tooling/cli/check.ts:62-80`; `packages/framekit/src/tooling/cli/production.ts:93-106`; `packages/framekit/src/tooling/cli/__tests__/cli.test.ts:93-177` |
| Template canónico | Una definición usa `meta`, `width`, `height`, `fields`, `content`, `variants` y `render({ data, assets, variant, width, height })`; `defineTemplate` valida la forma completa y `defineTemplateBase` la base sin render. | `packages/framekit/src/core/define-template.ts:19-46`; `packages/framekit/src/types.ts:84-98,149-196`; `packages/create-framekit/template/src/templates/example/template.tsx:1-71`; `Docs/en/reference/template-contract.md:5-64` |
| Fields | Hay exactamente seis kinds: `text`, `number`, `color`, `image`, `choice`, `boolean`. La API de construcción es el namespace singular `field.*`; `fields` sigue siendo el nombre de la propiedad de la definición. `image` acepta scope `common` o `variant`. | `packages/framekit/src/types.ts:3-5,35-64`; `packages/framekit/src/core/fields/index.ts:1-16`; `packages/framekit/src/core/__tests__/fields.test.ts:4-15`; `packages/create-framekit/template/src/templates/example/template.tsx:15-30` |
| Registry y codegen | `framekit generate` escribe `src/generated/framekit/templates.ts` con el único export runtime `templates: TemplateRegistryEntry[]`; también genera `brands.ts`, `studio-client.tsx` y `render-client.tsx`. `writeTemplateModule` sincroniza los assets descubiertos a `public/framekit/templates/<slug>/...`, elimina el árbol anterior y vuelve a copiar los assets actuales. `dev` hace una generación inicial y vuelve a generarlos cuando cambian paths bajo `src/templates` o `src/brand`; `check` y `build` también generan, mientras `start` no. Todos esos archivos y `public/framekit/**` son outputs generados, descartables y no editables a mano. | `packages/framekit/src/tooling/codegen/write-template-module.ts:13-17,62-119`; `packages/framekit/src/tooling/dev/watch-templates.ts:14-40`; `packages/framekit/src/tooling/dev/create-dev-server/template-generation.ts:15-55`; `packages/framekit/src/tooling/cli/generate.ts:1-7`; `packages/framekit/src/tooling/codegen/__tests__/write-template-module.test.ts:270-355,513-550` |
| Studio y access | Studio tiene `/editor`, `/brand` y `/settings`; `/login` protege las secciones. Settings ofrece cuenta, contraseña, tokens y administración de usuarios; el servidor entrega un DTO `StudioUser` seguro. | `packages/framekit/src/studio/framekit-studio.tsx:21-56`; `packages/framekit/src/studio/settings/studio-settings.tsx:14-52`; `packages/framekit/src/server/access/http/index.ts:10-23,54-73`; `packages/framekit/src/studio/page.tsx:19-39`; `Docs/en/guides/studio.md:5-23` |
| API HTTP de imágenes | La ruta Node-only es `POST /api/framekit/images/render`. Acepta sesión same-origin o `Authorization: Bearer <API_TOKEN>` respaldado por SQLite, devuelve PNG en éxito y errores JSON estables. | `packages/framekit/src/server/api-handler.ts:7-24`; `packages/framekit/src/server/image-handler/index.ts:16-33,35-80`; `packages/create-framekit/template/src/app/api/framekit/[...action]/route.ts:1-12`; `tests/e2e/image-api.spec.ts:3-18,28-63`; `Docs/en/reference/public-api.md:333-388,445-515` |
| Configuración | Runtime de producción/aplicación: `FRAMEKIT_ADMIN_USERNAME`, `FRAMEKIT_ADMIN_PASSWORD`, `FRAMEKIT_DATABASE_PATH`, `PORT`, `FRAMEKIT_ALLOWED_IMAGE_HOSTS`, `FRAMEKIT_MAX_CONCURRENT_RENDERS` y `FRAMEKIT_RENDER_TIMEOUT_MS`. Variables adicionales del dev server: `FRAMEKIT_HOST` toma precedencia sobre `HOST`; si ninguna existe, usa `localhost`. `PORT` también se valida para el dev server y por defecto es `3000`. | `packages/create-framekit/template/.env.example:1-14`; `packages/framekit/src/server/config.ts:76-84`; `packages/framekit/src/tooling/dev/server-options.ts:1-10`; `Docs/en/reference/cli.md:71-111`; `Docs/en/reference/public-api.md:390-423`; `Docs/Plans/documentation-site/05-image-api-security-and-deployment.md:107-128` |
| Deployment | El template usa Node 22, pnpm 11.14.0, Next standalone, Chromium instalado explícitamente, `/data/framekit.sqlite` y usuario no-root. El Dockerfile fija las variables operativas del contenedor `NODE_ENV=production`, `HOSTNAME=0.0.0.0` y `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` (además de `PORT=3000`); no son configuración pública propia de FrameKit. SQLite solo persiste si `/data` se monta; los jobs de render son memoria de proceso. El modelo soportado inicial es un proceso Node largo por contenedor, no serverless/multi-replica. | `packages/create-framekit/template/Dockerfile:33-39`; `packages/create-framekit/template/package.json:5-22`; `Docs/Plans/documentation-site/05-image-api-security-and-deployment.md:126-128`; `Docs/en/reference/cli.md:126-180`; `Docs/en/reference/public-api.md:509-515` |
| Testing, CI y gates | Vitest cubre workspaces; typecheck incluye fixtures positivos y negativos; E2E usa Chromium para Studio y la API autenticada. Desde la raíz, `check:runtime` verifica manifests, docs críticas y la matriz CI; `lint`, `test`, `typecheck` y `build` son scripts recursivos; `test:e2e` ejecuta Playwright; `smoke:docker` y `sync:skills` son gates/herramientas separadas. CI verifica Node `22.13.0` y `24` en Ubuntu con pnpm `11.14.0`, un smoke de consumer en Windows/Node `22.13.0` y E2E Chromium en Ubuntu/Node `22.13.0`; también ejecuta pack dry-run. No se debe prometer cobertura visual, matriz completa de browsers, clipboard como gate, ni un smoke Docker como prueba unitaria. | `package.json:9-19`; `.github/workflows/ci.yml:1-105`; `scripts/check-runtime-contract.mjs:6-25,60-73`; `packages/framekit/package.json:82-91`; `packages/create-framekit/package.json:46-53`; `Docs/en/development/testing-and-distribution.md:1-19,58-92,192-217` |
| Distribution y releases | Solo `@mauriciodmo/framekit` y `@mauriciodmo/create-framekit` son paquetes públicos. El primero publica `bin`, `dist`, README y LICENSE; el segundo publica `dist`, `template`, README y LICENSE. Los tarballs y el smoke de registry son gates separados. | `packages/framekit/package.json:11-18,63-65`; `packages/create-framekit/package.json:11-29`; `Docs/en/development/testing-and-distribution.md:129-190,323-432`; `Docs/en/development/release.md:14-85` |

### Detalle verificable de acceso

- `/login` muestra el formulario cuando no hay sesión activa; una sesión válida
  en `/login` redirige a `/editor`. Las rutas `/editor`, `/brand` y `/settings`
  aceptan solo una sección conocida y redirigen a `/login` si el cookie
  `framekit_session` no resuelve un usuario activo.
- El login crea una sesión SQLite de 30 días. El cookie es `HttpOnly`,
  `SameSite=Lax`, `Path=/` y añade `Secure` en producción. Logout y cambio de
  contraseña expiran la sesión; el servidor entrega al cliente solo
  `StudioUser { id, username, role }`.
- Los roles son `admin` y `user`. Ambos pueden operar su cuenta y sus propios
  tokens; el administrador puede listar/crear/editar/eliminar usuarios, resetear
  contraseñas, consultar metadata de tokens de otros usuarios y revocarlos. Un
  usuario normal no puede gestionar usuarios y solo puede consultar o revocar
  sus propios tokens.
- Las rutas de access son `POST /api/framekit/login`, `POST /api/framekit/logout`,
  `GET/PATCH /api/framekit/account`, `POST /api/framekit/account/password`,
  `GET/POST /api/framekit/tokens`, `DELETE /api/framekit/tokens/:id`,
  `GET/POST /api/framekit/users`, `PATCH/DELETE /api/framekit/users/:id`,
  `POST /api/framekit/users/:id/password` y
  `GET /api/framekit/users/:id/tokens`.
- Las mutaciones cookie-authenticated requieren same-origin. La autorización se
  ejecuta en handlers server-side (`requireSession` y `requireAdministrator`),
  y la UI oculta el área Users a usuarios normales solo como presentación; ocultar
  UI no equivale a autorización. La ruta de users responde `403` para un rol
  insuficiente aunque se invoque directamente.

Evidencia: `packages/framekit/src/studio/page.tsx:9-39`,
`packages/framekit/src/server/access/http/session.ts:6-41`,
`packages/framekit/src/server/access/http/index.ts:10-75`,
`packages/framekit/src/server/access/http/routes.ts:9-13,27-124`,
`packages/framekit/src/studio/types.ts:3-22`,
`packages/framekit/src/studio/settings/studio-settings.tsx:46-52`.

## Orden de autoridad y referencias de verificación

Cuando una página legacy contradiga una fuente superior, se corrige la página; no
se adapta el código para conservar una afirmación histórica. Se usa exactamente
el orden aprobado por el plan general:

1. `packages/framekit/package.json`, `packages/create-framekit/package.json` y
   sus exports/bin publicados.
2. Implementación y tests bajo `packages/framekit/src/` y
   `packages/create-framekit/src/`.
3. Template canónico en `packages/create-framekit/template/`.
4. Integración first-party en `apps/studio/`.
5. `CHANGELOG.md` para cambios todavía no publicados.
6. Documentación existente bajo `Docs/en/`, `Docs/es/` y los README como material
   de migración, nunca como autoridad superior al código.

Referencias principales revisadas:

| Área | Referencias |
| --- | --- |
| Publicación | `packages/framekit/package.json:1-119`; `packages/create-framekit/package.json:1-64` |
| Contrato y fields | `packages/framekit/src/types.ts:3-5,35-64,84-98,149-196`; `packages/framekit/src/core/define-template.ts:19-46`; `packages/framekit/src/core/fields/index.ts:1-16` |
| CLI y creator | `packages/framekit/src/tooling/cli/index.ts:12-56`; `packages/framekit/src/tooling/cli/check.ts:62-80`; `packages/framekit/src/tooling/cli/production.ts:93-106`; `packages/create-framekit/src/cli.ts:20-121`; `packages/create-framekit/src/project.ts:33-84` |
| Template canónico y deployment | `packages/create-framekit/template/package.json:1-33`; `packages/create-framekit/template/src/templates/example/template.tsx:1-71`; `packages/create-framekit/template/.env.example:1-14`; `packages/create-framekit/template/Dockerfile:1-54`; `packages/create-framekit/template/src/app/api/framekit/[...action]/route.ts:1-12` |
| Codegen | `packages/framekit/src/tooling/codegen/__tests__/write-template-module.test.ts:270-355,436-465` |
| Studio, acceso y export | `packages/framekit/src/studio/framekit-studio.tsx:21-56`; `packages/framekit/src/studio/settings/studio-settings.tsx:14-52`; `packages/framekit/src/server/access/http/index.ts:10-73`; `packages/framekit/src/server/access/http/routes.ts:27-124`; `packages/framekit/src/editor/export/export-template.ts:68-109` |
| API y E2E | `packages/framekit/src/server/api-handler.ts:7-24`; `packages/framekit/src/server/image-handler/index.ts:16-80`; `packages/framekit/src/server/access/api-tokens.ts:89-165`; `tests/e2e/image-api.spec.ts:3-63` |
| Cobertura y distribución | `packages/framekit/src/core/__tests__/fields.test.ts:4-154`; `packages/framekit/src/tooling/cli/__tests__/cli.test.ts:93-193`; `packages/create-framekit/src/__tests__/cli.test.ts:25-90`; `Docs/en/development/testing-and-distribution.md:1-19,58-92,129-217,323-432` |
| Contexto legacy | `Docs/en/README.md:5-30`; `Docs/es/README.md:5-30`; `Docs/en/getting-started/migration-next.md:269-428,542-642`; `Docs/en/reference/cli.md:184-343`; `Docs/en/reference/public-api.md:333-515` |

## Resultado de fase 0

- Inventariados los 34 archivos públicos actuales: 17 en inglés y 17 en español.
- Registrados los seis README públicos que todavía enlazan la documentación
  legacy, con la acción de actualización reservada para fase 10.
- Congelada la matriz de exports, CLIs, contrato de template, fields, codegen,
  Studio/access, API HTTP, configuración, deployment, testing y distribución.
- Fijado que las páginas futuras deben usar únicamente fuentes y contratos
  vigentes.
- Confirmado que `Docs/Plans/` y `Docs/skills/` quedan fuera del sitio publicado.
