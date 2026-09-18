# Fase 0 - Estado actual y decisiones

- **Estado:** Pendiente.
- **Depende de:** Nada.
- **Resultado:** Inventario aprobado y contratos documentales congelados antes
  de mover contenido.

## Objetivo

Crear una fotografía verificable del producto y de toda la documentación que se
va a migrar. Esta fase evita diseñar la nueva jerarquía a partir de páginas
antiguas que ya contradicen el comportamiento actual.

## Baseline actual

- `apps/docs` contiene la base Starlight, pero todavía conserva título, enlaces
  y páginas de ejemplo del starter.
- La configuración declara inglés y español, pero el contenido localizado aún no
  existe bajo la estructura objetivo.
- `Docs/en/` y `Docs/es/` contienen la documentación pública vigente en formato
  Markdown y tienen cobertura temática aproximadamente equivalente.
- Los README duplican parte de esa información y algunos describen exportación
  PNG en browser, aunque Studio ya utiliza el renderer autenticado del servidor.
- `migration-next.md` funciona como diario acumulativo y no como guía de
  migración estable.
- La documentación de repositorio todavía contiene afirmaciones anteriores a la
  incorporación de `apps/docs` y a la arquitectura server/access definitiva.
- Al crear este plan, `apps/docs/` aparece como contenido nuevo sin seguimiento
  en Git y debe incorporarse intencionalmente durante la fase 1.

## Fuentes que se deben inventariar

```text
README.md
README.es.md
packages/framekit/README.md
packages/create-framekit/README.md
packages/create-framekit/template/README.md
Docs/en/**
Docs/es/**
Docs/skills/**
Docs/Plans/**
apps/docs/**
CHANGELOG.md
```

## Inventario funcional obligatorio

- Package exports y tipos públicos.
- CLI `framekit` y `create-framekit`.
- Contrato de template y validación.
- Discovery, codegen y registry generado.
- Editor, Studio, brand catalog y settings.
- Sesiones, usuarios, roles y API tokens.
- API HTTP unificada y rendering PNG.
- Configuración, seguridad de imágenes y límites de ejecución.
- Build standalone, browser install, Docker y SQLite.
- Testing, CI, empaquetado y release.

## Discrepancias que deben resolverse

- `packages/framekit/package.json` publica `./next`, aunque algunas instrucciones
  internas todavía omiten ese entrypoint. El contrato publicado y sus tests son
  la autoridad; las instrucciones deben alinearse.
- La exportación actual es server-side y autenticada, no una captura puramente
  local del browser.
- La ruta vigente es `POST /api/framekit/images/render`; `/api/v1/images` es
  historia y no debe enseñarse como alternativa.
- La autenticación usa sesiones o tokens `fk_`; no existe compatibilidad con
  `FRAMEKIT_API_KEY`.
- El nombre `language` no tiene semántica reservada dentro de fields o content.
- El repository map debe incluir `apps/docs` como cuarto workspace.

## Entregables

- Un manifest de páginas objetivo con audiencia, tipo, slug y fuente actual.
- Una tabla de disposición por página legacy: migrar, dividir, combinar, archivar
  en Git o eliminar.
- Una lista de afirmaciones obsoletas que no deben copiarse.
- Una matriz de superficies públicas contra páginas objetivo.
- La URL y plataforma final del sitio, necesarias para enlaces canónicos y
  actualización de README.

## Fuera de alcance

- Escribir páginas finales.
- Cambiar APIs o comportamiento runtime.
- Eliminar documentación legacy.
- Elegir una versión de release.

## Verificación

- Comparar exports con `packages/framekit/package.json`.
- Comparar comandos con ambos entrypoints CLI.
- Comparar rutas con el catch-all canónico y el template generado.
- Comparar variables con `.env.example`, Dockerfile y parsers de configuración.
- Comparar cada afirmación de Studio con tests y componentes actuales.

## Exit gate

- [ ] El manifest cubre todos los exports, comandos y rutas públicas actuales.
- [ ] Cada página tiene audiencia y responsabilidad principal.
- [ ] Todas las contradicciones conocidas tienen una decisión explícita.
- [ ] El sitemap de `README.md` coincide con el manifest.
- [ ] Se conoce la URL o plataforma necesaria para el rollout final.
