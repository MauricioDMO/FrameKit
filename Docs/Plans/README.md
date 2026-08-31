# FrameKit Plan Maestro de Ejecución

- **Estado:** Activo.
- **Última revisión:** 2026-08-31.
- **Alcance:** Coordinar los planes de `Docs/Plans/`, sus issues de GitHub,
  dependencias y gates de finalización.
- **Release:** Este plan no selecciona versiones ni dist-tags.

Este archivo es el tracker operativo general. Los documentos enlazados dentro
de cada directorio siguen siendo la fuente de verdad para contratos técnicos,
casos de prueba, comandos y exit gates detallados.

## Reglas de seguimiento

- GitHub es la fuente oficial para saber si una issue está abierta o cerrada.
- Una implementación local no equivale a una issue cerrada.
- Marca una casilla solamente cuando el trabajo esté terminado y verificado.
- Una fase sin issue se completa cuando pasa el exit gate de su plan hijo.
- No copies resultados extensos de comandos aquí. Regístralos en la issue,
  commit o documento operativo correspondiente y enlaza la evidencia.
- Actualiza este archivo en el mismo cambio que complete una issue, fase o paso.
- Actualiza `Última revisión` cuando cambie el orden, alcance o estado general.
- No edites outputs generados o de build para completar una casilla.

## Índice de planes

- [Future](./Future/README.md): contrato canónico, documentación y gates de
  release. Su estado local detallado vive en
  [Future/EXECUTION-STATUS.md](./Future/EXECUTION-STATUS.md).
- [Maintainability Roadmap](./maintainability-roadmap/README.md): seis fases de
  mantenimiento que preservan comportamiento.
- [Server Image Rendering API](./server-image-rendering-api/README.md): ocho
  pasos para renderizado PNG autenticado en un proceso Node de larga duración.

## Orden global aprobado

| Orden | Bloque | Gate para avanzar |
| ---: | --- | --- |
| 0 | Sincronizar GitHub y resolver el bug `#17` | Issues y planes describen el contrato real |
| 1 | Terminar `Future/` con `#12` a `#15` | `#12`, `#13`, `#14`, `#15` y `#17` cerradas |
| 2 | Maintainability fases 1 a 4 | Formato, validación, editor y Studio estabilizados |
| 3 | Server Image Rendering pasos 1 a 8 | API, Docker, seguridad y distribución verificadas |
| 4 | Maintainability fases 5 y 6 | Tokens y límites arquitectónicos adaptados a `./server` |
| 5 | Backlog `#18` y `#19` | No bloquea los planes anteriores |

El roadmap de mantenibilidad conserva su orden interno `1 -> 6`, pero el trabajo
de servidor se intercala después de la fase 4. Así se resuelve primero el
conflicto directo entre `FrameKitEditor` y `TemplateCanvas`, mientras la fase 6
se implementa una sola vez contra la arquitectura final que incluye `./server`.

## Estado de issues en GitHub

Snapshot consultado con `gh` el 2026-08-31.

