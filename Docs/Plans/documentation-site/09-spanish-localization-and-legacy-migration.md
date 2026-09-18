# Fase 9 - Localización y migración legacy

- **Estado:** Pendiente.
- **Depende de:** Fases 0-8.
- **Resultado:** `/en/` y `/es/` tienen paridad temática, todos los destinos
  legacy están mapeados y su retirada queda preparada para el rollout.

## Objetivo

Traducir la arquitectura estable, preparar todos los enlaces internos y dejar
lista la retirada de las copias legacy. La eliminación ocurre en la fase 10,
después de verificar el deployment público. No traducir slugs ni alterar el
contrato técnico entre idiomas.

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

## Contenido que no debe migrarse como vigente

- Export PNG puramente browser-side.
- `/api/v1/images`.
- `FRAMEKIT_API_KEY` y shared render key.
- `modern-screenshot`.
- Starter de cinco archivos.
- Registry anterior con `templateManifest` o `templateRegistry`.
- Field factory `fields`, textarea kind o locale como contrato de variants.
- Snapshots de issues y runs que solo explicaban una transición.

## Fuera de alcance

- Mantener stubs permanentes bajo `Docs/en` y `Docs/es`.
- Traducir Plans o skills internas que actualmente son English-only.
- Traducir identificadores técnicos para hacerlos más naturales.

## Verificación

- Comparar lista de rutas EN y ES.
- Construir ambos locales sin fallback involuntario.
- Buscar links restantes hacia `Docs/en/` y `Docs/es/`.
- Buscar términos y contratos eliminados.
- Revisar navegación y selector de idioma en páginas profundas.

## Exit gate

- [ ] Cada ruta inglesa tiene equivalente española.
- [ ] No hay páginas españolas con contenido técnico anterior al inglés actual.
- [ ] Todos los cambios de enlaces públicos están listos para el rollout.
- [ ] Cada archivo de `Docs/en/` y `Docs/es/` tiene destino confirmado antes de
  su retirada en la fase 10.
- [ ] `Docs/Plans/` y `Docs/skills/` permanecen en su lugar.
