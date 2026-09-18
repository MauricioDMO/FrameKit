# Fase 8 - Workflow, testing y releases

- **Estado:** Pendiente.
- **Depende de:** Fases 0-7.
- **Resultado:** Desarrollo, verificación, distribución, release y mantenimiento
  documental tienen procedimientos reproducibles.

## Objetivo

Dividir el contenido operativo existente según responsabilidad. Los comandos
deben describir qué prueban y cuándo ejecutarlos, no conservar snapshots de runs
antiguos como si fueran requisitos permanentes.

Todo contenido y ejemplo debe basarse exclusivamente en manifests,
implementación, tests y el template canónico actuales; se omite cualquier
afirmación que no pueda verificarse allí.

## Fuentes de verdad

```text
package.json
.github/workflows/ci.yml
.husky/**
scripts/check-runtime-contract.mjs
scripts/smoke-tarballs.mjs
scripts/smoke-docker.mjs
playwright.config.ts
packages/*/vitest.config.ts
Docs/en/development/testing-and-distribution.md
Docs/en/development/release.md
Docs/skills/internal/**
```

## Páginas objetivo

```text
en/contributors/development/workflow.md
en/contributors/development/coding-conventions.md
en/contributors/development/adding-features.md
en/contributors/development/adding-entrypoints.md
en/contributors/development/adding-cli-commands.md
en/contributors/development/dependencies.md
en/contributors/testing/index.md
en/contributors/testing/unit-and-integration.md
en/contributors/testing/e2e-and-smoke.md
en/contributors/testing/ci.md
en/contributors/distribution/index.md
en/contributors/distribution/package-exports.md
en/contributors/distribution/generated-consumer.md
en/contributors/releases/index.md
en/contributors/releases/versioning-and-changelog.md
en/contributors/releases/publishing.md
en/contributors/documentation/index.md
en/contributors/documentation/writing-and-structure.md
en/contributors/documentation/translations-and-mermaid.md
```

## Desarrollo

- ESLint Standard vigente: dos espacios, single quotes y sin semicolons.
- Tests bajo el árbol `__tests__` más cercano.
- Alias `@/*` en tests package-local cuando está configurado.
- Cambios de exports alineados entre source entry, package manifest, build y
  contract tests.
- Cambios de CLI con tests de argumentos, uso y consumer real cuando aplica.
- Dependencias nuevas solo cuando la plataforma o una dependencia instalada no
  cubren el caso.
- Regla de no editar outputs generados.

## Testing y CI

- Diferencia entre unit, component, integration, type fixtures, E2E y smoke.
- Comandos enfocados para FrameKit, Studio y creator.
- `pnpm check:runtime`, lint, test, typecheck y build.
- Matriz Linux/Windows y versiones Node soportadas.
- Browser E2E para login, edición y rendering.
- Qué demuestra tarball smoke y qué demuestra Docker smoke.
- Límites que no cubre cada nivel.

## Distribución y release

- Solo FrameKit y create-framekit son paquetes públicos.
- Build order y contenido esperado de tarballs.
- Inspección de workspace references, rutas locales, secretos y browsers.
- Consumer aislado con create/generate/check/build/start.
- Smoke local antes de publicar y smoke npm después de publicar.
- Versionado y changelog separados del trabajo versionless.
- Promoción de dist-tag únicamente después de gates.

## Documentación

- Audiencia primero; tipo de información después.
- Una responsabilidad principal por página.
- Inglés como fuente editorial y español como traducción equivalente.
- Code/tests/manifests por encima de documentación histórica.
- Uso de Mermaid solo para relaciones que el texto no explica mejor.
- Cómo añadir páginas y actualizar sidebar sin romper paridad.
- Skills se editan solo bajo `Docs/skills/` y se sincronizan.

## Fuera de alcance

- Añadir herramientas nuevas de documentación o testing sin un gap demostrado.
- Convertir resultados de CI concretos en contratos permanentes.
- Explicar workflows internos de GitHub que no existan en el repositorio.

## Verificación

- Ejecutar ejemplos de comandos desde la raíz.
- Comparar CI documentado con workflow actual.
- Comparar release guide con scripts de pack/smoke.
- Revisar que documentación no enseñe editar `.agents/skills` directamente.

## Exit gate

- [ ] Cada nivel de test tiene propósito y comando.
- [ ] Distribución distingue pre-publicación y post-publicación.
- [ ] Release no selecciona versión anticipadamente.
- [ ] Convenciones coinciden con AGENTS y configuración actual.
- [ ] La guía documental permite mantener el sitio sin una segunda arquitectura.
