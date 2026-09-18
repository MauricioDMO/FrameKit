# Fase 3 - Templates, fields y brand

- **Estado:** Completada.
- **Depende de:** Fases 0-2.
- **Resultado:** El modelo actual de autoría, resolución y discovery está
  documentado sin depender de una guía monolítica.

## Objetivo

Dividir la guía actual de template authoring por conceptos y tareas estables.
Mantener las reglas exactas en referencia y usar las guías para flujos completos.

Todo contenido y ejemplo debe basarse exclusivamente en manifests,
implementación, tests y el template canónico actuales; se omite cualquier
afirmación que no pueda verificarse allí.

Las superficies retiradas o no soportadas no se mencionan en páginas publicadas,
ni siquiera como advertencias o instrucciones de migración.

## Fuentes de verdad

```text
packages/framekit/src/types.ts
packages/framekit/src/core/define-template.ts
packages/framekit/src/core/fields/**
packages/framekit/src/core/validation/**
packages/framekit/src/tooling/discovery/**
packages/framekit/src/tooling/codegen/**
packages/framekit/src/markdown/**
apps/studio/src/brand/**
Docs/en/guides/template-authoring.md
Docs/en/guides/brand-components.md
Docs/en/reference/template-contract.md
Docs/en/reference/brand-catalog.md
Docs/en/reference/markdown.md
```

## Páginas objetivo

```text
en/users/concepts/templates/index.md
en/users/concepts/templates/definition.md
en/users/concepts/templates/content-and-variants.md
en/users/concepts/templates/fields.md
en/users/concepts/templates/assets.md
en/users/concepts/templates/generated-registry.md
en/users/concepts/templates/rendering.md
en/users/concepts/brand-components.md
en/users/guides/create-template.md
en/users/guides/split-template-definition.md
en/users/guides/use-image-assets.md
en/users/guides/create-brand-components.md
en/users/reference/template.md
en/users/reference/markdown.md
en/users/reference/brand-catalog.md
```

## Contratos que deben quedar explícitos

- `meta.title` requerido y metadata opcional permitida.
- Dimensiones finitas y render de tamaño fijo.
- Variants como claves arbitrarias con default y labels.
- Precedencia defaults, contenido de variant y edits.
- Fields text, number, boolean, choice, color e image.
- Reglas de number input/slider, choice options y text min/max length.
- Scope common/variant para imágenes.
- `language` como nombre de field permitido sin semántica reservada.
- Assets root-relative y manifest generado.
- Registry con metadata, dimensiones, variants, assets y lazy loaders.
- Regeneración automática en dev/check/build y `start` read-only.
- Separación entre componente de template y definición cuando mejora la lectura.
- Alcance limitado del componente `Markdown` y soporte de listas.
- Contrato de `src/brand`, README, component y preview.

## Decisiones de granularidad

- Mantener inicialmente todos los field kinds en una sola página con anchors.
- No crear una página por field hasta que la referencia deje de ser navegable.
- Mantener brand components separado de templates porque discovery y consumo son
  distintos.

## Fuera de alcance

- API HTTP de rendering.
- Uso operativo de Studio.
- Diseño visual de templates concretos.

## Verificación

- Validar snippets mediante los contratos TypeScript actuales.
- Comparar errores y constraints con validators, no solo con tipos.
- Confirmar discovery y slugs contra sus tests.
- Confirmar que los ejemplos usan el contrato vigente de fields y sus
  restricciones actuales.

Verificado el 2026-09-18:

- Las 15 páginas inglesas objetivo existen bajo `apps/docs/src/content/docs/en/users/`.
- `pnpm --filter docs build` pasó y generó 47 páginas.
- Los snippets y las reglas de fields, variants, assets, registry, Markdown y
  brand fueron revisados contra la implementación, validators y tests actuales.
- Las páginas nuevas no usan imports directos desde `packages/framekit/src/**`.
- La navegación de usuarios conserva `Getting started`, añade conceptos, guías
  y referencia, y no duplica el índice de Templates dentro de su grupo.

## Exit gate

- [x] Los seis field kinds y sus restricciones están cubiertos.
- [x] Variants e idioma de interfaz no se confunden.
- [x] Registry, assets y brand discovery reflejan el código actual.
- [x] Las guías enlazan a referencia sin duplicar contratos completos.
- [x] La antigua guía monolítica tiene destino para todo contenido vigente.
