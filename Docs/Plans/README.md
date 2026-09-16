# FrameKit Plan Maestro de Ejecución

* **Estado:** Activo.
* **Última revisión:** 2026-09-15.
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

* Future (bloque completado): contrato canónico, documentación y gates de
  release. El detalle histórico se conserva en el historial de Git y en las
  issues cerradas #12, #13, #14, #15 y #17.
* [Maintainability Roadmap](./maintainability-roadmap/README.md): seis fases de
  mantenimiento que preservan comportamiento. Es el siguiente bloque operativo
  después del cierre versionless del bloque Future.
* [Server Image Rendering API](./server-image-rendering-api/README.md): ocho
  pasos para renderizado PNG autenticado en un proceso Node de larga duración.
* [Studio Access, API Tokens, and Server-backed Export](./studio-access-and-api-rendering/README.md):
  ocho fases para acceso a Studio mediante SQLite, usuarios, sesiones, API
  tokens, export server-side y persistencia Docker.

## Orden global aprobado

| Orden | Bloque                                                | Gate para avanzar                                                             |
| ----: | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
|     0 | Sincronizar GitHub y alinear issues con los planes    | Issues y planes activos describen el contrato real                            |
|     1 | Cerrar el bloque Future: `#12 -> #17 -> #13 -> #14 -> #15` | `#12`, `#13`, `#14`, `#15` y `#17` cerradas                                   |
|     2 | Maintainability fases 1 a 5                           | Tooling, validación, Editor, Studio y estilos estabilizados                   |
|     3 | Server Image Rendering pasos 1 a 7                    | API, browser, seguridad, packaging y Docker base verificados                   |
|     4 | Studio Access & API Rendering fases 1 a 8             | SQLite, auth, usuarios, tokens, export server-side y volumen verificados       |
|     5 | Server Image Rendering paso 8: reverificación y cierre | Evidencia final publicada contra la arquitectura transversal definitiva       |
|     6 | Maintainability fase 6                                | Límites arquitectónicos definidos contra la arquitectura final con `./server` |
|     7 | Backlog `#18` y `#19`                                 | No bloquea los planes anteriores                                              |

El estado operativo del servidor es explícito: los límites 0.5 y 0.6 y los
pasos 1 a 7 están implementados y verificados. La mayor parte de la evidencia
técnica del Paso 8 también se ejecutó contra el baseline de API key compartida y
export browser-side, pero su cierre final queda bloqueado por Studio Access & API
Rendering y debe revalidarse contra esa arquitectura. La fase 6 de
Maintainability también sigue pendiente.

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
1 → 2 → 3 → 4 → 5 → 6 → 7
    ↓
Studio Access & API Rendering
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
    ↓
Server Image Rendering
8 (reverificación y cierre)
    ↓
Maintainability
6
    ↓
