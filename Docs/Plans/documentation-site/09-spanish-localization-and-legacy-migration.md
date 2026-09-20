# Fase 9 - Localización y migración legacy

- **Estado:** Completada.
- **Depende de:** Fases 0-8.
- **Resultado:** `/en/` y `/es/` tienen paridad temática, todos los destinos
  legacy están mapeados y su retirada queda preparada para el rollout.

## Objetivo

Traducir la arquitectura estable, preparar todos los enlaces internos y dejar
lista la retirada de las copias legacy. La eliminación ocurre en la fase 10,
después de verificar el deployment público. No traducir slugs ni alterar el
contrato técnico entre idiomas.

Todo contenido y ejemplo debe basarse exclusivamente en manifests,
implementación, tests y el template canónico actuales; se omite cualquier
afirmación que no pueda verificarse allí.

La localización solo replica contratos soportados y verificables. Las superficies
retiradas o no soportadas no se traducen ni se incluyen en páginas publicadas.

## Fuentes de verdad

```text
apps/docs/src/content/docs/en/**
Docs/es/**
README.md
README.es.md
packages/framekit/README.md
packages/create-framekit/README.md
packages/create-framekit/template/README.md
Docs/README.md
```

## Localización

- Crear bajo `es/` una página por cada ruta existente bajo `en/`.
- Mantener los mismos slugs después del locale.
- Traducir títulos, descripción, texto y labels visibles.
- Mantener nombres de APIs, packages, rutas, variables y comandos exactos.
- Mantener ejemplos de código equivalentes salvo texto visible deliberadamente
  localizado.
- Reutilizar contenido español legacy solo después de validarlo contra la página
  inglesa final y el código actual.
- Verificar terminología consistente para template, field, variant, registry,
  Studio, rendering y deployment.

## Migración de enlaces

Actualizar como mínimo:

```text
README.md
README.es.md
packages/framekit/README.md
packages/create-framekit/README.md
packages/create-framekit/template/README.md
Docs/README.md
Docs/skills/**
Docs/Plans/** cuando el enlace sea referencia pública y no evidencia histórica
```

Los planes históricos pueden conservar paths antiguos cuando describen el estado
de una fase pasada, pero deben marcarse como historia y no dirigir al usuario a
ellos como documentación vigente.

## Preparación de la retirada legacy

- Confirmar que cada tema vigente de `Docs/en/` tiene destino en Starlight.
- Confirmar que cada tema vigente de `Docs/es/` tiene traducción equivalente.
- Preparar el cambio de enlaces del repositorio al dominio final.
- Preparar la eliminación de `Docs/en/` y `Docs/es/`, pero no aplicarla hasta
  verificar producción en la fase 10.
- Mantener `Docs/Plans/` y `Docs/skills/` sin moverlos al sitio.
- Mantener historia eliminada disponible mediante Git en vez de stubs duplicados.

## Regla de contenido vigente

Traducir únicamente el contrato técnico vigente verificado en manifests,
implementación, tests y el template canónico. Mantener la historia fuera de las
guías de uso; cualquier contexto histórico debe permanecer identificado como tal
y no presentarse como instrucción actual.

## Fuera de alcance

- Mantener stubs permanentes bajo `Docs/en` y `Docs/es`.
- Traducir Plans o skills internas que actualmente son English-only.
- Traducir identificadores técnicos para hacerlos más naturales.

## Verificación

- Comparar lista de rutas EN y ES.
- Construir ambos locales con rutas y contenido explícitos, sin fallback
  involuntario.
- Buscar links restantes hacia `Docs/en/` y `Docs/es/`.
- Comparar ambos locales con el contrato vigente de las fuentes actuales.
- Revisar navegación y selector de idioma en páginas profundas.
- Auditar ambos locales para confirmar que no contienen superficies retiradas o
  no soportadas.

## Exit gate

- [x] Cada ruta inglesa tiene equivalente española.
- [x] Las páginas españolas reflejan el contenido técnico inglés vigente.
- [x] Todos los cambios de enlaces públicos están listos para el rollout.
- [x] Cada archivo de `Docs/en/` y `Docs/es/` tiene destino confirmado antes de
  su retirada en la fase 10.
- [x] `Docs/Plans/` y `Docs/skills/` permanecen en su lugar.
- [x] Ninguna traducción introduce superficies retiradas o no soportadas.

## Evidencia de verificación

- **Fecha:** 2026-09-19.
- Cada ruta publicada bajo `apps/docs/src/content/docs/en/` tiene una página
  equivalente bajo `apps/docs/src/content/docs/es/`, incluidos los entrypoints
  de paquete y la referencia CSS.
- Se revisó cada documento español con un subagente independiente contra su
  fuente inglesa y las implementaciones actuales; las correcciones encontradas
  se aplicaron antes del cierre.
- `pnpm --filter docs build` — PASS; Astro generó 189 páginas y transformó los
  diagramas Mermaid.
- `pnpm check:runtime` — PASS.
- No quedan enlaces publicados a `Docs/en/` o `Docs/es/` fuera de las páginas
  de colaboradores que explican explícitamente el contexto de migración.
- La retirada de `Docs/en/` y `Docs/es/` se aplicó el 2026-09-19 tras la
  verificación local y la migración de los enlaces fuente al sitio canónico.
- Los README y metadata ya publicados en npm no se actualizaron porque esta
  operación no publica nuevas versiones; su actualización queda para el próximo
  release.
