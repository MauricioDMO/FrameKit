# FrameKit Plan Maestro de Ejecución

* **Estado:** Activo.
* **Última revisión:** 2026-09-02.
* **Alcance:** Coordinar los planes de `Docs/Plans/`, sus issues de GitHub,
  dependencias y gates de finalización.
* **Release:** Este plan no selecciona versiones ni dist-tags.

Este archivo es el tracker operativo general. Los documentos enlazados dentro
de cada directorio siguen siendo la fuente de verdad para contratos técnicos,
casos de prueba, comandos y exit gates detallados.

## Reglas de seguimiento

* GitHub es la fuente oficial para saber si una issue está abierta o cerrada.
* Una implementación local no equivale a una issue cerrada.
* Marca una casilla solamente cuando el trabajo esté terminado y verificado.
* Una fase sin issue se completa cuando pasa el exit gate de su plan hijo.
* No copies resultados extensos de comandos aquí. Regístralos en la issue,
  commit o documento operativo correspondiente y enlaza la evidencia.
* Actualiza este archivo en el mismo cambio que complete una issue, fase o paso.
* Actualiza `Última revisión` cuando cambie el orden, alcance o estado general.
* No edites outputs generados o de build para completar una casilla.
* Si el baseline de un plan hijo cambió por trabajo anterior, adapta paths y
  ownership al checkout actual sin ampliar silenciosamente su alcance.

## Índice de planes

* [Future](./Future/README.md): contrato canónico, documentación y gates de
  release. Su estado local detallado vive en
  [Future/EXECUTION-STATUS.md](./Future/EXECUTION-STATUS.md).
* [Maintainability Roadmap](./maintainability-roadmap/README.md): seis fases de
  mantenimiento que preservan comportamiento.
* [Server Image Rendering API](./server-image-rendering-api/README.md): ocho
  pasos para renderizado PNG autenticado en un proceso Node de larga duración.

## Orden global aprobado

| Orden | Bloque                                                | Gate para avanzar                                                             |
| ----: | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
|     0 | Sincronizar GitHub y alinear issues con los planes    | Issues y planes describen el contrato real                                    |
|     1 | Terminar `Future/`: `#12 -> #17 -> #13 -> #14 -> #15` | `#12`, `#13`, `#14`, `#15` y `#17` cerradas                                   |
|     2 | Maintainability fases 1 a 5                           | Tooling, validación, Editor, Studio y estilos estabilizados                   |
|     3 | Server Image Rendering pasos 1 a 8                    | API, browser, seguridad, Docker y distribución verificadas                    |
|     4 | Maintainability fase 6                                | Límites arquitectónicos definidos contra la arquitectura final con `./server` |
|     5 | Backlog `#18` y `#19`                                 | No bloquea los planes anteriores                                              |

El roadmap de mantenibilidad conserva su dependencia interna, pero su última
fase se ejecuta después del servidor.

Las fases 1 a 5 se completan primero porque estabilizan tooling, validación,
ownership de Editor y Studio y el contrato visual antes de introducir la nueva
superficie server-only.

El plan de servidor se ejecuta después. Su paso 2 puede extraer
`TemplateCanvas` desde el `FrameKitEditor` ya simplificado por la fase 3, sin
duplicar una arquitectura transitoria.

La fase 6 de mantenibilidad queda deliberadamente al final porque define y
hace ejecutables los límites arquitectónicos. Debe implementarse una sola vez
contra la arquitectura definitiva que incluye `./server`, `TemplateCanvas`,
las rutas server-only y los helpers compartidos introducidos por el servidor.

En forma resumida:

```text
GitHub sync
    ↓
Future
#12 → #17 → #13 → #14 → #15
    ↓
Maintainability
1 → 2 → 3 → 4 → 5
    ↓
Server Image Rendering
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
    ↓
Maintainability
6
    ↓
Backlog
#18 / #19
```

## Estado de issues en GitHub

Snapshot consultado el 2026-09-02.