Backlog
#18 / #19
```

## Estado de issues en GitHub

Snapshot consultado el 2026-09-05.

| Issue                                                    | GitHub | Local      | Acción                  |
| -------------------------------------------------------- | ------ | ---------- | ----------------------- |
| [#12](https://github.com/MauricioDMO/FrameKit/issues/12) | Closed | Verificada y sincronizada | Issue cerrada; seguimiento normal del contrato |
| [#13](https://github.com/MauricioDMO/FrameKit/issues/13) | Closed | Verificada y sincronizada | Issue cerrada; seguimiento normal del contrato |
| [#14](https://github.com/MauricioDMO/FrameKit/issues/14) | Closed | Verificada y sincronizada | Issue cerrada; seguimiento normal de documentación |
| [#15](https://github.com/MauricioDMO/FrameKit/issues/15) | Closed | Verificada con CI 33948285021 | Issue cerrada; smoke npm queda como handoff de release |
| [#17](https://github.com/MauricioDMO/FrameKit/issues/17) | Closed | Verificada y sincronizada | Issue cerrada; seguimiento normal del contrato |
| [#18](https://github.com/MauricioDMO/FrameKit/issues/18) | Open   | Backlog    | Diferir                 |
| [#19](https://github.com/MauricioDMO/FrameKit/issues/19) | Open   | Backlog    | Diferir                 |

Las issues del bloque Future están cerradas. #18 y #19 permanecen abiertas como
backlog no bloqueante. Ninguna issue abierta tiene parent, subissues, milestone o
assignee. No hay una issue asignada al plan de server rendering y el roadmap de
mantenibilidad no requiere issues por diseño.

## 0. Gobierno y sincronización

* [x] Inventariar todos los planes bajo `Docs/Plans/`.
* [x] Consultar el estado y contenido de las issues abiertas.
* [x] Aprobar el orden global de este documento.
* [x] Crear este tracker maestro en `Docs/Plans/README.md`.
* [x] Registrar el snapshot inicial con fecha.
* [x] Handoff externo: sincronizar en GitHub el cuerpo de [#12](https://github.com/MauricioDMO/FrameKit/issues/12) con el contrato final.
* [x] Handoff externo: sincronizar en GitHub el cuerpo de [#13](https://github.com/MauricioDMO/FrameKit/issues/13) con el contrato final y retirar los requisitos rechazados.
* [x] Handoff externo: sincronizar en GitHub el cuerpo de [#14](https://github.com/MauricioDMO/FrameKit/issues/14) con el contrato final.
* [x] Handoff externo: sincronizar en GitHub el cuerpo de [#15](https://github.com/MauricioDMO/FrameKit/issues/15) con el contrato final.
* [x] Handoff externo: cambiar en GitHub los títulos de #13, #14 y #15 para eliminar la promesa de una versión específica.
* [x] Handoff externo: actualizar en #14 el baseline final de `CHANGELOG.md` y `migration-next.md`.
* [ ] Crear una issue paraguas para server image rendering.
* [ ] Enlazar en esa issue los ocho pasos del plan de servidor.
* [x] Mantener el roadmap de mantenibilidad sin issues obligatorias.
* [x] Registrar `#18` y `#19` como backlog no bloqueante.
* [x] Confirmar que el orden global de este README coincide con los planes hijos.

## 1. Cierre de Future

El bloque versionless está completado. Sus documentos detallados se retiraron
del checkout; el detalle histórico se conserva en la historia de Git y en las
issues cerradas correspondientes.

Orden obligatorio:

```text
#12 → #17 → #13 → #14 → #15
```

`#17` forma parte de este bloque porque corrige un bug del contrato persistido
que debe resolverse antes de considerar finalizada la integración de Studio.

### 1.1 Issue #12: Generated Template Registry

