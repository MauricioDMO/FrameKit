# Fase 2 - Inicio para usuarios

- **Estado:** Completada.
- **Depende de:** Fases 0-1.
- **Resultado:** Un usuario puede crear o integrar FrameKit y llegar a su primer
  template usando únicamente la documentación nueva en inglés.

## Objetivo

Construir la ruta de aprendizaje mínima desde los requisitos hasta un Studio
funcional. La ruta debe distinguir creación de proyecto e integración en un
Next.js existente sin duplicar pasos compartidos.

Todo contenido y ejemplo debe basarse exclusivamente en manifests,
implementación, tests y el template canónico actuales; se omite cualquier
afirmación que no pueda verificarse allí.

Las superficies retiradas o no soportadas no se mencionan en páginas publicadas,
ni siquiera como advertencias o instrucciones de migración.

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
- Buscar referencias a APIs, rutas, variables, imports, archivos, comandos, flags
  o comportamientos que no existan en las fuentes actuales.

Verificado el 2026-09-18:

- `pnpm --filter docs build` generó las cinco páginas inglesas y la navegación de
  `Getting started`.
- `pnpm --filter @mauriciodmo/create-framekit build` pasó.
- Una salida temporal de `create-framekit`, con el paquete local actual de
  `@mauriciodmo/framekit`, pasó `pnpm framekit generate`, `pnpm check` y
  `pnpm build` con el template inicial y el ejemplo de esta fase.

El primer smoke contra `@mauriciodmo/framekit@0.8.1` descargado del registry no
pasó porque ese artefacto no exporta `field`, aunque el source y el tarball local
actual sí lo exportan. Es una discrepancia de distribución pendiente de release,
no una dependencia de la documentación nueva; debe resolverse antes del rollout
público.

## Exit gate

- [x] Proyecto nuevo y proyecto existente tienen rutas completas y no se mezclan.
- [x] La estructura descrita coincide con el template canónico.
- [x] El primer template usa el contrato vigente.
- [x] Ningún ejemplo depende de source imports o generated output manual.
- [x] Las cinco páginas enlazan correctamente desde `users/index.md`.
- [x] Las páginas no documentan superficies retiradas o no soportadas.
