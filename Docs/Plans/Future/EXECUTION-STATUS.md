# Future Plans Execution Status

Este archivo es el checklist operativo para ejecutar los planes de
`Docs/Plans/Future/` paso a paso. El estado oficial de cada issue sigue siendo
el de GitHub; este documento solo registra el avance local de implementación.

## Reglas de uso

- Marca una casilla únicamente cuando el trabajo esté terminado y verificado.
- Cada issue activo debe cumplir la definición de terminado compartida antes
  de considerarse cerrado.
- Mantén el orden de ejecución indicado en `README.md`.
- No selecciones una versión de release mientras los mantenedores no la hayan
  definido.
- Los issues #9, #10, #11 y #16 son decisiones cerradas y no forman parte de la
  ejecución activa.

## Estado externo verificado

- El [run CI 33687196859](https://github.com/MauricioDMO/FrameKit/actions/runs/33687196859)
  ejecutó Windows y falló en `Run discovery and codegen tests`; instalación y
  builds públicos pasaron, y los pasos posteriores fueron omitidos. Las lanes
  Ubuntu `22.13.0`, `24` y Chromium del mismo run pasaron.
- La [evidencia del smoke pre-publicación](./evidence/tarball-smoke-2026-09-04.md)
  registra PASS para un consumidor independiente y otro generado por creator.
- La API de protección de ramas de GitHub respondió `Branch not protected` para
  `main` (HTTP 404); no se puede marcar ese gate como cumplido.
- GitHub mantiene abiertos los issues [#12](https://github.com/MauricioDMO/FrameKit/issues/12),
  [#13](https://github.com/MauricioDMO/FrameKit/issues/13),
  [#14](https://github.com/MauricioDMO/FrameKit/issues/14),
  [#15](https://github.com/MauricioDMO/FrameKit/issues/15) y
  [#17](https://github.com/MauricioDMO/FrameKit/issues/17). El smoke npm
  posterior a publicar no se ha ejecutado.
- Checks locales de este turno: `pnpm test` PASS con FrameKit 235 tests en 25
  archivos, creator 23 en 2 archivos y Studio 2 en 1 archivo; también pasan
  `pnpm check:runtime`, lint, typecheck, build, E2E Chromium y
  `pnpm sync:skills`.

## Orden de ejecución

| Paso | Issue | Plan | Estado del plan | Avance local |
| ---: | --- | --- | --- | --- |
| 1 | [#1 Canonical Template Contract](https://github.com/MauricioDMO/FrameKit/issues/1) | Contrato canónico sin versión | Completed | [x] Completado |
| 2 | [#2 Runtime Requirements](https://github.com/MauricioDMO/FrameKit/issues/2) | Requisitos de runtime | Completed baseline | [x] Completado |
| 3 | [#3 Template Metadata](https://github.com/MauricioDMO/FrameKit/issues/3) | Metadata de templates | Completed | [x] Completado |
| 4 | [#4 Content Variants](https://github.com/MauricioDMO/FrameKit/issues/4) | Variantes de contenido | Completed | [x] Completado |
| 5 | [#5 Semantic Fields](https://github.com/MauricioDMO/FrameKit/issues/5) | Campos semánticos | Completed | [x] Completado |
| 6 | [#6 Choice Field](https://github.com/MauricioDMO/FrameKit/issues/6) | Campo de opciones | Completed | [x] Completado |
| 7 | [#7 Boolean Field](https://github.com/MauricioDMO/FrameKit/issues/7) | Campo booleano | Completed | [x] Completado |
| 8 | [#8 Number Field](https://github.com/MauricioDMO/FrameKit/issues/8) | Campo numérico | Completed | [x] Completado |
| 9 | [#12 Generated Template Registry](./issue-12-generated-template-registry.md) | Registry generado | Active | [x] Verificado localmente; cierre de GitHub pendiente |
| 10 | [#17 Persisted Choice Values](./issue-17-persisted-choice-values.md) | Valores persistidos de opciones | Active | [x] Verificado localmente; cierre de GitHub pendiente |
| 11 | [#13 Studio Canonical Contract Integration](./issue-13-studio-canonical-contract.md) | Integración canónica de Studio | Active | [x] Verificado localmente tras #17; cierre de GitHub pendiente |
| 12 | [#14 Documentation and Migration](./issue-14-documentation-and-migration.md) | Documentación y migración | Active | [x] Verificado localmente; cierre de GitHub pendiente |
| 13 | [#15 Testing and Release Gates](./issue-15-testing-and-release-gates.md) | Testing y gates de release | Active | [x] Verificado localmente; cierre de GitHub pendiente |

## Definition of Done por issue

Usa este checklist al cerrar cada issue activo.

- [x] Implementación de código terminada.
- [x] Tests enfocados agregados o actualizados.
- [x] Documentación pública en inglés actualizada.
- [x] Documentación pública en español actualizada.
- [x] Entrada agregada en `CHANGELOG.md` bajo `Unreleased`.
- [x] `Docs/en/getting-started/migration-next.md` actualizado.
- [x] `Docs/es/getting-started/migration-next.md` actualizado.
- [x] Nota explícita de no migración incluida cuando el cambio sea aditivo.
- [x] Starter template y salida generada actualizados.
- [ ] Implementación, plan e issue de GitHub enlazados.
- [x] Verificaciones del issue ejecutadas y registradas.

## Seguimiento por issue

### #1 Canonical Template Contract

- [x] Contrato canónico implementado.
- [x] Tests y documentación del issue completados.
- [x] Definition of Done completada.
- [x] Verificaciones del issue ejecutadas y registradas.
- [x] Issue de GitHub cerrado por los mantenedores.

### #3 Template Metadata

- [x] Metadata `meta` implementada y validada.
- [x] Templates actuales actualizados.
- [x] Tests y documentación del issue completados.
- [x] Definition of Done completada.
- [x] Verificaciones del issue ejecutadas y registradas.
- [x] Issue de GitHub cerrado por los mantenedores.

### #4 Content Variants

- [x] Contrato de variantes implementado de forma atómica: `variants.default`, labels conocidas, contenido field-only, `getVariants` y errores explícitos para variantes desconocidas.
- [x] Templates actuales y Studio actualizados; estado del editor renombrado a variantes y persistencia cambiada a `framekit:<slug>:v2`.
- [x] Tests y documentación EN/ES del issue completados.
- [x] Definition of Done completada: changelog, migraciones rolling, starter generado y enlaces al plan/issue actualizados.
- [x] Verificaciones ejecutadas: tests de FrameKit (104), tests de Studio (2), tests de scaffolder (19 con timeout operativo de 30 s), typecheck, lint, build, `check:runtime`, `framekit generate` y `framekit check` del starter generado.
- [x] Issue de GitHub cerrado por los mantenedores.

### #5 Semantic Fields

- [x] API pública singular `field` implementada; `fields`, `field.textarea`, `TextareaFieldDescriptor` y el kind `textarea` fueron eliminados sin alias.
- [x] `field.text` usa el editor nativo `<textarea>`, conserva saltos de línea y acepta `minLength`/`maxLength` con validación estructural.
- [x] Validación de datos, errores `text_too_short`/`text_too_long`, controles del editor, mensajes EN/ES y precedencia de imágenes cubiertos por tests.
- [x] Templates de Studio, starter canónico, documentación pública EN/ES, skills sincronizadas, changelog, migraciones rolling y enlaces al plan/issue actualizados.
- [x] Definition of Done completada.
- [x] Verificaciones ejecutadas: tests FrameKit (115), typecheck, lint y build del paquete; tests/typecheck/lint de Studio; tests del scaffolder (19 con `--testTimeout=30000`), typecheck y lint; `pnpm check:runtime`; `framekit generate`; `framekit check`; compilación del starter con `next build --webpack`; y checks raíz `pnpm lint`, `pnpm typecheck` y `pnpm build`. El `pnpm test` raíz conserva el timeout Vitest predeterminado de 5 s del scaffolder; la ejecución focalizada con 30 s pasa. El `framekit build` del starter enlazado localmente falla en el prerender de `_global-error` por una invariant de Turbopack/Next, mientras el build webpack equivalente pasa.
- [x] Issue de GitHub cerrado por los mantenedores.

### #6 Choice Field

- [x] `field.choice` implementado con opciones ordenadas congeladas, `defaultValue` obligatorio y valores literales preservados donde TypeScript puede inferirlos.
- [x] Validación estructural de opciones vacías, labels/values vacíos, duplicados, defaults desconocidos y propiedades `required`/`control` no soportadas.
- [x] Validación de datos con `invalid_choice` sin coerción ni fallback a la primera opción; Studio usa un `<select>` nativo con orden, accesibilidad, errores y estado string.
- [x] Tests de factory, definición, runtime, editor y tipos; starter canónico actualizado y salida generada/composición compilada verificada.
- [x] Documentación pública EN/ES, guías Studio/skills sincronizadas, changelog, migraciones rolling y enlaces al plan/issue actualizados.
- [x] Verificaciones ejecutadas: tests FrameKit (129), typecheck, lint y build del paquete; tests/typecheck/lint de Studio; tests del scaffolder (19 con `pnpm exec vitest run --testTimeout=30000`), typecheck y lint; `pnpm check:runtime`; `framekit generate`; `framekit check`; compilación TypeScript y `next build --webpack` del starter; y checks raíz `pnpm lint`, `pnpm typecheck` y `pnpm build`.
- [x] Issue de GitHub cerrado por los mantenedores.

### #7 Boolean Field

- [x] `field.boolean` implementado con default booleano `false`, sin `required`, `control` ni coerción.
- [x] Valores booleanos preservados en contenido, overrides, resolución, render props, persistencia y callbacks del editor.
- [x] Validación estructural y runtime con `invalid_boolean`; Studio usa un checkbox nativo accesible.
- [x] Tests de factory, defaults, runtime, editor, persistencia y tipos; starter canónico actualizado y generado verificado.
- [x] Documentación pública EN/ES, guías Studio/skills sincronizadas, changelog, migraciones rolling y enlaces al plan/issue actualizados.
- [x] Definition of Done completada.
- [x] Verificaciones ejecutadas: tests raíz (FrameKit 142, Studio 2, scaffolder 19), typecheck, lint y build raíz; `framekit generate`, `framekit check`, typecheck y `next build --webpack` del starter enlazado localmente.
- [x] Issue de GitHub cerrado por los mantenedores.

### #8 Number Field

- [x] `field.number` implementado con `defaultValue` numérico finito obligatorio, límites ordenados, `step` positivo y controles nativos `input`/`slider`.
- [x] Valores numéricos preservados como `number` finito en contenido, overrides, resolución, render props, persistencia y editor.
- [x] Validación estructural y runtime con rechazo de strings numéricos, límites, step y `invalid_step`.
- [x] Studio mantiene drafts numéricos locales sin contaminar preview, datos confirmados ni persistencia; el slider conserva atributos y comportamiento nativo.
- [x] Tests de factory, defaults, definición, runtime, resolución, editor, persistencia, preview y tipos; starter canónico actualizado y smoke test generado verificado.
- [x] Documentación pública EN/ES, guías/skills sincronizadas, changelog, migraciones rolling y enlaces al plan/issue actualizados.
- [x] Definition of Done completada.
- [x] Verificaciones ejecutadas: tests raíz (FrameKit 165, Studio 2, scaffolder 19), typecheck, lint, build, `check:runtime`, `git diff --check`, `framekit generate`, `framekit check`, TypeScript y `framekit build` del starter con el tarball local actual.
- [x] Issue de GitHub cerrado por los mantenedores.

### #12 Generated Template Registry

- [x] Registry canónico generado y cargadores lazy implementados.
- [x] Regeneración automática de desarrollo y build verificada.
- [x] Tests y documentación del issue completados.
- [x] Definition of Done local completada; sincronización del cuerpo y cierre en
  GitHub pendientes.
- [x] Verificaciones reproducibles actuales: `pnpm check:runtime`, `pnpm lint`, `pnpm test` (FrameKit 235 tests en 25 archivos, Studio 2 en 1 archivo, creator 23 en 2 archivos), `pnpm typecheck` y `pnpm build`; generación y check de Studio y del starter.
- [ ] Issue de GitHub cerrado por los mantenedores.

### #17 Persisted Choice Values

- [x] Validar el filtro de pertenencia de valores persistidos contra las opciones declaradas.
- [x] Preservar campos hermanos válidos y fallback a contenido/default.
- [x] Actualizar la prueba del editor que todavía esperaba conservar una opción obsoleta.
- [x] Ejecutar las verificaciones completas sin regresiones: FrameKit 235 tests en 25 archivos, Studio 2 en 1 archivo, creator 23 en 2 archivos, lint, typecheck, build y runtime check.
- [ ] Issue de GitHub cerrado por los mantenedores.

### #13 Studio Canonical Contract Integration

- [x] Studio consume directamente el registry canónico en sus props y navegación, sin el adaptador de manifiesto de plantillas ni fallback de título.
- [x] Validación, persistencia `v2` y controles nativos completados.
- [x] Tests y documentación EN/ES del issue completados.
- [x] Definition of Done local completada: changelog, migraciones rolling, skills sincronizadas y starter actualizados; sincronización del cuerpo y cierre en GitHub pendientes.
- [x] Verificaciones completas sin regresiones: tests FrameKit 235 en 25 archivos, Studio 2 en 1 archivo y scaffolder 23 en 2 archivos; lint, typecheck, build, `check:runtime`, generación/check de Studio y starter, E2E Chromium y smoke manual de pre-publicación con tarballs reales.
- [ ] Issue de GitHub cerrado por los mantenedores.

### #14 Documentation and Migration

- [x] Auditoría final EN/ES completada.
- [x] Guías rolling y changelog consolidados.
- [x] Skills canónicas sincronizadas mediante `pnpm sync:skills`.
- [x] Definition of Done local completada; links y anchors internos verificados localmente.
- [x] Verificaciones reproducibles actuales: `pnpm check:runtime`, `pnpm lint`, `pnpm test`, `pnpm typecheck` y `pnpm build`; la sincronización de skills se ejecutó con `pnpm sync:skills`.
- [x] Verificar links y anchors internos en 111 archivos Markdown, incluida la
  evidencia actual.
- [ ] Issue de GitHub cerrado por los mantenedores.

### #15 Testing and Release Gates

- [x] Gaps de cobertura cross-layer cerrados con un E2E Chromium único y checks de consumidor.
- [x] Gates permanentes de CI definidos para Ubuntu, Windows y Chromium.
- [x] Ejecutar la lane de Windows en CI y registrar el resultado: el [run 33687196859](https://github.com/MauricioDMO/FrameKit/actions/runs/33687196859) falló en `Run discovery and codegen tests` después de instalar y construir los paquetes públicos.
- [ ] Repetir la lane de Windows hasta que pase su consumer generado, incluyendo `generate` y `check`.
- [x] Validación pre-publicación de tarballs definida y ejecutada manualmente con paquetes reales fuera del checkout; resultado registrado en la [evidencia del smoke](./evidence/tarball-smoke-2026-09-04.md).
- [x] Validación post-publicación del registry definida con specs suministradas durante el release.
- [ ] Ejecutar la validación post-publicación del registry; no se ha ejecutado todavía.
- [x] Verificación local reproducible de este turno: `pnpm test` (FrameKit 235 tests en 25 archivos, creator 23 en 2 archivos y Studio 2 en 1 archivo), `pnpm check:runtime`, lint, typecheck, build, E2E Chromium y `pnpm sync:skills` pasan; también pasa el smoke del consumer aislado con generate, check, build, start y HTTP readiness.
- [x] Definition of Done local completada; la ejecución Windows registrada falló y el smoke post-publication permanece pendiente.
- [ ] Issue de GitHub cerrado por los mantenedores.

## Decisiones cerradas

- [#9 Typed Data Pipeline](https://github.com/MauricioDMO/FrameKit/issues/9): cerrado como no
  planificado, sustituido por el trabajo tipado ya completado en #5–#8; no se
  agregará los diseños de resolución o estado de preview rechazados por #9.
- [#10 Legacy Compatibility](https://github.com/MauricioDMO/FrameKit/issues/10): cerrado como
  no planificado; no habrá capa de compatibilidad runtime.
- [#11 Source Migration Command](https://github.com/MauricioDMO/FrameKit/issues/11):
  cerrado como no planificado; la migración será manual.
- [#16 Version-specific release](https://github.com/MauricioDMO/FrameKit/issues/16):
  cerrado como no planificado; la versión se elegirá durante el release.

## Registro

| Fecha | Cambio | Responsable |
| --- | --- | --- |
| 2026-08-24 | Se crea el checklist inicial basado en `README.md`. | — |
| 2026-08-24 | Se completa y verifica localmente el issue #1; el issue de GitHub permanece abierto. | — |
| 2026-08-24 | Se verificó de nuevo el issue #1 con tests, typecheck, build, runtime, `studio check` y `framekit check` sobre un starter generado; también se confirmaron los errores de `meta.title` ausente y metadata no soportada. | — |
| 2026-08-24 | Se completa y verifica localmente el issue #3: metadata exacta, templates, tests, documentación EN/ES, changelog, migraciones y starter generado; el issue de GitHub permanece abierto. | — |
| 2026-08-24 | Se completa y verifica localmente el issue #4: variantes explícitas, validación exacta, editor/persistencia `v2`, tests, documentación EN/ES, changelog, migraciones y starter generado; el issue de GitHub permanece abierto. | — |
| 2026-08-25 | Se completa y verifica localmente el issue #5: API singular `field`, eliminación de `textarea`, texto multilínea con límites, tests, documentación EN/ES, changelog, migraciones, skills sincronizadas y starter generado; el issue de GitHub permanece abierto. | — |
| 2026-08-25 | Se completa y verifica localmente el issue #6: `field.choice`, select nativo, validación `invalid_choice`, tests, documentación EN/ES, changelog, migraciones, skills sincronizadas y starter generado; el issue de GitHub permanece abierto. | — |
| 2026-08-25 | Se completa y verifica localmente el issue #7: `field.boolean`, checkbox nativo, validación `invalid_boolean`, persistencia booleana, tests, documentación EN/ES, changelog, migraciones, skills sincronizadas y starter generado; el issue de GitHub permanece abierto. | — |
| 2026-08-28 | Se sincroniza GitHub con el estado local: #1 y #4–#8 se cierran como completadas; #2–#3 ya estaban completadas y #9–#11 permanecen cerradas como no planificadas. | — |
| 2026-08-29 | Se completa y verifica localmente el issue #12: registry canónico con metadata/dimensiones/variantes/assets y loaders lazy, generación automática, watcher completo de `src/templates` y `src/brand`, tests, documentación EN/ES, changelog, migraciones, outputs generados y enlaces; el issue de GitHub permanece abierto. | — |
| 2026-08-30 | Se completa y verifica localmente el issue #13: integración directa del registry canónico en Studio, metadata, variantes genéricas, controles tipados, navegación accesible, errores localizados, persistencia `v2`, tests, documentación EN/ES, skills sincronizadas y starter generado; el issue de GitHub permanece abierto. | — |
| 2026-09-02 | Se endurecen los límites de #12/#13: Studio y navegación reciben `TemplateRegistryEntry` directamente, se eliminan los tipos adaptadores de plantilla y se actualizan las pruebas de integración; #17 se aborda a continuación antes de cerrar el bloque. | — |
| 2026-09-02 | Se completa y verifica localmente #17: los choices persistidos obsoletos se descartan de forma aislada, sobreviven los siblings válidos y se aplican los fallbacks actuales; se actualiza el test de Studio sin cerrar el issue de GitHub. También se completan localmente los gates documentales de #14 y técnicos de #15, sin seleccionar una versión. | — |
| 2026-09-02 | Se completa la verificación local reproducible: `pnpm check:runtime`, `pnpm lint`, `pnpm test` (FrameKit 233, Studio 2, creator 23), `pnpm typecheck`, `pnpm build`, instalación de Chromium y E2E Chromium (1 test). La lane Windows no forma parte de esta ejecución local y el smoke post-publication queda definido, no ejecutado. | — |
| 2026-09-04 | Se registra la evidencia del smoke pre-publicación con tarballs reales fuera del checkout: consumidor independiente y consumidor generado por creator pasan instalación, generación, check, build, start standalone, readiness HTTP y limpieza. El run CI [33687196859](https://github.com/MauricioDMO/FrameKit/actions/runs/33687196859) ejecuta Windows pero falla en `Run discovery and codegen tests`; Ubuntu y Chromium pasan. La protección de `main`, la sincronización/cierre de issues y el smoke npm post-publication permanecen pendientes. | — |
| 2026-09-04 | Ejecución actual del turno: `pnpm test` pasa con FrameKit 235 tests en 25 archivos (incluidos `color-field.test.tsx` y `number-field.test.tsx`), creator 23 en 2 archivos y Studio 2 en 1 archivo. También pasan `pnpm check:runtime`, lint, typecheck, build, E2E Chromium y `pnpm sync:skills`. El resultado histórico del smoke de las 12:04 permanece registrado por separado con 233 tests. | — |