Issue cerrada:
[#12](https://github.com/MauricioDMO/FrameKit/issues/12).

* [x] Implementar el registry canónico.
* [x] Incluir metadata, dimensiones, variantes, assets y loaders lazy.
* [x] Verificar regeneración automática en desarrollo y build.
* [x] Completar tests, documentación, changelog, migraciones y starter.
* [x] Registrar los checks locales de cierre.
* [x] Revisar que el cuerpo de `#12` coincida con el contrato final.
* [x] Marcar los acceptance criteria reales en GitHub.
* [x] Publicar un comentario con commits y verificaciones.
* [x] Confirmar que no existen regresiones posteriores relevantes.
* [x] Cerrar `#12` en GitHub.
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
* [x] Publicar evidencia, sincronizar la issue y cerrar `#17`.

### 1.3 Issue #13: Studio Canonical Contract

Issue cerrada:
[#13](https://github.com/MauricioDMO/FrameKit/issues/13).

* [x] Consumir el registry canónico directamente en Studio.
* [x] Integrar metadata, variantes y datos tipados.
* [x] Integrar persistencia `v2`, controles nativos y validación.
* [x] Completar tests, documentación, skills, changelog y migraciones.
* [x] Registrar los checks locales de cierre.
* [x] Resolver `#17` localmente antes del cierre.
* [x] Actualizar el cuerpo para coincidir con la decisión histórica de `#9` y
  retirar sus requisitos rechazados.
* [x] Corregir el enlace al plan.
* [x] Marcar los acceptance criteria reales en GitHub.
* [x] Publicar un comentario con commits y verificaciones.
* [x] Cerrar `#13` en GitHub.
* [x] Registrar `#13` como verificada localmente en este tracker.

### 1.4 Issue #14: Documentation and Migration

Issue cerrada:
[#14](https://github.com/MauricioDMO/FrameKit/issues/14).

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
* [x] Verificar links y anchors internos en 111 archivos Markdown, incluido el
  registro de cierre en GitHub.
* [x] Verificar generación, check, typecheck y build del starter.
* [x] Ejecutar runtime check, lint, tests, typecheck y build del repositorio.
* [x] Publicar evidencia en `#14`.
* [x] Cerrar `#14`.
* [x] Registrar `#14` como verificada localmente en este tracker.

### 1.5 Issue #15: Testing and Release Gates

Issue cerrada:
[#15](https://github.com/MauricioDMO/FrameKit/issues/15).

* [x] Auditar la matriz existente sin duplicar tests enfocados.
* [x] Identificar únicamente gaps cross-layer.
* [x] Mantener Linux CI en Node `22.13.0` y `24`.
* [x] Fortalecer Windows para construir ambos paquetes públicos.
* [x] Ejecutar la lane de Windows en CI y registrar el resultado: el run
  [33948285021](https://github.com/MauricioDMO/FrameKit/actions/runs/33948285021)
  pasó discovery/codegen, creator, typecheck, consumer generado, `generate`,
  `check` e inspección de ambos paquetes; el run 33687196859 queda superseded.
* [x] Repetir la lane de Windows hasta completar correctamente el consumer con
  `generate` y `check`.
* [x] Añadir un único E2E crítico con Chromium.
* [x] Cubrir metadata, variante y campos text/number/choice/boolean/color.
* [x] Cubrir draft numérico inválido y preview confirmado.
* [x] Exportar PNG y comprobar dimensiones sin dependencia adicional.
* [x] Implementar o documentar un único smoke reproducible de tarballs.
* [x] Instalar ambos tarballs fuera del workspace.
* [x] Ejecutar create, generate, check, build, start y HTTP readiness.
* [x] Rechazar workspace references y rutas locales en los paquetes.
* [x] Documentar el smoke post-publicación parametrizado con especificaciones
  exactas del release.
* [x] Separar pre-publicación, post-publicación y promoción de dist-tag.
* [x] Actualizar documentación EN/ES de testing y distribución.
* [x] Actualizar skills canónicas de release.
* [x] Añadir changelog y nota explícita de no migración.
* [x] Completar todas las lanes versionless requeridas; el smoke post-publication
  queda documentado como handoff de release y requiere specs publicadas.
* [x] Publicar evidencia en `#15`.
* [x] Cerrar `#15`.
* [x] Marcar el bloque Future como completado para la implementación versionless.

### 1.6 Gate de Future

Los gates de implementación versionless de Future están cumplidos. El bloque
posterior de Maintainability y su secuencia hacia Server Image Rendering quedan
regidos por el orden global de este tracker. Los dos puntos externos restantes
se mantienen explícitos: protección de `main` es gobierno del repositorio y el
smoke npm es un handoff posterior a publicar una versión.

* [x] `#12` está cerrada.
* [x] `#17` está cerrada.
* [x] `#13` está cerrada.
* [x] `#14` está cerrada.
* [x] `#15` está cerrada.
* [x] El cierre local de Future coincide con GitHub.
* [x] Documentación local, changelog, migration guides y skills están
  sincronizados.
* [x] Los cuerpos de las issues reflejan el contrato final y sus cierres están
  sincronizados en GitHub.
* [ ] `main` está protegido con los checks requeridos (seguimiento independiente
  de gobierno del repositorio).
* [x] Los gates definidos por `#15` pasan sobre el baseline final de Future.
* [ ] El smoke npm post-publication pasa antes de promover el dist-tag (handoff
  posterior a seleccionar y publicar una versión).

## 2. Maintainability: fases 1 a 5

Las primeras cinco fases se ejecutan consecutivamente antes del servidor.

```text
1 → 2 → 3 → 4 → 5
```

La fase 6 no se incluye todavía porque debe establecer las fronteras
arquitectónicas después de que exista la superficie definitiva `./server`.

### 2.1 Fase 1: ESLint Standard y checks de pre-commit

Plan:
[01-repository-formatting-and-checks.md](./maintainability-roadmap/01-repository-formatting-and-checks.md).

Estado de implementación: completada en `7dddcbe` y `bec66a7`; permanece
abierta hasta que el exit gate completo pase.

* [ ] Validar el baseline contra el checkout actual.
* [ ] Definir la configuración compartida de ESLint con las reglas de Standard.
* [ ] Mantener ESLint 9, Next, TypeScript y Tailwind sin degradar sus versiones.
* [ ] No añadir Prettier, `lint-staged`, scripts de formato ni un lint separado
  para el template generado.
* [ ] Hacer que Husky ejecute `pnpm lint` completo antes de cada commit.
* [ ] Preservar `pnpm sync:skills` y staging explícito en Husky.
* [ ] Mantener `pnpm lint` como gate completo de CI.
* [ ] Actualizar instrucciones y documentación EN/ES.
* [ ] Separar tooling/configuración de la aplicación mecánica de ESLint `--fix`.
* [ ] Confirmar que no hay cambios lógicos ni generated output.
* [ ] Ejecutar el hard exit gate completo.
* [ ] Marcar la fase 1 como completada.

### 2.2 Fase 2: Definition Validation Split

Plan:
[02-definition-validation-split.md](./maintainability-roadmap/02-definition-validation-split.md).

Estado de implementación: completada en `3f97724`; permanece abierta hasta que
el exit gate completo pase.

La verificación enfocada, lint, typecheck, builds y empaquetado pasan. El gate
compartido queda pendiente porque `pnpm test` agota el timeout de 5 segundos en
dos tests existentes de FrameKit durante la ejecución recursiva.

* [ ] Confirmar los casos y el orden de errores del validator actual.
* [ ] Extraer utilidades comunes una sola vez.
* [ ] Separar metadata, dimensiones, fields, variants y composición.
* [ ] Mantener `definition/index.ts` como facade pública de secuenciación.
* [ ] Preservar mensajes, primer error, narrowing y orden de inserción.
* [ ] Mantener sin cambios exports públicos y tipos.
* [ ] Redistribuir tests sin duplicar la matriz.
* [ ] Verificar `defineTemplate`, Studio, CLI y codegen.
* [ ] Ejecutar checks enfocados y completos.
* [ ] Marcar la fase 2 como completada.

### 2.3 Fase 3: Editor Orchestration

Plan:
[03-editor-orchestration.md](./maintainability-roadmap/03-editor-orchestration.md).

Estado de implementación: completada en `8680ccd`; permanece abierta hasta que
el exit gate completo pase.

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

Estado de implementación: completada en el checkout desde `0e5c4c5`.

La verificación enfocada de Studio, lint, tests, typecheck, builds y consumer
aislado pasa.

* [x] Confirmar el contrato público actual de `FrameKitStudio`.
* [x] Extraer `useStudioResource`.
* [x] Preservar cancelación de promises obsoletas.
* [x] Extraer estados loading, empty, not-found y error.
* [x] Extraer settings y preservar ownership de theme/locale.
* [x] Extraer el shell/sidebar sin cambiar rutas.
* [x] Mantener route detection y composición en la facade.
* [x] Preservar validación y comprobación de dimensiones.
* [x] Preservar exports `./studio` y `./studio/root`.
* [x] Cubrir races, errores, settings, accessibility y contenido ready.
* [x] Verificar Studio y consumer generado aislado.
* [x] Ejecutar checks completos.
* [x] Marcar la fase 4 como completada.

### 2.5 Fase 5: Published Design Tokens

Plan:
[05-design-tokens.md](./maintainability-roadmap/05-design-tokens.md).

* [x] Revalidar el plan contra el código posterior a la fase 4.
* [x] Mantener `styles.css` como único export de estilos.
* [x] Publicar una paleta numérica compacta de colores Tailwind.
* [x] Evitar aliases y clases de color específicos por componente.
* [x] Migrar chrome del Editor y Studio sin tocar artwork de templates.
* [x] Mantener el render wrapper sin estilos de chrome del producto.
* [x] Añadir el contract test de estilos.
* [x] Clasificar los colores raw restantes.
* [x] Actualizar documentación pública EN/ES.
* [x] Verificar light/dark, desktop/mobile y consumer aislado.
* [x] Ejecutar tarball smoke.
* [x] Pasar el exit gate de la fase 5.
* [x] Marcar la fase 5 como completada.

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

Los pasos 1 a 7 del plan de servidor se ejecutan después de Maintainability 1 a
5. Su Paso 8 se cierra solamente después del nuevo plan transversal.

```text
1 → 2 → 3 → 4 → 5 → 6 → 7
                            ↓
            Studio Access & API Rendering 1 → 8
                            ↓
              Step 8 revalidation and closure
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

Estado de implementación: completado en el checkout actual. La entrada
`./server` exporta los contratos, errores, parser de configuración, helper de
autenticación y preparación de imágenes de los pasos implementados; los pasos 3
a 8 siguen pendientes.

* [x] Añadir la entrada server-only.
* [x] Definir tipos públicos de request, config y error.
* [x] Definir un payload interno serializable.
* [x] Implementar un parser puro de configuración.
* [x] Implementar autenticación Bearer de tiempo constante.
* [x] Rechazar configuración insegura; el parser falla cerrado en cualquier
  entorno.
* [x] Mantener secretos fuera de errores y logs.
* [x] Verificar que client/editor/studio no incluyan dependencias server.
* [x] Añadir tests y type fixture.
* [x] Pasar el exit gate del paso 1.

### 3.3 Paso 2: Shared Canvas and Image Inputs

Plan:
[02-shared-canvas-and-image-inputs.md](./server-image-rendering-api/02-shared-canvas-and-image-inputs.md).

Estado de implementación: completado y verificado el 2026-09-07. Los checks
disponibles del paquete `@mauriciodmo/framekit` pasan: 56 archivos de tests y
601 tests, `typecheck` y `build`.

* [x] Extraer `TemplateCanvas` desde el render wrapper existente.
* [x] Exportarlo mediante `./editor`.
* [x] Migrar `FrameKitEditor` al canvas compartido sin cambiar export/copy.
* [x] Mantener `TemplateCanvas` libre de preview scaling, shell, theme y chrome.
* [x] Centralizar validación de firmas raster.
* [x] Mantener upload de desarrollo sin regresiones.
* [x] Validar data URLs PNG/JPEG/WebP/GIF.
* [x] Validar URLs HTTPS con hostname exacto.
* [x] Descargar imágenes remotas mediante Node.js antes del browser.
* [x] Convertir imágenes remotas válidas a data URLs canónicas.
* [x] Validar únicamente namespaces root-relative permitidos.
* [x] Rechazar SVG, traversal, credenciales, puertos y redirects inseguros.
* [x] Clonar manifests sin escribir archivos del proyecto.
* [x] Preservar precedencia defaults, variant, edits y assets.
* [x] Pasar el exit gate del paso 2, incluido el typecheck de un consumidor del
  export público `@mauriciodmo/framekit/editor` para `TemplateCanvas`.

### 3.4 Paso 3: Temporary Render Jobs

Plan:
[03-temporary-render-jobs.md](./server-image-rendering-api/03-temporary-render-jobs.md).

* [x] Implementar el store mediante `globalThis + Symbol.for(...)`.
* [x] Mantener los jobs en un `Map<string, RenderJobRecord>`.
* [x] Generar ID y token criptográficos independientes.
* [x] Mantener ID y token con al menos 128 bits de entropía.
* [x] Implementar `createRenderJob`.
* [x] Implementar `loadRenderRequest`.
* [x] Implementar `deleteRenderJob`.
* [x] Mantener el `Map` privado detrás de los helpers.
* [x] Aplicar TTL de dos minutos.
* [x] Eliminar jobs expirados oportunísticamente al crear nuevos jobs.
* [x] No extender TTL cuando la página privada lea un job.
* [x] Hacer indistinguibles missing, expired y unauthorized en la frontera
  privada.
* [x] Comparar tokens en tiempo constante.
* [x] Mantener load no destructivo.
* [x] Hacer delete idempotente.
* [x] Añadir retry acotado ante una colisión de ID.
* [x] Cubrir creación, lectura, expiración, token inválido y cleanup.
* [x] Verificar que bundles separados comparten el mismo store de proceso.
* [x] Confirmar que no existe filesystem, Redis, database, queue ni object
  storage para los jobs de v1.
* [x] Pasar el exit gate del paso 3.

### 3.5 Paso 4: Browser Lifecycle and Capture

Plan:
[04-browser-lifecycle-and-capture.md](./server-image-rendering-api/04-browser-lifecycle-and-capture.md).

* [x] Implementar un singleton global de Chromium.
* [x] Crear un contexto y página aislados por request.
* [x] Reservar capacidad atómicamente sin queue ilimitada.
* [x] Limitar navegación al origen loopback configurado.
* [x] Bloquear redirects, popups, downloads y hosts no permitidos.
* [x] Inyectar el token únicamente en la request privada exacta.
* [x] Esperar marker, fonts e imágenes.
* [x] Capturar solamente `[data-framekit-render-root]`.
* [x] Verificar firma PNG.
* [x] Propagar timeout y abort.
* [x] Cerrar contexto, liberar capacidad y eliminar job en `finally`.
* [x] Implementar idle close y shutdown idempotente.
* [x] Pasar el exit gate del paso 4.

### 3.6 Paso 5: Private Next.js Render Route

Plan:
[05-private-next-render-route.md](./server-image-rendering-api/05-private-next-render-route.md).

* [x] Añadir la ruta privada en el template canónico.
* [x] Añadir la ruta privada en Studio.
* [x] Autenticar con ID y token interno.
* [x] Mantener el token fuera de URL, props y DOM.
* [x] Cargar el payload ya resuelto mediante `loadRenderRequest`.
* [x] Cargar el registry generado y la definición exacta.
* [x] Revalidar dimensiones y variante contra la definición.
* [x] Renderizar un único `TemplateCanvas`.
* [x] No ejecutar nuevamente el pipeline canónico de resolución.
* [x] Exponer markers loading, ready y error sin datos privados.
* [x] Desactivar cache y static generation.
* [x] Añadir instrumentation Node-only para shutdown cuando corresponda.
* [x] Ejecutar un production build/start smoke que confirme que la API y la
  página privada comparten el mismo store `globalThis`.
* [x] Pasar el exit gate del paso 5.

### 3.7 Paso 6: Public Image API Route

Plan:
[06-public-image-api-route.md](./server-image-rendering-api/06-public-image-api-route.md).

* [x] Añadir `POST /api/v1/images` en el template.
* [x] Añadir el mismo adapter delgado en Studio.
* [x] Cargar configuración antes del body.
* [x] Autenticar antes de revelar template o errores específicos.
* [x] Leer el body con límite incremental de 12 MB.
* [x] Validar content type, UTF-8 y forma JSON exacta.
* [x] Rechazar propiedades y field keys desconocidos.
* [x] Cargar template y variante mediante el registry.
* [x] Preparar imágenes remotas antes de reservar capacidad del browser.
* [x] Resolver template data una sola vez.
* [x] Validar template data una sola vez.
* [x] Crear el payload final ya resuelto.
* [x] Propagar cancelación al renderer.
* [x] Retornar bytes PNG directamente.
* [x] Retornar headers seguros y `Cache-Control: no-store`.
* [x] Mapear errores mediante códigos, no parsing de mensajes.
* [x] Evitar logs sensibles.
* [x] Pasar el exit gate del paso 6.

### 3.8 Paso 7: Packaging and Docker

Plan:
[07-packaging-and-docker.md](./server-image-rendering-api/07-packaging-and-docker.md).

* [x] Finalizar el export público `./server`.
* [x] Añadir la entrada correspondiente en el build.
* [x] Alinear una sola versión compatible de `playwright-core`.
* [x] Evitar descarga de browsers durante instalación normal.
* [x] Añadir integración al template generado.
* [x] Añadir `Dockerfile` y `.dockerignore`.
* [x] Instalar solamente el Chromium requerido por producción.
* [x] Ejecutar con usuario no-root y `tini`.
* [x] Mantener secretos fuera de layers.
* [x] Verificar copy de archivos ocultos del creator.
* [x] Inspeccionar ambos tarballs.
* [x] Construir y ejecutar la imagen limpia.
* [x] Pasar el exit gate del paso 7.

### 3.9 Paso 8: Verification and Rollout

Plan:
[08-verification-and-rollout.md](./server-image-rendering-api/08-verification-and-rollout.md).

La evidencia marcada a continuación corresponde al baseline anterior al nuevo
plan transversal. Debe conservarse como registro, pero los puntos afectados por
SQLite, sesiones, API tokens, export server-side y volumen persistente deben
repetirse antes del cierre.

* [x] Ejecutar todos los tests enfocados de los pasos 1 a 7.
* [x] Ejecutar los checks completos del repositorio.
* [x] Ejecutar smoke real con Docker y Chromium.
* [x] Verificar render con defaults y assets existentes.
* [x] Verificar imágenes base64 válidas.
* [x] Verificar un host HTTPS permitido.
* [x] Verificar unauthorized, malformed y blocked host.
* [x] Verificar capacity exhausted y timeout.
* [x] Verificar firma PNG y dimensiones esperadas.
* [x] Verificar ausencia de jobs y contexts filtrados.
* [x] Verificar SIGTERM y shutdown limpio.
* [x] Ejecutar smoke con tarballs fuera del workspace.
* [x] Reutilizar el harness creado por `#15`.
* [x] Actualizar documentación EN/ES.
* [x] Actualizar README, changelog y `migration-next.md`.
* [x] Registrar una nota aditiva de no migración.
* [ ] Completar las ocho fases de Studio Access & API Rendering.
* [ ] Revalidar Step 8 contra sesiones, API tokens y export server-side.
* [ ] Revalidar Docker con volumen SQLite persistente y restart.
* [ ] Sustituir la nota puramente aditiva por la migración real de Studio.
* [ ] Publicar evidencia en la issue paraguas.
* [ ] Cerrar la issue de server rendering.
* [ ] Marcar el plan de servidor como completado.

### 3.10 Gate del servidor

No iniciar Maintainability 6 hasta confirmar:

* [ ] Los ocho pasos aprobaron sus exit gates.
* [ ] Studio Access & API Rendering aprobó sus ocho fases.
* [ ] El export público `./server` está definido y empaquetado.
* [ ] `TemplateCanvas` forma parte intencional de `./editor`.
* [ ] Las rutas públicas y privadas utilizan únicamente exports soportados.
* [ ] Los jobs temporales usan exclusivamente memoria de proceso.
* [ ] Chromium no tiene acceso arbitrario a imágenes remotas.
* [ ] El consumer generado funciona fuera del workspace.
* [ ] El consumer generado usa la forma final de siete archivos mantenidos.
* [ ] SQLite persiste acceso mientras los render jobs permanecen en memoria.
* [x] Docker genera correctamente un PNG mediante Chromium.
* [ ] La issue paraguas está cerrada.
* [ ] La documentación pública describe correctamente el contrato final.

## 4. Studio Access & API Rendering

Plan:
[Studio Access, API Tokens, and Server-backed Export](./studio-access-and-api-rendering/README.md).

Este bloque se ejecuta después de Server Image Rendering 1 a 7 y antes de su
Paso 8 final. Sus fases son obligatoriamente secuenciales:

```text
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
```

* [x] Fase 1: SQLite and Migrations.
* [x] Fase 2: Users, Passwords, and Bootstrap.
* [x] Fase 3: Sessions, HTTP, and Route Protection.
* [x] Fase 4: API Tokens, Users, and Authorization (implementada y verificada el 2026-09-15).
* [x] Fase 5: Studio Access UI (implementada y verificada el 2026-09-15).
* [ ] Fase 6: Authenticated Image API and Export.
* [ ] Fase 7: Generated Consumer and Docker.
* [ ] Fase 8: Verification, Documentation, and Rollout.
* [ ] Reabrir el gate final de Server Image Rendering Step 8 sobre el nuevo
  baseline.

Las fases 4 y 5 están implementadas y verificadas el 2026-09-15. La fase 5
incluye la UI de login y Ajustes, el modelo de tres secciones, el handoff
seguro de `StudioUser`, los flujos de tokens y usuarios administradores, y
cobertura de accesibilidad e i18n. Pasan los checks enfocados de Studio (11
archivos, 73 tests), la suite completa del paquete FrameKit (75 archivos, 810
tests), el typecheck y el lint. El smoke HTTP de producción cubrió la redirección
protegida y el login local predeterminado; no se ejecutó smoke visual o responsive
en navegador. Las fases 6 a
8 siguen pendientes; la API de imagen autenticada y la exportación server-side
de la fase 6 aún no están implementadas. El gate final del Step 8 permanece
bloqueado hasta completar este bloque.

## 5. Maintainability: fase 6

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
* `src/server/access/**` y `node:sqlite`;
* los boundaries server-only de `./studio/root`;
* las rutas de acceso y el handler de imagen autenticado;
* la forma final de siete archivos mantenidos del consumer;
* SQLite persistente separado de los render jobs en memoria.

No implementes las reglas de la fase 6 usando el mapa anterior de seis exports.

### 5.1 Fase 6: Architectural Import Boundaries

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

### 5.2 Gate de arquitectura final

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

## 6. Backlog no bloqueante

Estas issues no forman parte del completion gate de los cuatro planes principales.

Pueden repriorizarse una vez estabilizada la arquitectura final, pero no deben
intercalarse en Future, Maintainability ni Server salvo que se conviertan
explícitamente en trabajo bloqueante mediante una nueva decisión registrada.

### 6.1 Issue #18: Template Quick Switcher

* [ ] Repriorizar después de estabilizar `FrameKitStudio`.
* [ ] Implementar sin crear un command framework.
* [ ] Mantener búsqueda sobre metadata del registry sin cargar templates.
* [ ] Verificar teclado, foco, traducciones y navegación.
* [ ] Cerrar `#18` cuando su acceptance gate pase.

### 6.2 Issue #19: Recent Templates

* [ ] Repriorizar después de estabilizar el resource lifecycle de Studio.
* [ ] Implementar de forma independiente de `#18`.
* [ ] Persistir únicamente slugs válidos y versionados.
* [ ] Verificar orden, deduplicación, límite y datos obsoletos.
* [ ] Cerrar `#19` cuando su acceptance gate pase.

## Gate maestro

El plan raíz está completo cuando todas estas condiciones se cumplen:

### Future

* [x] `#12`, `#13`, `#14`, `#15` y `#17` están cerradas.
* [x] El bloque Future está completado y sincronizado con GitHub.

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

### Studio Access and API Rendering

* [ ] Las ocho fases aprobaron sus exit gates.
* [ ] Studio exige una sesión activa sin proteger la ruta privada con esa sesión.
* [ ] Usuarios, sesiones y API tokens se almacenan bajo el contrato SQLite final.
* [ ] Download PNG y Copy PNG usan exclusivamente el renderer server-side.
* [ ] El handler clásico conserva compatibilidad con `FRAMEKIT_API_KEY`.
* [ ] El starter final contiene siete archivos mantenidos bajo `src/app`.
* [ ] Docker preserva SQLite entre containers y limpia jobs al reiniciar proceso.

### Repository gates

Los resultados marcados corresponden al baseline anterior a Studio Access & API
Rendering. Sus comandos afectados deben repetirse antes del cierre maestro.

* [x] `pnpm check:runtime` pasa.
* [x] `pnpm lint` pasa.
* [x] `pnpm test` pasa; la ejecución del 2026-09-13 completó 736 tests.
* [x] `pnpm typecheck` pasa.
* [x] `pnpm build` pasa.
* [x] Ambos paquetes públicos pasan inspección y tarball smoke.
* [x] El consumer aislado pasa generate, check, build, start y HTTP readiness.
* [x] Docker produce un PNG real mediante Chromium como usuario no-root.
* [x] No quedan jobs, contexts, secretos ni generated outputs comprometidos.
* [x] README, documentación EN/ES, changelog, `migration-next.md` y skills
  coinciden con el comportamiento verificado localmente.
* [x] La versión de release continúa siendo una decisión separada.

## Registro de decisiones

| Fecha      | Decisión                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-31 | Usar un único tracker raíz y mantener los contratos detallados en los planes hijos                                                 |
| 2026-08-31 | Resolver `#17` dentro de Future y antes de cerrar la integración de Studio `#13`                                                   |
| 2026-08-31 | Completar el bloque Future antes de iniciar Maintainability                                                                        |
| 2026-08-31 | Ejecutar Maintainability fases 1 a 5 antes de implementar Server Image Rendering                                                   |
| 2026-08-31 | Extraer `TemplateCanvas` durante Server Step 2, después de simplificar `FrameKitEditor` en Maintainability 3                       |
| 2026-08-31 | Ejecutar Maintainability fase 6 después del servidor para definir una sola vez los límites de la arquitectura final con `./server` |
| 2026-08-31 | Usar `globalThis + Map` como almacenamiento temporal de render jobs para v1                                                        |
| 2026-08-31 | Limitar v1 a un proceso Node de larga duración por contenedor                                                                      |
| 2026-08-31 | Mantener `#18` y `#19` como backlog no bloqueante                                                                                  |
| 2026-08-31 | Usar una issue paraguas para server rendering; crear subissues solo si aparece trabajo paralelo real                               |
| 2026-09-13 | Insertar Studio Access & API Rendering entre Server Steps 1-7 y la reverificación/cierre final de Step 8                           |
| 2026-09-13 | Persistir usuarios, sesiones y API tokens en SQLite sin cambiar el store temporal `globalThis + Map` de los render jobs             |
| 2026-09-15 | Completar y verificar la fase 4 de Studio Access; mantener las fases 5-8 pendientes y el Step 8 bloqueado                         |
| 2026-09-15 | Completar y verificar la fase 5 de Studio Access UI; mantener las fases 6-8 pendientes y el Step 8 bloqueado                     |
