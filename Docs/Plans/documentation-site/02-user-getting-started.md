# Fase 2 - Inicio para usuarios

- **Estado:** Pendiente.
- **Depende de:** Fases 0-1.
- **Resultado:** Un usuario puede crear o integrar FrameKit y llegar a su primer
  template usando únicamente la documentación nueva en inglés.

## Objetivo

Construir la ruta de aprendizaje mínima desde los requisitos hasta un Studio
funcional. La ruta debe distinguir creación de proyecto e integración en un
Next.js existente sin duplicar pasos compartidos.

## Fuentes de verdad

```text
packages/create-framekit/src/**
packages/create-framekit/template/**
packages/framekit/src/next/**
packages/framekit/src/studio/root.tsx
packages/framekit/src/tooling/cli/**
Docs/en/getting-started/**
```

## Páginas objetivo

```text
en/users/getting-started/index.md
en/users/getting-started/create-project.md
en/users/getting-started/existing-project.md
en/users/getting-started/project-structure.md
en/users/getting-started/first-template.md
```

No se crea una página `installation.md` separada mientras instalación dependa
del flujo elegido y pueda explicarse sin duplicación en las dos rutas.

## Contenido obligatorio

- Node.js `>=22.13.0`, pnpm `>=11.14.0` y Next.js compatible.
- Flujo interactivo y flags `-y`/`-n` de `create-framekit`.
- Instalación omitida, `pnpm approve-builds` y recuperación posterior.
- Archivos mantenidos del proyecto generado y outputs ignorados.
- `withFrameKit`, standalone output, `.framekit/next` y redirect `/` a `/editor`.
- `FrameKitStudioRoot`, styles y aliases generados.
- Rutas de editor, login, API y render privado requeridas por la integración.
- Generación inicial del registry y cuándo ocurre automáticamente.
- Primer template válido con metadata, variant y un field de texto.
- Primer arranque y enlace hacia configuración de administrador/deployment sin
  duplicar su referencia completa.

## Correcciones frente a la documentación anterior

- La estructura canónica tiene seis archivos mantenidos bajo `src/app`.
- La integración incluye acceso y renderer server-side; no es solo una UI local.
- `@mauriciodmo/framekit/next` es el entrypoint de `withFrameKit`.
- Los archivos en `src/generated/framekit/` y `.framekit/` no se editan.

## Fuera de alcance

- Referencia exhaustiva de templates.
- Administración de usuarios y tokens.
- Deployment de producción completo.
- Guías de contribución al monorepo.

## Verificación

- Ejecutar los pasos contra una salida actual de `create-framekit`.
- Confirmar que todos los imports usan exports soportados.
- Confirmar que el ejemplo pasa `framekit generate` y `framekit check`.
- Construir docs para detectar enlaces y snippets inválidos.

## Exit gate

- [ ] Proyecto nuevo y proyecto existente tienen rutas completas y no se mezclan.
- [ ] La estructura descrita coincide con el template canónico.
- [ ] El primer template usa el contrato vigente.
- [ ] Ningún ejemplo depende de source imports o generated output manual.
- [ ] Las cinco páginas enlazan correctamente desde `users/index.md`.
