# Fase 6 - Referencia, migraciones y troubleshooting

- **Estado:** Pendiente.
- **Depende de:** Fases 0-5.
- **Resultado:** Toda la superficie pública tiene una referencia localizable y
  los problemas frecuentes tienen diagnóstico vigente.

## Objetivo

Completar la documentación para consulta rápida sin convertir la referencia en
una copia de los tipos TypeScript. Consolidar comandos relacionados y separar
troubleshooting por dominio.

Todo contenido y ejemplo debe basarse exclusivamente en manifests,
implementación, tests y el template canónico actuales; se omite cualquier
afirmación que no pueda verificarse allí.

## Fuentes de verdad

```text
packages/framekit/package.json
packages/framekit/src/index.ts
packages/framekit/src/client/index.ts
packages/framekit/src/editor.ts
packages/framekit/src/next.ts
packages/framekit/src/studio.ts
packages/framekit/src/studio-root.ts
packages/framekit/src/dev.ts
packages/framekit/src/server.ts
packages/framekit/src/tooling/cli/index.ts
packages/create-framekit/src/cli.ts
Docs/en/reference/**
Docs/en/development/troubleshooting.md
Docs/en/getting-started/migration-*.md
```

## Referencia de package exports

```text
en/users/reference/package-api/index.md
en/users/reference/package-api/core.md
en/users/reference/package-api/client.md
en/users/reference/package-api/editor.md
en/users/reference/package-api/next.md
en/users/reference/package-api/studio.md
en/users/reference/package-api/studio-root.md
en/users/reference/package-api/dev.md
en/users/reference/package-api/server.md
en/users/reference/package-api/styles.md
```

Cada página debe indicar:

- import soportado;
- entorno esperado: shared, client, server o tooling;
- exports principales y responsabilidad;
- ejemplo mínimo real;
- restricciones de bundle o runtime;
- enlaces a guía y referencia detallada relacionada.

`./dev` se documenta como superficie avanzada de tooling, no como requisito para
la mayoría de consumidores. `./server` y `./studio/root` deben marcar claramente
sus límites server-only.

## Referencia CLI

```text
en/users/reference/cli/index.md
en/users/reference/cli/framekit.md
en/users/reference/cli/create-framekit.md
```

La referencia `framekit` cubre `generate`, `check`, `dev`, `build`, `start` y
`browser install [--with-deps]`, incluido qué comandos generan archivos y cuáles
requieren un build previo. La referencia del creator cubre creación interactiva,
`-y`, `-n`, package manager, instalación, git y `update-skills`.

## Referencias adicionales

```text
en/users/reference/configuration.md
en/users/reference/generated-files.md
en/users/reference/styles-and-theming.md
```

Estas páginas consolidan variables, aliases, directorios ignorados, registry,
render client, assets copiados, design tokens y el único export CSS soportado.

## Migraciones

```text
en/users/migrations/index.md
en/users/migrations/v0.8.md
en/users/migrations/next.md
```

- Mantener `v0.8` como registro histórico claramente etiquetado.
- Reescribir `next` como lista de cambios y acciones, no como diario por fases.
- Mover historia de implementación a Git, changelog y Plans.
- Cubrir contrato canónico, fields, variants, registry, persistencia `v2`, acceso
  SQLite, tokens y export server-side.
- No prometer versión hasta que el proceso de release la seleccione.

## Troubleshooting

```text
en/users/troubleshooting/index.md
en/users/troubleshooting/installation.md
en/users/troubleshooting/templates-and-assets.md
en/users/troubleshooting/generated-registry.md
en/users/troubleshooting/studio.md
en/users/troubleshooting/access.md
en/users/troubleshooting/rendering.md
en/users/troubleshooting/deployment.md
```

Cada diagnóstico incluye síntoma, causa probable, comprobación y solución. No se
copian internals que el usuario no puede accionar.

## Fuera de alcance

- Generar documentación API automáticamente.
- Crear una página por cada función exportada.
- Mantener compatibilidad fuera del contrato público actual.

## Verificación

- Cruzar package exports con el índice de referencia.
- Cruzar `--help`/usage real con páginas CLI.
- Comparar el contenido nuevo con los contratos publicados en las fuentes
  actuales.
- Probar comandos y soluciones contra un consumer generado limpio.

## Exit gate

- [ ] Todos los entrypoints publicados están cubiertos.
- [ ] Todos los comandos actuales están cubiertos una sola vez.
- [ ] Migraciones separan acciones vigentes de historia.
- [ ] Troubleshooting no mezcla problemas de usuarios y contribuidores.
- [ ] Las referencias cubren únicamente APIs, storage keys y comandos actuales.
