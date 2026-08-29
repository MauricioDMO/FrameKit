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
- Los issues #9, #10 y #11 son decisiones cerradas y no forman parte de la
  ejecución activa.

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
| 9 | [#12 Generated Template Registry](./issue-12-generated-template-registry.md) | Registry generado | Active | [ ] Pendiente |
| 10 | [#13 Studio Canonical Contract Integration](./issue-13-studio-canonical-contract.md) | Integración canónica de Studio | Active | [ ] Pendiente |
| 11 | [#14 Documentation and Migration](./issue-14-documentation-and-migration.md) | Documentación y migración | Active | [ ] Pendiente |
| 12 | [#15 Testing and Release Gates](./issue-15-testing-and-release-gates.md) | Testing y gates de release | Active | [ ] Pendiente |

## Definition of Done por issue

Usa este checklist al cerrar cada issue activo.

- [ ] Implementación de código terminada.
- [ ] Tests enfocados agregados o actualizados.
- [ ] Documentación pública en inglés actualizada.
- [ ] Documentación pública en español actualizada.
- [ ] Entrada agregada en `CHANGELOG.md` bajo `Unreleased`.
- [ ] `Docs/en/getting-started/migration-next.md` actualizado.
- [ ] `Docs/es/getting-started/migration-next.md` actualizado.
- [ ] Nota explícita de no migración incluida cuando el cambio sea aditivo.
- [ ] Starter template y salida generada actualizados.
- [ ] Implementación, plan e issue de GitHub enlazados.
- [ ] Verificaciones del issue ejecutadas y registradas.

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

- [ ] Registry canónico generado y cargadores lazy implementados.
- [ ] Regeneración automática de desarrollo y build verificada.
- [ ] Tests y documentación del issue completados.
- [ ] Definition of Done completada.
- [ ] Issue de GitHub cerrado por los mantenedores.

### #13 Studio Canonical Contract Integration

- [ ] Studio consume registry, metadata, variantes y datos tipados.
- [ ] Validación, persistencia y controles nativos completados.
- [ ] Tests y documentación del issue completados.
- [ ] Definition of Done completada.
- [ ] Issue de GitHub cerrado por los mantenedores.

### #14 Documentation and Migration

- [ ] Auditoría final EN/ES completada.
- [ ] Guías rolling y changelog consolidados.
- [ ] Skills canónicas sincronizadas.
- [ ] Definition of Done completada.
- [ ] Issue de GitHub cerrado por los mantenedores.

### #15 Testing and Release Gates

- [ ] Gaps de cobertura cross-layer cerrados.
- [ ] Gates permanentes de CI definidos.
- [ ] Validación pre-publicación de tarballs definida.
- [ ] Validación post-publicación del registry definida.
- [ ] Definition of Done completada.
- [ ] Issue de GitHub cerrado por los mantenedores.

## Decisiones cerradas

- [#9 Typed Data Pipeline](https://github.com/MauricioDMO/FrameKit/issues/9): cerrado como no
  planificado, sustituido por el trabajo tipado ya completado en #5–#8; no se
  agregará el resolver discriminado ni un estado global de último preview válido.
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
