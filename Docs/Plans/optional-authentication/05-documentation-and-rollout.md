# Fase 5 - Documentación y rollout

## Objetivo

Publicar el nuevo default sin ambigüedades, facilitar el onboarding local y evitar
que un upgrade exponga accidentalmente una aplicación de producción.

## Consumer canónico

Actualizar `packages/create-framekit/template/.env.example` para incluir:

```dotenv
# Optional; defaults to false. Enable authentication before exposing FrameKit in production.
FRAMEKIT_AUTH_ENABLED=false
```

Las variables de bootstrap deben indicar que solo se usan cuando auth está
activada. No añadir la variable al `Dockerfile` con valor `true`: el default del
producto debe ser el mismo en local, standalone y contenedor. Los ejemplos de
despliegue sí deben pasar `FRAMEKIT_AUTH_ENABLED=true` explícitamente.

## Documentación a actualizar

- README de `@mauriciodmo/framekit`;
- README de `@mauriciodmo/create-framekit`;
- README del template generado;
- configuración, getting started, Studio, image API, access API, deployment,
  seguridad y troubleshooting del sitio documental EN/ES;
- documentación legacy EN/ES mientras siga mantenida en el checkout;
- changelog y nota de migración correspondiente al próximo release;
- skills públicas de setup/Studio si describen login o tokens; editar únicamente
  sus fuentes bajo `Docs/skills/` y ejecutar `pnpm sync:skills`.
- gates activos de
  `studio-access-and-api-rendering/08-verification-documentation-and-rollout.md`
  que todavía exigen autenticación incondicional o cuentan seis variables.

No reescribir planes históricos para fingir que el baseline anterior nunca
existió. Enlazar este plan o anotar supersession donde un gate activo aún afirme
que la autenticación es siempre obligatoria.

## Mensajes obligatorios

La documentación debe explicar:

- autenticación desactivada es el default y simplifica desarrollo y evaluación;
- `FRAMEKIT_AUTH_ENABLED=true` es la configuración recomendada para producción;
- con auth desactivada, cualquier cliente con acceso de red puede usar Studio y
  solicitar renders PNG;
- login, Ajustes, usuarios y API tokens no están disponibles en ese modo;
- las credenciales bootstrap y SQLite de acceso solo son necesarias con auth
  activada;
- el modo no se infiere desde `NODE_ENV`, Docker, password o una base existente;
- valores distintos de `true` y `false` son inválidos;
- HTTPS, throttling y proxy policy siguen siendo responsabilidad del despliegue
  cuando auth está activada.
- si un despliegue de producción mantiene auth desactivada intencionalmente, debe
  limitar el acceso por red y aplicar throttling externo al renderer público.

## Migración

Tratar el nuevo default como cambio de comportamiento. La guía de migración debe
dar el paso mínimo para preservar instalaciones existentes:

```dotenv
FRAMEKIT_AUTH_ENABLED=true
```

Debe recomendar configurar la variable antes de desplegar la nueva versión. No
se añade un período de fallback basado en credenciales existentes.

## Rollout

1. Preparar código, tests, template, migración y documentación en el mismo cambio.
2. Configurar y verificar `FRAMEKIT_AUTH_ENABLED=true` en cada despliegue
   existente antes de instalar o desplegar la versión con el nuevo default.
3. Verificar un consumer nuevo sin credenciales en modo local.
4. Verificar un consumer de producción con auth activada, SQLite persistente y
   flujo sesión/token.
5. Aprobar el baseline para un despliegue controlado; no promover la release
   final antes de los gates posteriores de Studio Access y Server Rendering.
6. Entregar el baseline cerrado a Studio Access fase 8 y, después, a Server Image
   Rendering paso 8; esas fases posteriores registran su propia reverificación.
7. Registrar los resultados de este plan en los trackers; no marcar gates por presencia de
   código.

Rollback: definir `FRAMEKIT_AUTH_ENABLED=true` recupera la frontera autenticada
sin migrar datos cuando la base ya contiene usuarios. Una instalación que solo
se ejecutó en modo abierto también necesita un `FRAMEKIT_ADMIN_PASSWORD` válido
para el primer bootstrap al activar auth. Volver a `false` no elimina usuarios,
sesiones ni tokens; solo deja de consultarlos mientras el modo abierto esté
activo.

## Exit gate

La fase termina cuando template, README, documentación EN/ES, migración y skills
coinciden; los ejemplos de producción activan auth explícitamente; un consumer
nuevo funciona sin credenciales; un consumer autenticado conserva persistencia y
tokens; y los planes bloqueados referencian este baseline como su siguiente gate.
