# Fase 7 - Onboarding y arquitectura para contribuidores

- **Estado:** Pendiente.
- **Depende de:** Fases 0-6.
- **Resultado:** Una persona que clona el repositorio entiende ownership,
  arquitectura y desarrollo local antes de modificar código.

## Objetivo

Crear una entrada separada de la documentación de consumidores. El contributor
guide debe explicar el monorepo actual y sus límites, no repetir cómo usar
FrameKit desde un proyecto generado.

Todo contenido y ejemplo debe basarse exclusivamente en manifests,
implementación, tests y el template canónico actuales; se omite cualquier
afirmación que no pueda verificarse allí.

Las superficies retiradas o no soportadas no se mencionan en páginas publicadas,
ni siquiera como advertencias o instrucciones de migración.

## Fuentes de verdad

```text
AGENTS.md
apps/docs/AGENTS.md
package.json
pnpm-workspace.yaml
packages/framekit/package.json
packages/create-framekit/package.json
apps/studio/package.json
apps/docs/package.json
Docs/en/development/repository.md
Docs/Plans/maintainability-roadmap/06-architectural-import-boundaries.md
```

## Páginas objetivo

```text
en/contributors/index.md
en/contributors/getting-started/index.md
en/contributors/getting-started/prerequisites.md
en/contributors/getting-started/local-development.md
en/contributors/architecture/index.md
en/contributors/architecture/repository.md
en/contributors/architecture/packages.md
en/contributors/architecture/generated-code.md
en/contributors/architecture/studio-and-editor.md
en/contributors/architecture/server-and-access.md
en/contributors/architecture/tooling-and-codegen.md
en/contributors/development/index.md
en/contributors/development/import-boundaries.md
```

## Onboarding

- Requisitos Node y pnpm exactos.
- `pnpm install --frozen-lockfile` desde la raíz.
- Razón por la que `pnpm dev` se ejecuta desde la raíz y construye FrameKit antes
  de Studio.
- Comandos enfocados por workspace.
- Outputs generados que no deben editarse.
- Diferencia entre Studio first-party, paquete reusable, creator y docs.
- Ubicación canónica de skills y sincronización.

## Mapa del repositorio

El mapa debe incluir cuatro workspaces:

```text
apps/studio
apps/docs
packages/framekit
packages/create-framekit
```

También debe mantener `Docs/Plans` y `Docs/skills` como conocimiento operativo
fuera de los workspaces publicados.

## Arquitectura

- Foundation/core: tipos, fields, resolución y validación.
- Editor: canvas, controls, state, persistence y export UX.
- Studio: shell, navegación, brand, settings e i18n.
- Server: access, SQLite, API handlers, browser y rendering.
- Tooling: discovery, codegen, dev server y CLI.
- Consumers: Studio first-party y template generado sobre exports soportados.

Documentar flujos con Mermaid cuando aporten una relación real:

- template source a registry generado;
- Studio action a API y Chromium;
- sesión/token a autorización;
- package build a consumer generado.

## Límites

- Consumers no importan `packages/framekit/src/**`.
- Foundation no depende de Editor, Studio, Server o Tooling.
- Código client no importa `./server`.
- Node built-ins quedan en Server y Tooling cuando corresponda.
- `TemplateCanvas` cruza el límite público mediante `./editor`.
- Generated code es output, no una segunda implementación mantenida.

## Fuera de alcance

- Rediseñar capas o completar la fase de maintainability desde este plan.
- Duplicar API reference de usuarios.
- Introducir ADRs retroactivos para cada decisión histórica.

## Verificación

- Comparar workspaces y scripts con manifests actuales.
- Comparar diagramas con imports y rutas reales.
- Confirmar todos los ejemplos desde la raíz del repositorio.
- Enlazar a user docs cuando el concepto sea de consumo, sin copiarlo.

## Exit gate

- [ ] El mapa contiene los cuatro workspaces actuales.
- [ ] Ownership y generated outputs están definidos.
- [ ] Las capas incluyen Server y access SQLite.
- [ ] Los imports soportados coinciden con package exports.
- [ ] Un checkout limpio puede llegar a desarrollo local con estas páginas.