| Issue                                                    | GitHub | Local      | Acción                  |
| -------------------------------------------------------- | ------ | ---------- | ----------------------- |
| [#12](https://github.com/MauricioDMO/FrameKit/issues/12) | Open   | Verificada | Publicar evidencia, sincronizar y cerrar en GitHub |
| [#13](https://github.com/MauricioDMO/FrameKit/issues/13) | Open   | Verificada | Publicar evidencia, sincronizar y cerrar en GitHub |
| [#14](https://github.com/MauricioDMO/FrameKit/issues/14) | Open   | Verificada | Publicar evidencia, sincronizar y cerrar en GitHub |
| [#15](https://github.com/MauricioDMO/FrameKit/issues/15) | Open   | Verificada | Publicar evidencia, sincronizar y cerrar en GitHub |
| [#17](https://github.com/MauricioDMO/FrameKit/issues/17) | Open   | Verificada | Publicar evidencia, sincronizar y cerrar en GitHub |
| [#18](https://github.com/MauricioDMO/FrameKit/issues/18) | Open   | Backlog    | Diferir                 |
| [#19](https://github.com/MauricioDMO/FrameKit/issues/19) | Open   | Backlog    | Diferir                 |

Ninguna issue abierta tiene parent, subissues, milestone o assignee. No hay una
issue asignada al plan de server rendering y el roadmap de mantenibilidad no
requiere issues por diseño.

## 0. Gobierno y sincronización

* [x] Inventariar todos los planes bajo `Docs/Plans/`.
* [x] Consultar el estado y contenido de las issues abiertas.
* [x] Aprobar el orden global de este documento.
* [x] Crear este tracker maestro en `Docs/Plans/README.md`.
* [x] Registrar el snapshot inicial con fecha.
* [ ] Corregir en `#12` a `#15` los enlaces que contienen
  `Docs/Plans/Future/Execution/`.
* [ ] Cambiar los títulos de `#13`, `#14` y `#15` para eliminar la promesa de
  versión `0.6`.
* [ ] Actualizar `#12` para reflejar que `#9` fue cerrado como no planificado.
* [ ] Eliminar de `#13` el resolver discriminado y el global last-valid preview
  rechazados al cerrar `#9`.
* [ ] Eliminar de `#14` la migración hacia el resolver discriminado.
* [ ] Actualizar en `#14` el baseline de `CHANGELOG.md` y `migration-next.md`.
* [ ] Crear una issue paraguas para server image rendering.
* [ ] Enlazar en esa issue los ocho pasos del plan de servidor.
* [ ] Mantener el roadmap de mantenibilidad sin issues obligatorias.
* [ ] Registrar `#18` y `#19` como backlog no bloqueante.
* [ ] Confirmar que el orden global de este README coincide con los planes hijos.

## 1. Cierre de Future

Orden obligatorio:

```text
#12 → #17 → #13 → #14 → #15
```

`#17` forma parte de este bloque porque corrige un bug del contrato persistido
que debe resolverse antes de considerar finalizada la integración de Studio.

### 1.1 Issue #12: Generated Template Registry

Plan:
[issue-12-generated-template-registry.md](./Future/issue-12-generated-template-registry.md).

* [x] Implementar el registry canónico.
* [x] Incluir metadata, dimensiones, variantes, assets y loaders lazy.
* [x] Verificar regeneración automática en desarrollo y build.
* [x] Completar tests, documentación, changelog, migraciones y starter.
* [x] Registrar los checks locales en `Future/EXECUTION-STATUS.md`.
* [ ] Revisar que el cuerpo de `#12` coincida con el contrato final.
* [ ] Marcar los acceptance criteria reales en GitHub.
* [ ] Publicar un comentario con commits y verificaciones.
* [x] Confirmar que no existen regresiones posteriores relevantes.
* [ ] Cerrar `#12` en GitHub.
* [x] Registrar `#12` como verificada localmente en este tracker.

### 1.2 Issue #17: Persisted Choice Values

Issue:
[#17](https://github.com/MauricioDMO/FrameKit/issues/17).

* [x] Confirmar la reproducción con una opción eliminada o renombrada.
* [x] Añadir una comprobación local de pertenencia a `field.options` durante la
  hidratación.
* [x] Descartar solamente el override inválido.
* [x] Preservar los demás campos válidos de la misma variante.
* [x] Confirmar fallback hacia contenido de variante o default.
* [x] Mantener sin cambios number, boolean, text, color e image.
* [x] Añadir un test para una opción persistida válida.
* [x] Añadir un test para una opción obsoleta con campos hermanos válidos.
* [x] Verificar que el renderer recibe el valor resuelto actual.
* [x] Actualizar el test que actualmente conserva la opción desconocida.
* [x] Añadir una entrada en `CHANGELOG.md` bajo `Unreleased`.
* [x] Registrar que no requiere migración ni cambio de storage version.
* [x] Verificar estado y editor mediante la suite completa.
* [x] Ejecutar checks completos del paquete y repositorio.
* [ ] Publicar evidencia, sincronizar la issue y cerrar `#17`.

### 1.3 Issue #13: Studio Canonical Contract

Plan:
[issue-13-studio-canonical-contract.md](./Future/issue-13-studio-canonical-contract.md).

* [x] Consumir el registry canónico directamente en Studio.
* [x] Integrar metadata, variantes y datos tipados.
* [x] Integrar persistencia `v2`, controles nativos y validación.
* [x] Completar tests, documentación, skills, changelog y migraciones.
* [x] Registrar los checks locales en `Future/EXECUTION-STATUS.md`.
* [x] Resolver `#17` localmente antes del cierre.
* [ ] Actualizar el cuerpo para coincidir con la decisión de cierre de `#9`.
* [ ] Eliminar referencias al global last-valid preview no implementado.
* [ ] Corregir el enlace al plan.
* [ ] Marcar los acceptance criteria reales en GitHub.
* [ ] Publicar un comentario con commits y verificaciones.
* [ ] Cerrar `#13` en GitHub.
* [x] Registrar `#13` como verificada localmente en este tracker.

### 1.4 Issue #14: Documentation and Migration

Plan:
[issue-14-documentation-and-migration.md](./Future/issue-14-documentation-and-migration.md).

* [x] Inventariar exports, registry, CLI, starter y comportamiento final de
  Studio.
* [x] Comparar el inventario con los cuatro README públicos.
* [x] Auditar todos los pares afectados bajo `Docs/en` y `Docs/es`.
* [x] Confirmar equivalencia temática entre inglés y español.
* [x] Eliminar enseñanza actual de APIs obsoletas.
* [x] Mantener referencias obsoletas solamente en contexto histórico.
* [x] Consolidar `Docs/en/getting-started/migration-next.md`.
* [x] Consolidar `Docs/es/getting-started/migration-next.md`.
* [x] Auditar `CHANGELOG.md` bajo `Unreleased`.
* [x] Confirmar metadata, variants, `field` singular y tipos
  number/boolean/choice.
* [x] Confirmar registry automático, persistencia `v2` y controles de Studio.
* [x] Mantener server image rendering documentado como trabajo futuro.
* [x] Actualizar únicamente las skills canónicas de `Docs/skills`.
* [x] Ejecutar `pnpm sync:skills`.
* [x] Verificar Quick Start con el starter generado.
* [ ] Verificar links y anchors internos.
* [x] Verificar generación, check, typecheck y build del starter.
* [x] Ejecutar runtime check, lint, tests, typecheck y build del repositorio.
* [ ] Publicar evidencia en `#14`.
* [ ] Cerrar `#14`.
* [x] Registrar `#14` como verificada localmente en este tracker.

### 1.5 Issue #15: Testing and Release Gates

Plan:
[issue-15-testing-and-release-gates.md](./Future/issue-15-testing-and-release-gates.md).

* [x] Auditar la matriz existente sin duplicar tests enfocados.
* [x] Identificar únicamente gaps cross-layer.
* [x] Mantener Linux CI en Node `22.13.0` y `24`.
* [x] Fortalecer Windows para construir ambos paquetes públicos.
* [x] Configurar un consumer de Windows de forma no interactiva; su ejecución
  queda pendiente en CI.
* [ ] Ejecutar generate y check en el consumer de Windows.
* [x] Añadir un único E2E crítico con Chromium.
* [x] Cubrir metadata, variante y campos text/number/choice/boolean/color.
* [x] Cubrir draft numérico inválido y preview confirmado.
* [x] Exportar PNG y comprobar dimensiones sin dependencia adicional.
* [x] Implementar o documentar un único smoke reproducible de tarballs.
* [x] Instalar ambos tarballs fuera del workspace.
* [x] Ejecutar create, generate, check, build, start y HTTP readiness.
* [x] Rechazar workspace references y rutas locales en los paquetes.
* [x] Documentar el smoke post-publicación con versiones exactas.
* [x] Separar pre-publicación, post-publicación y promoción de dist-tag.
* [x] Actualizar documentación EN/ES de testing y distribución.
* [x] Actualizar skills canónicas de release.
* [x] Añadir changelog y nota explícita de no migración.
* [ ] Ejecutar todas las lanes y smokes requeridos.
* [ ] Publicar evidencia en `#15`.
* [ ] Cerrar `#15`.
* [ ] Marcar `Future/` como completado.

### 1.6 Gate de Future

No iniciar el roadmap siguiente hasta confirmar:

* [ ] `#12` está cerrada.
* [ ] `#17` está cerrada.
* [ ] `#13` está cerrada.
* [ ] `#14` está cerrada.
* [ ] `#15` está cerrada.
* [ ] `Future/EXECUTION-STATUS.md` coincide con GitHub.
* [x] Documentación, changelog, migration guides y skills están sincronizados.
* [ ] Los gates definidos por `#15` pasan sobre el baseline final de Future.

## 2. Maintainability: fases 1 a 5

Las primeras cinco fases se ejecutan consecutivamente antes del servidor.

```text
1 → 2 → 3 → 4 → 5
```

La fase 6 no se incluye todavía porque debe establecer las fronteras
arquitectónicas después de que exista la superficie definitiva `./server`.

### 2.1 Fase 1: Repository Formatting and Checks

Plan:
[01-repository-formatting-and-checks.md](./maintainability-roadmap/01-repository-formatting-and-checks.md).

* [ ] Validar el baseline contra el checkout actual.
* [ ] Añadir EditorConfig, Git attributes y configuración mínima de Prettier.
* [ ] Definir ignores para outputs generados y sincronizados.
* [ ] Añadir solamente `prettier` y `lint-staged`.
* [ ] Añadir `format` y `format:check`.
* [ ] Preservar ESLint como lint completo.
* [ ] Preservar `pnpm sync:skills` y staging explícito en Husky.
* [ ] Añadir el format check temprano en CI.
* [ ] Actualizar instrucciones y documentación EN/ES.
* [ ] Separar tooling/configuración del formato mecánico.
* [ ] Ejecutar una sola aplicación global de Prettier.
* [ ] Confirmar que no hay cambios lógicos ni generated output.
* [ ] Ejecutar el hard exit gate completo.
* [ ] Marcar la fase 1 como completada.

### 2.2 Fase 2: Definition Validation Split

Plan:
[02-definition-validation-split.md](./maintainability-roadmap/02-definition-validation-split.md).

* [ ] Confirmar los casos y el orden de errores del validator actual.
* [ ] Extraer utilidades comunes una sola vez.
* [ ] Separar metadata, dimensiones, fields, variants y composición.
* [ ] Mantener `definition.ts` como facade pública de secuenciación.
* [ ] Preservar mensajes, primer error, narrowing y orden de inserción.
* [ ] Mantener sin cambios exports públicos y tipos.
* [ ] Redistribuir tests sin duplicar la matriz.
* [ ] Verificar `defineTemplate`, Studio, CLI y codegen.
* [ ] Ejecutar checks enfocados y completos.
* [ ] Marcar la fase 2 como completada.

### 2.3 Fase 3: Editor Orchestration

Plan:
[03-editor-orchestration.md](./maintainability-roadmap/03-editor-orchestration.md).

* [ ] Confirmar el contrato público actual de `FrameKitEditor`.
* [ ] Extraer solamente `EditorHeader`.
* [ ] Extraer solamente `TemplateMetadataDialog`.
* [ ] Mantener upload, resolver, validación y export en el orchestrator.
* [ ] Mantener temporalmente el render wrapper en `FrameKitEditor`.
* [ ] Preservar controles, preview, state, persistence y navigation existentes.
* [ ] Preservar Escape, backdrop, foco inicial y restauración de foco.
* [ ] Añadir tests directos del header y dialog.
* [ ] Mantener el test de integración de `FrameKitEditor`.
* [ ] Confirmar que `./editor` no gana exports nuevos en esta fase.
* [ ] Ejecutar checks enfocados y completos.
* [ ] Marcar la fase 3 como completada.

El render wrapper permanece deliberadamente dentro de `FrameKitEditor` en esta
fase. Su extracción a `TemplateCanvas` pertenece al paso 2 del plan de servidor.

### 2.4 Fase 4: Studio Shell Split

Plan:
[04-studio-shell-split.md](./maintainability-roadmap/04-studio-shell-split.md).

* [ ] Confirmar el contrato público actual de `FrameKitStudio`.
* [ ] Extraer `useStudioResource`.
* [ ] Preservar cancelación de promises obsoletas.
* [ ] Extraer estados loading, empty, not-found y error.
* [ ] Extraer settings y preservar ownership de theme/locale.
* [ ] Extraer el shell/sidebar sin cambiar rutas.
* [ ] Mantener route detection y composición en la facade.
* [ ] Preservar validación y comprobación de dimensiones.
* [ ] Preservar exports `./studio` y `./studio/root`.
* [ ] Cubrir races, errores, settings, accessibility y contenido ready.
* [ ] Verificar Studio y consumer generado aislado.
* [ ] Ejecutar checks completos.
* [ ] Marcar la fase 4 como completada.

### 2.5 Fase 5: Published Design Tokens

Plan:
[05-design-tokens.md](./maintainability-roadmap/05-design-tokens.md).

* [ ] Revalidar el plan contra el código posterior a la fase 4.
* [ ] Mantener `styles.css` como único export de estilos.
* [ ] Publicar exactamente los roles `--fk-*` aprobados por el plan.
* [ ] Mantener palette, aliases y registros Tailwind como privados.
* [ ] Migrar chrome del Editor y Studio sin tocar artwork de templates.
* [ ] Mantener el render wrapper sin estilos de chrome del producto.
* [ ] Añadir el contract test de estilos.
* [ ] Clasificar los colores raw restantes.
* [ ] Actualizar documentación pública EN/ES.
* [ ] Verificar light/dark, desktop/mobile y consumer aislado.
* [ ] Ejecutar tarball smoke.
* [ ] Pasar el exit gate de la fase 5.
* [ ] Marcar la fase 5 como completada.

La fase 5 no espera al servidor porque su contrato es visual y depende de la
estructura estabilizada por las fases anteriores, no de `./server`.

### 2.6 Gate antes del servidor

* [ ] Confirmar que las fases 1 a 5 aprobaron sus exit gates.
* [ ] Confirmar que no cambió comportamiento runtime existente.
* [ ] Confirmar que los exports actuales siguen siendo compatibles.
* [ ] Confirmar que `FrameKitEditor` tiene el ownership esperado por el plan de
  `TemplateCanvas`.
* [ ] Confirmar que Studio tiene el shell y lifecycle estabilizados.
* [ ] Revalidar todos los paths del plan de server rendering.
* [ ] Separar cualquier drift del baseline de cambios de alcance.
* [ ] Confirmar que la fase 6 sigue pendiente intencionalmente.

## 3. Server Image Rendering API

El plan de servidor se ejecuta completo después de Maintainability 1 a 5.

```text
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
```

La primera implementación soporta un único proceso Node de larga duración por
contenedor. El handoff entre la API pública y la página privada usa memoria de
proceso mediante `globalThis + Map`.

### 3.1 Preflight

* [ ] Crear una issue paraguas para la implementación.
* [ ] Enlazar los ocho documentos de `server-image-rendering-api/`.
* [ ] Revalidar todos los paths después de Maintainability 1 a 5.
* [ ] Congelar el contrato del registry entregado por `#12`.
* [ ] Congelar resolver, validación, variantes y assets entregados por `#13`.
* [ ] Confirmar el contrato de `FrameKitEditor` después de Maintainability 3.
* [ ] Confirmar el ownership de Studio después de Maintainability 4.
* [ ] Confirmar que los tokens de Maintainability 5 no afectan el render canvas.
* [ ] Resolver cualquier discrepancia restante de `AbortSignal` entre los pasos.
* [ ] Definir la ubicación arquitectónica final de `shared/raster-image.ts`.
* [ ] Confirmar Node de larga duración como único target inicial.
* [ ] Confirmar un proceso Node por contenedor como boundary de v1.
* [ ] Confirmar PNG síncrono como único output inicial.
* [ ] Confirmar `globalThis + Map` como store temporal de v1.
* [ ] Confirmar límites, configuración y política de hosts.
* [ ] Registrar qué infraestructura de `#15` será reutilizada.

### 3.2 Paso 1: Contracts and Server Boundary

Plan:
[01-contracts-and-server-boundary.md](./server-image-rendering-api/01-contracts-and-server-boundary.md).

* [ ] Añadir la entrada server-only.
* [ ] Definir tipos públicos de request, config y error.
* [ ] Definir un payload interno serializable.
* [ ] Implementar un parser puro de configuración.
* [ ] Implementar autenticación Bearer de tiempo constante.
* [ ] Rechazar configuración insegura en producción.
* [ ] Mantener secretos fuera de errores y logs.
* [ ] Verificar que client/editor/studio no incluyan dependencias server.
* [ ] Añadir tests y type fixture.
* [ ] Pasar el exit gate del paso 1.

### 3.3 Paso 2: Shared Canvas and Image Inputs

Plan:
[02-shared-canvas-and-image-inputs.md](./server-image-rendering-api/02-shared-canvas-and-image-inputs.md).

* [ ] Extraer `TemplateCanvas` desde el render wrapper existente.
* [ ] Exportarlo mediante `./editor`.
* [ ] Migrar `FrameKitEditor` al canvas compartido sin cambiar export/copy.
* [ ] Mantener `TemplateCanvas` libre de preview scaling, shell, theme y chrome.
* [ ] Centralizar validación de firmas raster.
* [ ] Mantener upload de desarrollo sin regresiones.
* [ ] Validar data URLs PNG/JPEG/WebP/GIF.
* [ ] Validar URLs HTTPS con hostname exacto.
* [ ] Descargar imágenes remotas mediante Node.js antes del browser.
* [ ] Convertir imágenes remotas válidas a data URLs canónicas.
* [ ] Validar únicamente namespaces root-relative permitidos.
* [ ] Rechazar SVG, traversal, credenciales, puertos y redirects inseguros.
* [ ] Clonar manifests sin escribir archivos del proyecto.
* [ ] Preservar precedencia defaults, variant, edits y assets.
* [ ] Pasar el exit gate del paso 2.

### 3.4 Paso 3: Temporary Render Jobs

Plan:
[03-temporary-render-jobs.md](./server-image-rendering-api/03-temporary-render-jobs.md).

* [ ] Implementar el store mediante `globalThis + Symbol.for(...)`.
* [ ] Mantener los jobs en un `Map<string, RenderJobRecord>`.
* [ ] Generar ID y token criptográficos independientes.
* [ ] Mantener ID y token con al menos 128 bits de entropía.
* [ ] Implementar `createRenderJob`.
* [ ] Implementar `loadRenderRequest`.
* [ ] Implementar `deleteRenderJob`.
* [ ] Mantener el `Map` privado detrás de los helpers.
* [ ] Aplicar TTL de dos minutos.
* [ ] Eliminar jobs expirados oportunísticamente al crear nuevos jobs.
* [ ] No extender TTL cuando la página privada lea un job.
* [ ] Hacer indistinguibles missing, expired y unauthorized en la frontera
  privada.
* [ ] Comparar tokens en tiempo constante.
* [ ] Mantener load no destructivo.
* [ ] Hacer delete idempotente.
* [ ] Añadir retry acotado ante una colisión de ID.
* [ ] Cubrir creación, lectura, expiración, token inválido y cleanup.
* [ ] Verificar que bundles separados comparten el mismo store de proceso.
* [ ] Confirmar que no existe filesystem, Redis, database, queue ni object
  storage para los jobs de v1.
* [ ] Pasar el exit gate del paso 3.

### 3.5 Paso 4: Browser Lifecycle and Capture

Plan:
[04-browser-lifecycle-and-capture.md](./server-image-rendering-api/04-browser-lifecycle-and-capture.md).

* [ ] Implementar un singleton global de Chromium.
* [ ] Crear un contexto y página aislados por request.
* [ ] Reservar capacidad atómicamente sin queue ilimitada.
* [ ] Limitar navegación al origen loopback configurado.
* [ ] Bloquear redirects, popups, downloads y hosts no permitidos.
* [ ] Inyectar el token únicamente en la request privada exacta.
* [ ] Esperar marker, fonts e imágenes.
* [ ] Capturar solamente `[data-framekit-render-root]`.
* [ ] Verificar firma PNG.
* [ ] Propagar timeout y abort.
* [ ] Cerrar contexto, liberar capacidad y eliminar job en `finally`.
* [ ] Implementar idle close y shutdown idempotente.
* [ ] Pasar el exit gate del paso 4.

### 3.6 Paso 5: Private Next.js Render Route

Plan:
[05-private-next-render-route.md](./server-image-rendering-api/05-private-next-render-route.md).

* [ ] Añadir la ruta privada en el template canónico.
* [ ] Añadir la ruta privada en Studio.
* [ ] Autenticar con ID y token interno.
* [ ] Mantener el token fuera de URL, props y DOM.
* [ ] Cargar el payload ya resuelto mediante `loadRenderRequest`.
* [ ] Cargar el registry generado y la definición exacta.
* [ ] Revalidar dimensiones y variante contra la definición.
* [ ] Renderizar un único `TemplateCanvas`.
* [ ] No ejecutar nuevamente el pipeline canónico de resolución.
* [ ] Exponer markers loading, ready y error sin datos privados.
* [ ] Desactivar cache y static generation.
* [ ] Añadir instrumentation Node-only para shutdown cuando corresponda.
* [ ] Ejecutar un production build/start smoke que confirme que la API y la
  página privada comparten el mismo store `globalThis`.
* [ ] Pasar el exit gate del paso 5.

### 3.7 Paso 6: Public Image API Route

Plan:
[06-public-image-api-route.md](./server-image-rendering-api/06-public-image-api-route.md).

* [ ] Añadir `POST /api/v1/images` en el template.
* [ ] Añadir el mismo adapter delgado en Studio.
* [ ] Cargar configuración antes del body.
* [ ] Autenticar antes de revelar template o errores específicos.
* [ ] Leer el body con límite incremental de 12 MB.
* [ ] Validar content type, UTF-8 y forma JSON exacta.
* [ ] Rechazar propiedades y field keys desconocidos.
* [ ] Cargar template y variante mediante el registry.
* [ ] Preparar imágenes remotas antes de reservar capacidad del browser.
* [ ] Resolver template data una sola vez.
* [ ] Validar template data una sola vez.
* [ ] Crear el payload final ya resuelto.
* [ ] Propagar cancelación al renderer.
* [ ] Retornar bytes PNG directamente.
* [ ] Retornar headers seguros y `Cache-Control: no-store`.
* [ ] Mapear errores mediante códigos, no parsing de mensajes.
* [ ] Evitar logs sensibles.
* [ ] Pasar el exit gate del paso 6.

### 3.8 Paso 7: Packaging and Docker

Plan:
[07-packaging-and-docker.md](./server-image-rendering-api/07-packaging-and-docker.md).

* [ ] Finalizar el export público `./server`.
* [ ] Añadir la entrada correspondiente en el build.
* [ ] Alinear una sola versión compatible de `playwright-core`.
* [ ] Evitar descarga de browsers durante instalación normal.
* [ ] Añadir integración al template generado.
* [ ] Añadir `Dockerfile` y `.dockerignore`.
* [ ] Instalar solamente el Chromium requerido por producción.
* [ ] Ejecutar con usuario no-root y `tini`.
* [ ] Mantener secretos fuera de layers.
* [ ] Verificar copy de archivos ocultos del creator.
* [ ] Inspeccionar ambos tarballs.
* [ ] Construir y ejecutar la imagen limpia.
* [ ] Pasar el exit gate del paso 7.

### 3.9 Paso 8: Verification and Rollout

Plan:
[08-verification-and-rollout.md](./server-image-rendering-api/08-verification-and-rollout.md).

* [ ] Ejecutar todos los tests enfocados de los pasos 1 a 7.
* [ ] Ejecutar los checks completos del repositorio.
* [ ] Ejecutar smoke real con Docker y Chromium.
* [ ] Verificar render con defaults y assets existentes.
* [ ] Verificar imágenes base64 válidas.
* [ ] Verificar un host HTTPS permitido.
* [ ] Verificar unauthorized, malformed y blocked host.
* [ ] Verificar capacity exhausted y timeout.
* [ ] Verificar firma PNG y dimensiones esperadas.
* [ ] Verificar ausencia de jobs y contexts filtrados.
* [ ] Verificar SIGTERM y shutdown limpio.
* [ ] Ejecutar smoke con tarballs fuera del workspace.
* [ ] Reutilizar el harness creado por `#15`.
* [ ] Actualizar documentación EN/ES.
* [ ] Actualizar README, changelog y `migration-next.md`.
* [ ] Registrar una nota aditiva de no migración.
* [ ] Publicar evidencia en la issue paraguas.
* [ ] Cerrar la issue de server rendering.
* [ ] Marcar el plan de servidor como completado.

### 3.10 Gate del servidor

No iniciar Maintainability 6 hasta confirmar:

* [ ] Los ocho pasos aprobaron sus exit gates.
* [ ] El export público `./server` está definido y empaquetado.
* [ ] `TemplateCanvas` forma parte intencional de `./editor`.
* [ ] Las rutas públicas y privadas utilizan únicamente exports soportados.
* [ ] Los jobs temporales usan exclusivamente memoria de proceso.
* [ ] Chromium no tiene acceso arbitrario a imágenes remotas.
* [ ] El consumer generado funciona fuera del workspace.
* [ ] Docker genera correctamente un PNG mediante Chromium.
* [ ] La issue paraguas está cerrada.
* [ ] La documentación pública describe correctamente el nuevo contrato.

## 4. Maintainability: fase 6

La fase final de mantenibilidad se ejecuta contra la arquitectura posterior al
servidor.

Antes de implementarla, actualiza su baseline para incluir:

* `./server`;
* `src/server/**`;
* `TemplateCanvas` en `./editor`;
* `shared/raster-image.ts`;
* rutas públicas y privadas de render;
* adapters server-only del consumer;
* el nuevo package/build entry;
* Playwright y Node como dependencias exclusivamente server/tooling donde
  corresponda.

No implementes las reglas de la fase 6 usando el mapa anterior de seis exports.

### 4.1 Fase 6: Architectural Import Boundaries

Plan actual que debe revalidarse:
[06-architectural-import-boundaries.md](./maintainability-roadmap/06-architectural-import-boundaries.md).

* [ ] Revalidar el documento completo contra el checkout posterior al servidor.
* [ ] Reescribir el baseline de exports para incluir `./server`.
* [ ] Añadir explícitamente la capa Server al modelo arquitectónico.
* [ ] Definir la dirección permitida entre Foundation, Editor, Studio, Server,
  Tooling y Consumers.
* [ ] Permitir Node built-ins solamente donde correspondan a Server y Tooling.
* [ ] Impedir Foundation hacia Editor, Studio, Server y Tooling.
* [ ] Impedir Editor hacia Studio, Server y Tooling.
* [ ] Impedir Studio hacia Server y Tooling salvo boundaries server-only
  explícitas fuera del reusable Studio client code.
* [ ] Impedir Server hacia Editor/Studio salvo imports públicos explícitamente
  necesarios y aprobados.
* [ ] Mantener `TemplateCanvas` consumido mediante `./editor`.
* [ ] Permitir `./server` únicamente en código server-only.
* [ ] Rechazar imports de `./server` en client components.
* [ ] Mantener tooling separado de Editor, Studio y Server runtime.
* [ ] Mantener consumer code sobre package exports soportados.
* [ ] Rechazar imports directos de `packages/framekit/src/**`.
* [ ] Extender el lint del creator a `template/src`.
* [ ] Mantener generated sources correctamente excluidos o tratados según el
  contrato definitivo.
* [ ] Añadir tests negativos y positivos de las reglas arquitectónicas.
* [ ] Mantener `pnpm check:runtime` separado de import-boundary enforcement.
* [ ] Verificar package exports y entradas de build.
* [ ] Verificar el consumer canónico aislado.
* [ ] Ejecutar lint, tests, typecheck, builds y tarball smoke.
* [ ] Pasar el exit gate de la fase 6.
* [ ] Marcar la fase 6 como completada.
* [ ] Marcar `maintainability-roadmap/` como completado.

### 4.2 Gate de arquitectura final

* [ ] Foundation no depende de capas superiores.
* [ ] Editor no depende de Studio ni Server.
* [ ] Studio reusable/client no depende de Server.
* [ ] Server-only code puede usar Node y Playwright sin contaminar bundles
  cliente.
* [ ] Tooling conserva sus dependencias Node sin crear reverse edges.
* [ ] Consumers utilizan solamente package exports soportados.
* [ ] `./server` no aparece en client components.
* [ ] `TemplateCanvas` cruza el boundary público mediante `./editor`.
* [ ] Los tests negativos demuestran que las restricciones realmente fallan.
* [ ] El consumer empaquetado sigue funcionando fuera del monorepo.

## 5. Backlog no bloqueante

Estas issues no forman parte del completion gate de los tres planes principales.

Pueden repriorizarse una vez estabilizada la arquitectura final, pero no deben
intercalarse en Future, Maintainability ni Server salvo que se conviertan
explícitamente en trabajo bloqueante mediante una nueva decisión registrada.

### 5.1 Issue #18: Template Quick Switcher

* [ ] Repriorizar después de estabilizar `FrameKitStudio`.
* [ ] Implementar sin crear un command framework.
* [ ] Mantener búsqueda sobre metadata del registry sin cargar templates.
* [ ] Verificar teclado, foco, traducciones y navegación.
* [ ] Cerrar `#18` cuando su acceptance gate pase.

### 5.2 Issue #19: Recent Templates

* [ ] Repriorizar después de estabilizar el resource lifecycle de Studio.
* [ ] Implementar de forma independiente de `#18`.
* [ ] Persistir únicamente slugs válidos y versionados.
* [ ] Verificar orden, deduplicación, límite y datos obsoletos.
* [ ] Cerrar `#19` cuando su acceptance gate pase.

## Gate maestro

El plan raíz está completo cuando todas estas condiciones se cumplen:

### Future

* [ ] `#12`, `#13`, `#14`, `#15` y `#17` están cerradas.
* [ ] `Future/` está completado y sincronizado con GitHub.

### Maintainability

* [ ] Las seis fases de mantenibilidad aprobaron sus exit gates.
* [ ] Las fases 1 a 5 se ejecutaron antes del servidor.
* [ ] La fase 6 se ejecutó contra la arquitectura final posterior al servidor.

### Server Image Rendering

* [ ] Los ocho pasos del server API aprobaron sus exit gates.
* [ ] La issue paraguas de server rendering está cerrada.
* [ ] El export público final incluye `./server` de forma intencional.
* [ ] `TemplateCanvas` forma parte del boundary público esperado.
* [ ] Los jobs temporales usan `globalThis + Map`.
* [ ] Client, Editor y Studio reusable permanecen libres de dependencias
  server-only.
* [ ] Las imágenes remotas se materializan mediante Node antes del browser.
* [ ] Chromium no tiene acceso arbitrario a la red externa.

### Repository gates

* [ ] `pnpm format:check` pasa.
* [x] `pnpm check:runtime` pasa.
* [x] `pnpm lint` pasa.
* [x] `pnpm test` pasa.
* [x] `pnpm typecheck` pasa.
* [x] `pnpm build` pasa.
* [x] Ambos paquetes públicos pasan inspección y tarball smoke.
* [x] El consumer aislado pasa generate, check, build, start y HTTP readiness.
* [ ] Docker produce un PNG real mediante Chromium como usuario no-root.
* [ ] No quedan jobs, contexts, secretos ni generated outputs comprometidos.
* [x] README, documentación EN/ES, changelog, `migration-next.md` y skills
  coinciden con el comportamiento verificado localmente.
* [x] La versión de release continúa siendo una decisión separada.

## Registro de decisiones

| Fecha      | Decisión                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-31 | Usar un único tracker raíz y mantener los contratos detallados en los planes hijos                                                 |
| 2026-08-31 | Resolver `#17` dentro de Future y antes de cerrar la integración de Studio `#13`                                                   |
| 2026-08-31 | Completar `Future/` antes de iniciar Maintainability                                                                               |
| 2026-08-31 | Ejecutar Maintainability fases 1 a 5 antes de implementar Server Image Rendering                                                   |
| 2026-08-31 | Extraer `TemplateCanvas` durante Server Step 2, después de simplificar `FrameKitEditor` en Maintainability 3                       |
| 2026-08-31 | Ejecutar Maintainability fase 6 después del servidor para definir una sola vez los límites de la arquitectura final con `./server` |
| 2026-08-31 | Usar `globalThis + Map` como almacenamiento temporal de render jobs para v1                                                        |
| 2026-08-31 | Limitar v1 a un proceso Node de larga duración por contenedor                                                                      |
| 2026-08-31 | Mantener `#18` y `#19` como backlog no bloqueante                                                                                  |
| 2026-08-31 | Usar una issue paraguas para server rendering; crear subissues solo si aparece trabajo paralelo real                               |
