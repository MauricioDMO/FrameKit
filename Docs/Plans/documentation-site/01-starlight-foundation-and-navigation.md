# Fase 1 - Base Starlight y navegación

- **Estado:** Pendiente.
- **Depende de:** Fase 0.
- **Resultado:** Aplicación documental integrada al monorepo, sin contenido de
  ejemplo y con navegación bilingüe estable.

## Objetivo

Preparar la infraestructura editorial antes de migrar contenido. Esta fase fija
URLs, navegación, metadatos y convenciones para que las fases siguientes solo
tengan que crear páginas.

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
- Establecer una convención de links relativos que funcione en ambos idiomas.
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
- El sidebar muestra las dos audiencias sin mezclar contenido.
- No quedan “My Docs”, “Welcome to Starlight” ni enlaces a `withastro/starlight`.

## Exit gate

- [ ] `apps/docs` forma parte intencional del workspace.
- [ ] Inglés y español usan prefijos explícitos.
- [ ] Homepage, sidebar, social link y metadata son de FrameKit.
- [ ] Mermaid renderiza durante build.
- [ ] El build de docs pasa sin páginas placeholder.
