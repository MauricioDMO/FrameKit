# Fase 3 - Templates, fields y brand

- **Estado:** Pendiente.
- **Depende de:** Fases 0-2.
- **Resultado:** El modelo actual de autoría, resolución y discovery está
  documentado sin depender de una guía monolítica.

## Objetivo

Dividir la guía actual de template authoring por conceptos y tareas estables.
Mantener las reglas exactas en referencia y usar las guías para flujos completos.

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
- Confirmar que ningún ejemplo enseña `fields` plural como factory ni textarea
  como kind independiente.

## Exit gate

- [ ] Los seis field kinds y sus restricciones están cubiertos.
- [ ] Variants e idioma de interfaz no se confunden.
- [ ] Registry, assets y brand discovery reflejan el código actual.
- [ ] Las guías enlazan a referencia sin duplicar contratos completos.
- [ ] La antigua guía monolítica tiene destino para todo contenido vigente.
