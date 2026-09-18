# Fase 1 - Base Starlight y navegación

- **Estado:** Completada.
- **Depende de:** Fase 0.
- **Resultado:** Aplicación documental integrada al monorepo, sin contenido de
  ejemplo y con navegación bilingüe estable.

## Objetivo

Preparar la infraestructura editorial antes de migrar contenido. Esta fase fija
URLs, navegación, metadatos y convenciones para que las fases siguientes solo
tengan que crear páginas.

Todo contenido y ejemplo debe basarse exclusivamente en manifests,
implementación, tests y el template canónico actuales; se omite cualquier
afirmación que no pueda verificarse allí.

## Fuentes de verdad

```text
apps/docs/package.json
apps/docs/astro.config.mjs
apps/docs/src/content.config.ts
apps/docs/src/content/docs/**
apps/docs/src/content/i18n/**
package.json
pnpm-workspace.yaml
```

## Trabajo

- Incorporar `apps/docs` al workspace y eliminar residuos del starter.
- Cambiar el título, descripción y enlace social a FrameKit.
- Configurar locales explícitos `en` y `es`, con prefijo para ambos.
- Crear las home `/en/` y `/es/` con la decisión inicial por audiencia.
- Crear grupos principales `Using FrameKit` y `Contributing to FrameKit` con
  traducciones de labels.
- Definir sidebar estable sobre slugs compartidos entre idiomas.
- Mantener integración Mermaid y comprobarla con un diagrama mínimo real.
- Definir frontmatter mínimo: title, description y orden cuando sea necesario.
- Establecer una convención de enlaces internos con prefijo explícito (`/en/...`
  y `/es/...`) que no dependa de la barra final.
- Definir placeholders estructurales solo cuando una fase posterior sea la dueña
  inmediata; no publicar páginas vacías.

## Páginas iniciales

```text
en/index.mdx
en/users/index.md
en/contributors/index.md
es/index.mdx
es/users/index.md
es/contributors/index.md
```

Las páginas de entrada explican la audiencia y enlazan únicamente a contenido
que ya existe en el checkout de esa fase.

## Fuera de alcance

- Personalización visual extensa de Starlight.
- Buscador externo, analytics, CMS o comentarios.
- Componentes React para contenido que Markdown/MDX ya resuelve.
- Publicación del sitio.

## Verificación

```bash
pnpm --filter docs build
```

Revisar además:

- `/en/` y `/es/` generan rutas independientes.
- El selector de idioma conserva el slug cuando existe traducción.
- Las home conservan el prefijo de idioma en sus enlaces internos aunque se
  acceda a `/en` o `/es` sin slash final.
- El sidebar muestra las dos audiencias sin mezclar contenido.
- La revisión confirma que páginas, metadata y enlaces corresponden a FrameKit y
  no conservan contenido del starter.

## Exit gate

- [x] `apps/docs` forma parte intencional del workspace.
- [x] Inglés y español usan prefijos explícitos.
- [x] Homepage, sidebar, social link y metadata son de FrameKit.
- [x] Mermaid renderiza durante build.
- [x] El build de docs pasa sin páginas placeholder.

Verificado el 2026-09-18 con `pnpm --filter docs build`. El build generó las seis
rutas iniciales bajo `/en/` y `/es/`, transformó el bloque Mermaid, no generó
homepage sin prefijo y las home generaron enlaces explícitos con el locale
correspondiente, sin destinos relativos.
