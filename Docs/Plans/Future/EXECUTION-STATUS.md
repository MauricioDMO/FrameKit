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
- Los issues #10 y #11 son decisiones cerradas y no forman parte de la
  ejecución activa.

## Orden de ejecución

| Paso | Issue | Plan | Estado del plan | Avance local |
| ---: | --- | --- | --- | --- |
| 1 | [#1 Canonical Template Contract](./issue-01-canonical-template-contract.md) | Contrato canónico sin versión | Active | [x] Completado |
| 2 | [#2 Runtime Requirements](./issue-02-runtime-requirements.md) | Requisitos de runtime | Completed baseline | [x] Completado |
| 3 | [#3 Template Metadata](./issue-03-template-metadata.md) | Metadata de templates | Active | [x] Completado |
| 4 | [#4 Content Variants](./issue-04-content-variants.md) | Variantes de contenido | Active | [ ] Pendiente |
| 5 | [#5 Semantic Fields](./issue-05-semantic-fields.md) | Campos semánticos | Planned | [ ] Pendiente |
| 6 | [#6 Choice Field](./issue-06-choice-field.md) | Campo de opciones | Planned | [ ] Pendiente |
| 7 | [#7 Boolean Field](./issue-07-boolean-field.md) | Campo booleano | Planned | [ ] Pendiente |
| 8 | [#8 Number Field](./issue-08-number-field.md) | Campo numérico | Planned | [ ] Pendiente |
| 9 | [#9 Typed Data Pipeline](./issue-09-typed-data-pipeline.md) | Pipeline de datos tipados | Planned | [ ] Pendiente |
| 10 | [#12 Generated Template Registry](./issue-12-generated-template-registry.md) | Registry generado | Active | [ ] Pendiente |
| 11 | [#13 Studio Canonical Contract Integration](./issue-13-studio-canonical-contract.md) | Integración canónica de Studio | Active | [ ] Pendiente |
| 12 | [#14 Documentation and Migration](./issue-14-documentation-and-migration.md) | Documentación y migración | Active | [ ] Pendiente |
| 13 | [#15 Testing and Release Gates](./issue-15-testing-and-release-gates.md) | Testing y gates de release | Active | [ ] Pendiente |

## Definition of Done por issue

Usa este checklist al cerrar cada issue activo, incluyendo #1.

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
- [ ] Issue de GitHub cerrado por los mantenedores.

### #3 Template Metadata

- [x] Metadata `meta` implementada y validada.
- [x] Templates actuales actualizados.
- [x] Tests y documentación del issue completados.
- [x] Definition of Done completada.
- [x] Verificaciones del issue ejecutadas y registradas.
- [ ] Issue de GitHub cerrado por los mantenedores.

### #4 Content Variants

- [ ] Contrato de variantes implementado de forma atómica.
- [ ] Templates actuales y Studio actualizados.
- [ ] Tests y documentación del issue completados.
- [ ] Definition of Done completada.
- [ ] Issue de GitHub cerrado por los mantenedores.

### #5–#9 Field Contracts and Typed Data Pipeline

- [ ] #5 Semantic Fields completado.
- [ ] #6 Choice Field completado.
- [ ] #7 Boolean Field completado.
- [ ] #8 Number Field completado.
- [ ] #9 Typed Data Pipeline completado.
- [ ] Definition of Done completada para cada issue.
- [ ] Issues de GitHub cerrados por los mantenedores.

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

- [#10 Legacy Compatibility](./issue-10-legacy-compatibility.md): cerrado como
  no planificado; no habrá capa de compatibilidad runtime.
- [#11 Source Migration Command](./issue-11-source-migration-command.md):
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