| Issue | GitHub | Local | Acción |
| --- | --- | --- | --- |
| [#12](https://github.com/MauricioDMO/FrameKit/issues/12) | Open | Verificada | Sincronizar y cerrar |
| [#13](https://github.com/MauricioDMO/FrameKit/issues/13) | Open | Verificada | Resolver `#17` y cerrar |
| [#14](https://github.com/MauricioDMO/FrameKit/issues/14) | Open | Pendiente | Auditar docs EN/ES |
| [#15](https://github.com/MauricioDMO/FrameKit/issues/15) | Open | Pendiente | Añadir CI y smokes |
| [#17](https://github.com/MauricioDMO/FrameKit/issues/17) | Open | Pendiente | Resolver antes de `#13` |
| [#18](https://github.com/MauricioDMO/FrameKit/issues/18) | Open | Backlog | Diferir |
| [#19](https://github.com/MauricioDMO/FrameKit/issues/19) | Open | Backlog | Diferir |

Ninguna issue abierta tiene parent, subissues, milestone o assignee. No hay una
issue asignada al plan de server rendering y el roadmap de mantenibilidad no
requiere issues por diseño.

## 0. Gobierno y sincronización

- [x] Inventariar todos los planes bajo `Docs/Plans/`.
- [x] Consultar con `gh` el estado y contenido de las issues abiertas.
- [x] Aprobar el orden global de este documento.
- [x] Crear este tracker maestro en `Docs/Plans/README.md`.
- [x] Registrar el snapshot inicial con fecha.
- [ ] Corregir en `#12` a `#15` los enlaces que contienen
  `Docs/Plans/Future/Execution/`.
- [ ] Cambiar los títulos de `#13`, `#14` y `#15` para eliminar la promesa de
  versión `0.6`.
- [ ] Actualizar `#12` para reflejar que `#9` fue cerrado como no planificado.
- [ ] Eliminar de `#13` el resolver discriminado y el global last-valid preview
  rechazados al cerrar `#9`.
- [ ] Eliminar de `#14` la migración hacia el resolver discriminado.
- [ ] Actualizar en `#14` el baseline de `CHANGELOG.md` y `migration-next.md`.
- [ ] Crear una issue paraguas para server image rendering.
- [ ] Enlazar en esa issue los ocho pasos del plan de servidor.
- [ ] Mantener el roadmap de mantenibilidad sin issues obligatorias.
- [ ] Registrar `#18` y `#19` como backlog no bloqueante.

## 1. Cierre de Future

### 1.1 Issue #12: Generated Template Registry

Plan: [issue-12-generated-template-registry.md](./Future/issue-12-generated-template-registry.md).

- [x] Implementar el registry canónico.
- [x] Incluir metadata, dimensiones, variantes, assets y loaders lazy.
- [x] Verificar regeneración automática en desarrollo y build.
- [x] Completar tests, documentación, changelog, migraciones y starter.
- [x] Registrar los checks locales en `Future/EXECUTION-STATUS.md`.
- [ ] Revisar que el cuerpo de `#12` coincida con el contrato final.
- [ ] Marcar los acceptance criteria reales en GitHub.
- [ ] Publicar un comentario con commits y verificaciones.
- [ ] Confirmar que no existen regresiones posteriores relevantes.
- [ ] Cerrar `#12` en GitHub.
- [ ] Marcar `#12` como completada en este tracker.

### 1.2 Issue #17: Persisted Choice Values

Issue: [#17](https://github.com/MauricioDMO/FrameKit/issues/17).

- [ ] Confirmar la reproducción con una opción eliminada o renombrada.
- [ ] Añadir una comprobación local de pertenencia a `field.options` durante la
  hidratación.
- [ ] Descartar solamente el override inválido.
- [ ] Preservar los demás campos válidos de la misma variante.
- [ ] Confirmar fallback hacia contenido de variante o default.
- [ ] Mantener sin cambios number, boolean, text, color e image.
- [ ] Añadir un test para una opción persistida válida.
- [ ] Añadir un test para una opción obsoleta con campos hermanos válidos.
- [ ] Verificar que el renderer recibe el valor resuelto actual.
- [ ] Actualizar el test que actualmente conserva la opción desconocida.
- [ ] Añadir una entrada en `CHANGELOG.md` bajo `Unreleased`.
- [ ] Registrar que no requiere migración ni cambio de storage version.
- [ ] Ejecutar checks enfocados del estado y editor.
- [ ] Ejecutar checks completos del paquete y repositorio.
- [ ] Publicar evidencia y cerrar `#17`.

### 1.3 Issue #13: Studio Canonical Contract

Plan: [issue-13-studio-canonical-contract.md](./Future/issue-13-studio-canonical-contract.md).

- [x] Consumir el registry canónico directamente en Studio.
- [x] Integrar metadata, variantes y datos tipados.
- [x] Integrar persistencia `v2`, controles nativos y validación.
- [x] Completar tests, documentación, skills, changelog y migraciones.
- [x] Registrar los checks locales en `Future/EXECUTION-STATUS.md`.
- [ ] Resolver `#17` antes del cierre.
- [ ] Actualizar el cuerpo para coincidir con la decisión de cierre de `#9`.
- [ ] Eliminar referencias al global last-valid preview no implementado.
- [ ] Corregir el enlace al plan.
- [ ] Marcar los acceptance criteria reales en GitHub.
- [ ] Publicar un comentario con commits y verificaciones.
- [ ] Cerrar `#13` en GitHub.
- [ ] Marcar `#13` como completada en este tracker.

### 1.4 Issue #14: Documentation and Migration

Plan: [issue-14-documentation-and-migration.md](./Future/issue-14-documentation-and-migration.md).

- [ ] Inventariar exports, registry, CLI, starter y comportamiento final de
  Studio.
- [ ] Comparar el inventario con los cuatro README públicos.
- [ ] Auditar todos los pares afectados bajo `Docs/en` y `Docs/es`.
- [ ] Confirmar equivalencia temática entre inglés y español.
- [ ] Eliminar enseñanza actual de APIs obsoletas.
- [ ] Mantener referencias obsoletas solamente en contexto histórico.
- [ ] Consolidar `Docs/en/getting-started/migration-next.md`.
- [ ] Consolidar `Docs/es/getting-started/migration-next.md`.
- [ ] Auditar `CHANGELOG.md` bajo `Unreleased`.
- [ ] Confirmar metadata, variants, `field` singular y tipos
  number/boolean/choice.
- [ ] Confirmar registry automático, persistencia `v2` y controles de Studio.
- [ ] Mantener server image rendering documentado como trabajo futuro.
- [ ] Actualizar únicamente las skills canónicas de `Docs/skills`.
- [ ] Ejecutar `pnpm sync:skills`.
- [ ] Verificar Quick Start con el starter generado.
- [ ] Verificar links y anchors internos.
- [ ] Verificar generación, check, typecheck y build del starter.
- [ ] Ejecutar runtime check, lint, tests, typecheck y build del repositorio.
- [ ] Publicar evidencia en `#14`.
- [ ] Cerrar `#14`.
- [ ] Marcar `#14` como completada en este tracker.

### 1.5 Issue #15: Testing and Release Gates

Plan: [issue-15-testing-and-release-gates.md](./Future/issue-15-testing-and-release-gates.md).

- [ ] Auditar la matriz existente sin duplicar tests enfocados.
- [ ] Identificar únicamente gaps cross-layer.
- [ ] Mantener Linux CI en Node `22.13.0` y `24`.
- [ ] Fortalecer Windows para construir ambos paquetes públicos.
- [ ] Crear un consumer de Windows de forma no interactiva.
- [ ] Ejecutar generate y check en el consumer de Windows.
- [ ] Añadir un único E2E crítico con Chromium.
- [ ] Cubrir metadata, variante y campos text/number/choice/boolean/color.
- [ ] Cubrir draft numérico inválido y preview confirmado.
- [ ] Exportar PNG y comprobar dimensiones sin dependencia adicional.
- [ ] Implementar o documentar un único smoke reproducible de tarballs.
- [ ] Instalar ambos tarballs fuera del workspace.
- [ ] Ejecutar create, generate, check, build, start y HTTP readiness.
- [ ] Rechazar workspace references y rutas locales en los paquetes.
- [ ] Documentar el smoke post-publicación con versiones exactas.
- [ ] Separar pre-publicación, post-publicación y promoción de dist-tag.
- [ ] Actualizar documentación EN/ES de testing y distribución.
- [ ] Actualizar skills canónicas de release.
- [ ] Añadir changelog y nota explícita de no migración.
- [ ] Ejecutar todas las lanes y smokes requeridos.
- [ ] Publicar evidencia en `#15`.
- [ ] Cerrar `#15`.
- [ ] Marcar `Future/` como completado.

## 2. Maintainability: fases 1 a 4

### 2.1 Fase 1: Repository Formatting and Checks

Plan: [01-repository-formatting-and-checks.md](./maintainability-roadmap/01-repository-formatting-and-checks.md).

- [ ] Validar el baseline contra el checkout actual.
- [ ] Añadir EditorConfig, Git attributes y configuración mínima de Prettier.
- [ ] Definir ignores para outputs generados y sincronizados.
- [ ] Añadir solamente `prettier` y `lint-staged`.
- [ ] Añadir `format` y `format:check`.
- [ ] Preservar ESLint como lint completo.
- [ ] Preservar `pnpm sync:skills` y staging explícito en Husky.
- [ ] Añadir el format check temprano en CI.
- [ ] Actualizar instrucciones y documentación EN/ES.
- [ ] Separar tooling/configuración del formato mecánico.
- [ ] Ejecutar una sola aplicación global de Prettier.
- [ ] Confirmar que no hay cambios lógicos ni generated output.
- [ ] Ejecutar el hard exit gate completo.
- [ ] Marcar la fase 1 como completada.

### 2.2 Fase 2: Definition Validation Split

Plan: [02-definition-validation-split.md](./maintainability-roadmap/02-definition-validation-split.md).

- [ ] Confirmar los casos y el orden de errores del validator actual.
- [ ] Extraer utilidades comunes una sola vez.
- [ ] Separar metadata, dimensiones, fields, variants y composición.
- [ ] Mantener `definition.ts` como facade pública de secuenciación.
- [ ] Preservar mensajes, primer error, narrowing y orden de inserción.
- [ ] Mantener sin cambios exports públicos y tipos.
- [ ] Redistribuir tests sin duplicar la matriz.
- [ ] Verificar `defineTemplate`, Studio, CLI y codegen.
- [ ] Ejecutar checks enfocados y completos.
- [ ] Marcar la fase 2 como completada.

### 2.3 Fase 3: Editor Orchestration

Plan: [03-editor-orchestration.md](./maintainability-roadmap/03-editor-orchestration.md).

- [ ] Confirmar el contrato público actual de `FrameKitEditor`.
- [ ] Extraer solamente `EditorHeader`.
- [ ] Extraer solamente `TemplateMetadataDialog`.
- [ ] Mantener upload, resolver, validación y export en el orchestrator.
- [ ] Mantener temporalmente el render wrapper en `FrameKitEditor`.
- [ ] Preservar controles, preview, state, persistence y navigation existentes.
- [ ] Preservar Escape, backdrop, foco inicial y restauración de foco.
- [ ] Añadir tests directos del header y dialog.
- [ ] Mantener el test de integración de `FrameKitEditor`.
- [ ] Confirmar que `./editor` no gana exports nuevos en esta fase.
- [ ] Ejecutar checks enfocados y completos.
- [ ] Marcar la fase 3 como completada.

### 2.4 Fase 4: Studio Shell Split

Plan: [04-studio-shell-split.md](./maintainability-roadmap/04-studio-shell-split.md).

- [ ] Confirmar el contrato público actual de `FrameKitStudio`.
- [ ] Extraer `useStudioResource`.
- [ ] Preservar cancelación de promises obsoletas.
- [ ] Extraer estados loading, empty, not-found y error.
- [ ] Extraer settings y preservar ownership de theme/locale.
- [ ] Extraer el shell/sidebar sin cambiar rutas.
- [ ] Mantener route detection y composición en la facade.
- [ ] Preservar validación y comprobación de dimensiones.
- [ ] Preservar exports `./studio` y `./studio/root`.
- [ ] Cubrir races, errores, settings, accessibility y contenido ready.
- [ ] Verificar Studio y consumer generado aislado.
- [ ] Ejecutar checks completos.
- [ ] Marcar la fase 4 como completada.

### 2.5 Gate antes del servidor

- [ ] Confirmar que las fases 1 a 4 aprobaron sus exit gates.
- [ ] Confirmar que no cambió ningún contrato público existente.
- [ ] Revalidar los paths del plan de server rendering.
- [ ] Separar cualquier drift del baseline de cambios de alcance.

## 3. Server Image Rendering API

### 3.1 Preflight

- [ ] Crear una issue paraguas para la implementación.
- [ ] Enlazar los ocho documentos de `server-image-rendering-api/`.
- [ ] Revalidar todos los paths después de Maintainability 1 a 4.
- [ ] Congelar el contrato del registry entregado por `#12`.
- [ ] Congelar resolver, validación, variantes y assets entregados por `#13`.
- [ ] Resolver la discrepancia de `AbortSignal` entre los pasos 4 y 6.
- [ ] Definir la ubicación arquitectónica de `shared/raster-image.ts`.
- [ ] Confirmar Node de larga duración como único target inicial.
- [ ] Confirmar PNG síncrono como único output inicial.
- [ ] Confirmar límites, configuración y política de hosts.
- [ ] Registrar qué infraestructura de `#15` será reutilizada.

### 3.2 Paso 1: Contracts and Server Boundary

Plan: [01-contracts-and-server-boundary.md](./server-image-rendering-api/01-contracts-and-server-boundary.md).

- [ ] Añadir la entrada server-only.
- [ ] Definir tipos públicos de request, config y error.
- [ ] Definir un payload interno serializable.
- [ ] Implementar un parser puro de configuración.
- [ ] Implementar autenticación Bearer de tiempo constante.
- [ ] Rechazar configuración insegura en producción.
- [ ] Mantener secretos fuera de errores y logs.
- [ ] Verificar que client/editor/studio no incluyan dependencias server.
- [ ] Añadir tests y type fixture.
- [ ] Pasar el exit gate del paso 1.

### 3.3 Paso 2: Shared Canvas and Image Inputs

Plan: [02-shared-canvas-and-image-inputs.md](./server-image-rendering-api/02-shared-canvas-and-image-inputs.md).

- [ ] Extraer `TemplateCanvas`.
- [ ] Exportarlo mediante `./editor`.
- [ ] Migrar Studio al canvas compartido sin cambiar export/copy.
- [ ] Centralizar validación de firmas raster.
- [ ] Mantener upload de desarrollo sin regresiones.
- [ ] Validar data URLs PNG/JPEG/WebP/GIF.
- [ ] Validar URLs HTTPS con hostname exacto.
- [ ] Validar únicamente namespaces root-relative permitidos.
- [ ] Rechazar SVG, traversal, credenciales, puertos y redirects inseguros.
- [ ] Clonar manifests sin escribir archivos del proyecto.
- [ ] Preservar precedencia defaults, variant, edits y assets.
- [ ] Pasar el exit gate del paso 2.

### 3.4 Paso 3: Temporary Render Jobs

Plan: [03-temporary-render-jobs.md](./server-image-rendering-api/03-temporary-render-jobs.md).

- [ ] Definir el formato versionado `RenderJobV1`.
- [ ] Generar ID y token criptográficos independientes.
- [ ] Escribir archivos de forma exclusiva y atómica.
- [ ] Usar directorio y permisos owner-only.
- [ ] Aplicar TTL de dos minutos.
- [ ] Hacer indistinguibles missing, expired y unauthorized.
- [ ] Impedir traversal y symlink escape.
- [ ] Hacer delete y cleanup idempotentes.
- [ ] Cubrir colisiones, expiración, concurrencia y malformed jobs.
- [ ] Pasar el exit gate del paso 3.

### 3.5 Paso 4: Browser Lifecycle and Capture

Plan: [04-browser-lifecycle-and-capture.md](./server-image-rendering-api/04-browser-lifecycle-and-capture.md).

- [ ] Implementar un singleton global de Chromium.
- [ ] Crear un contexto y página aislados por request.
- [ ] Reservar capacidad atómicamente sin queue ilimitada.
- [ ] Limitar navegación al origen loopback configurado.
- [ ] Bloquear redirects, popups, downloads y hosts no permitidos.
- [ ] Esperar marker, fonts e imágenes.
- [ ] Capturar solamente el render root.
- [ ] Verificar firma y dimensiones PNG.
- [ ] Propagar timeout y abort.
- [ ] Cerrar contexto, liberar capacidad y eliminar job en `finally`.
- [ ] Implementar idle close y shutdown idempotente.
- [ ] Pasar el exit gate del paso 4.

### 3.6 Paso 5: Private Next.js Render Route

Plan: [05-private-next-render-route.md](./server-image-rendering-api/05-private-next-render-route.md).

- [ ] Añadir la ruta privada en el template canónico.
- [ ] Añadir la ruta privada en Studio.
- [ ] Autenticar con ID y token interno.
- [ ] Mantener el token fuera de URL, props y DOM.
- [ ] Cargar el registry generado y la definición exacta.
- [ ] Revalidar dimensiones y variante.
- [ ] Renderizar un único `TemplateCanvas`.
- [ ] Exponer markers loading, ready y error sin datos privados.
- [ ] Desactivar cache y static generation.
- [ ] Añadir instrumentation Node-only para shutdown.
- [ ] Pasar el exit gate del paso 5.

### 3.7 Paso 6: Public Image API Route

Plan: [06-public-image-api-route.md](./server-image-rendering-api/06-public-image-api-route.md).

- [ ] Añadir `POST /api/v1/images` en el template.
- [ ] Añadir el mismo adapter delgado en Studio.
- [ ] Cargar configuración antes del body.
- [ ] Autenticar antes de revelar template o errores específicos.
- [ ] Leer el body con límite incremental de 12 MB.
- [ ] Validar content type, UTF-8 y forma JSON exacta.
- [ ] Rechazar propiedades y field keys desconocidos.
- [ ] Cargar template y variante mediante el registry.
- [ ] Normalizar ordinary fields e imágenes antes del browser.
- [ ] Propagar cancelación al renderer.
- [ ] Retornar PNG con headers seguros y `no-store`.
- [ ] Mapear errores mediante códigos, no parsing de mensajes.
- [ ] Evitar logs sensibles.
- [ ] Pasar el exit gate del paso 6.

### 3.8 Paso 7: Packaging and Docker

Plan: [07-packaging-and-docker.md](./server-image-rendering-api/07-packaging-and-docker.md).

- [ ] Finalizar el export público `./server`.
- [ ] Añadir la entrada correspondiente en el build.
- [ ] Alinear una sola versión compatible de `playwright-core`.
- [ ] Evitar descarga de browsers durante instalación normal.
- [ ] Añadir integración al template generado.
- [ ] Añadir `Dockerfile` y `.dockerignore`.
- [ ] Instalar solamente Chromium headless shell.
- [ ] Ejecutar con usuario no-root y `tini`.
- [ ] Mantener secretos fuera de layers.
- [ ] Verificar copy de archivos ocultos del creator.
- [ ] Inspeccionar ambos tarballs.
- [ ] Construir y ejecutar la imagen limpia.
- [ ] Pasar el exit gate del paso 7.

### 3.9 Paso 8: Verification and Rollout

Plan: [08-verification-and-rollout.md](./server-image-rendering-api/08-verification-and-rollout.md).

- [ ] Ejecutar todos los tests enfocados de los pasos 1 a 7.
- [ ] Ejecutar los checks completos del repositorio.
- [ ] Ejecutar smoke real con Docker y Chromium.
- [ ] Verificar render con defaults y assets existentes.
- [ ] Verificar imágenes base64 válidas.
- [ ] Verificar un host HTTPS permitido.
- [ ] Verificar unauthorized, malformed y blocked host.
- [ ] Verificar capacity exhausted y timeout.
- [ ] Verificar dimensiones y firma PNG.
- [ ] Verificar ausencia de jobs y contexts filtrados.
- [ ] Verificar SIGTERM y shutdown limpio.
- [ ] Ejecutar smoke con tarballs fuera del workspace.
- [ ] Reutilizar el harness creado por `#15`.
- [ ] Actualizar documentación EN/ES.
- [ ] Actualizar README, changelog y `migration-next.md`.
- [ ] Registrar una nota aditiva de no migración.
- [ ] Publicar evidencia en la issue paraguas.
- [ ] Cerrar la issue de server rendering.
- [ ] Marcar el plan de servidor como completado.

## 4. Maintainability: fases 5 y 6

Antes de continuar, actualiza el baseline y los invariantes del roadmap para la
nueva entrada `./server`, `TemplateCanvas`, las rutas server-only y el helper
raster compartido. No implementes las reglas de la fase 6 usando el mapa anterior
de seis exports.

### 4.1 Fase 5: Published Design Tokens

Plan: [05-design-tokens.md](./maintainability-roadmap/05-design-tokens.md).

- [ ] Revalidar el plan contra el código posterior al servidor.
- [ ] Mantener `styles.css` como único export de estilos.
- [ ] Publicar exactamente los roles `--fk-*` aprobados por el plan.
- [ ] Mantener palette, aliases y registros Tailwind como privados.
- [ ] Migrar chrome del editor y Studio sin tocar artwork.
- [ ] Mantener `TemplateCanvas` libre de chrome del producto.
- [ ] Añadir el contract test de estilos.
- [ ] Clasificar los colores raw restantes.
- [ ] Actualizar documentación pública EN/ES.
- [ ] Verificar light/dark, desktop/mobile y consumer aislado.
- [ ] Ejecutar tarball smoke.
- [ ] Pasar el exit gate de la fase 5.
- [ ] Marcar la fase 5 como completada.

### 4.2 Fase 6: Architectural Import Boundaries

Plan actual que debe revalidarse:
[06-architectural-import-boundaries.md](./maintainability-roadmap/06-architectural-import-boundaries.md).

- [ ] Reescribir el baseline de seis exports para incluir `./server`.
- [ ] Definir explícitamente la capa server.
- [ ] Permitir Node built-ins solamente en server y tooling.
- [ ] Impedir foundation/editor/studio hacia server.
- [ ] Impedir server hacia editor/studio salvo una necesidad demostrada.
- [ ] Permitir `./server` únicamente en adapters server-only del consumer.
- [ ] Rechazar `./server` en client components.
- [ ] Mantener permitido `TemplateCanvas` desde `./editor`.
- [ ] Extender el lint del creator a `template/src`.
- [ ] Añadir tests negativos y positivos con la API de ESLint.
- [ ] Mantener generated imports y boundaries de Next válidos.
- [ ] Verificar package exports y entradas de build.
- [ ] Ejecutar lint, tests, typecheck, builds y tarball smoke.
- [ ] Pasar el exit gate de la fase 6.
- [ ] Marcar la fase 6 como completada.
- [ ] Marcar `maintainability-roadmap/` como completado.

## 5. Backlog no bloqueante

Estas issues no forman parte del completion gate de los tres planes actuales.

### 5.1 Issue #18: Template Quick Switcher

- [ ] Repriorizar después de estabilizar `FrameKitStudio`.
- [ ] Implementar sin crear un command framework.
- [ ] Mantener búsqueda sobre metadata del registry sin cargar templates.
- [ ] Verificar teclado, foco, traducciones y navegación.
- [ ] Cerrar `#18` cuando su acceptance gate pase.

### 5.2 Issue #19: Recent Templates

- [ ] Repriorizar después de estabilizar el resource lifecycle de Studio.
- [ ] Implementar de forma independiente de `#18`.
- [ ] Persistir únicamente slugs válidos y versionados.
- [ ] Verificar orden, deduplicación, límite y datos obsoletos.
- [ ] Cerrar `#19` cuando su acceptance gate pase.

## Gate maestro

El plan raíz está completo cuando todas estas condiciones se cumplen:

- [ ] `#12`, `#13`, `#14`, `#15` y `#17` están cerradas.
- [ ] `Future/` está completado y sincronizado con GitHub.
- [ ] Las seis fases de mantenibilidad aprobaron sus exit gates.
- [ ] Los ocho pasos del server API aprobaron sus exit gates.
- [ ] La issue paraguas de server rendering está cerrada.
- [ ] El export público final incluye `./server` de forma intencional.
- [ ] Client, editor y Studio permanecen libres de dependencias server-only.
- [ ] `pnpm format:check` pasa.
- [ ] `pnpm check:runtime` pasa.
- [ ] `pnpm lint` pasa.
- [ ] `pnpm test` pasa.
- [ ] `pnpm typecheck` pasa.
- [ ] `pnpm build` pasa.
- [ ] Ambos paquetes públicos pasan inspección y tarball smoke.
- [ ] El consumer aislado pasa generate, check, build, start y HTTP readiness.
- [ ] Docker produce un PNG real mediante Chromium como usuario no-root.
- [ ] No quedan jobs, contexts, secretos ni generated outputs comprometidos.
- [ ] README, documentación EN/ES, changelog, `migration-next.md` y skills
  coinciden con el comportamiento publicado.
- [ ] La versión de release continúa siendo una decisión separada.

## Registro de decisiones

| Fecha | Decisión |
| --- | --- |
| 2026-08-31 | Usar un único tracker raíz y mantener los contratos detallados en los planes hijos |
| 2026-08-31 | Resolver `#17` antes de cerrar la integración de Studio `#13` |
| 2026-08-31 | Completar `Future/` antes de iniciar otro roadmap |
| 2026-08-31 | Ejecutar Maintainability 1 a 4 antes del servidor y 5 a 6 después |
| 2026-08-31 | Usar una issue paraguas para server; crear subissues solo si hay trabajo paralelo |
