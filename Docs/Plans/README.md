# FrameKit 1.0

- **Estado:** Activo.
- **Release objetivo:** `@mauriciodmo/framekit@1.0.0` y
  `@mauriciodmo/create-framekit@1.0.0`.
- **Plan activo:** [Optional Authentication](./optional-authentication/README.md).
- **Última revisión:** 2026-09-19.

Este directorio contiene únicamente el trabajo que bloquea FrameKit 1.0. Los
planes ya aplicados se retiraron; su detalle permanece en Git, en las issues
cerradas y en `CHANGELOG.md`.

La selección conjunta de `1.0.0` es una decisión explícita de este release. Para
este cierre sustituye la regla general de mantener el desarrollo sin una versión
preseleccionada; las guías de publicación continúan siendo genéricas para
releases posteriores.

## Baseline completado

El checkout actual ya incluye:

- contrato canónico de templates, fields, variants y registry generado;
- Studio, Editor, navegación y design tokens estabilizados;
- SQLite, usuarios, sesiones, roles y API tokens;
- namespace único `/api/framekit` y export PNG server-side;
- renderer con Chromium, jobs en memoria y ruta privada;
- consumer generado de seis archivos, Docker y volumen SQLite;
- sitio Starlight bilingüe publicado bajo `/en/` y `/es/`;
- gates de repositorio, tarballs y consumer aislado.

Estos bloques no conservan trackers activos. La verificación que todavía importa
se repite una sola vez contra el producto final en la fase de release.

## Secuencia

```text
Optional Authentication
1. Configuración
    ↓
2. API y desarrollo
    ↓
3. Studio y codegen
    ↓
4. Verificación, arquitectura y release 1.0
```

Las fases 1-3 implementan el único cambio funcional pendiente. La fase 4 absorbe
los antiguos cierres de Studio Access, Server Image Rendering, Maintainability y
Documentation Site; es la única checklist final.

## Gate maestro

FrameKit 1.0 está completo cuando:

- las cuatro fases de Optional Authentication aprobaron sus exit gates;
- el modo abierto por defecto y el modo autenticado explícito están verificados;
- los límites arquitectónicos protegen las entradas públicas y capas finales;
- tests, E2E, tarballs, consumer aislado y Docker pasan;
- documentación, migración, changelog y skills coinciden con el release;
- ambos paquetes `1.0.0` pasan los smokes desde npm bajo un dist-tag temporal;
- ambos paquetes se promueven al dist-tag final.

Las issues [#18](https://github.com/MauricioDMO/FrameKit/issues/18) y
[#19](https://github.com/MauricioDMO/FrameKit/issues/19) siguen como backlog y no
bloquean 1.0. La protección de ramas y otros cambios de gobierno tampoco forman
parte de este plan.
