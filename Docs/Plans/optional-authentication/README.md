# Optional Authentication and FrameKit 1.0

- **Estado:** En progreso; Fases 1-3 completadas y fase 4 pendiente.
- **Release objetivo:** `@mauriciodmo/framekit@1.0.0` y
  `@mauriciodmo/create-framekit@1.0.0`.
- **Runtime objetivo:** Un proceso Node de larga duración por aplicación.
- **Paquete principal:** `@mauriciodmo/framekit`.
- **Consumer canónico:** `packages/create-framekit/template/`.

La versión conjunta fue aprobada para este cierre concreto aunque los dos
paquetes conserven versionado independiente después de 1.0.

## Propósito

Hacer opcional la autenticación mediante una única variable booleana, conservar
el modo autenticado existente como opt-in y cerrar en el mismo plan todos los
gates necesarios para publicar FrameKit 1.0.

La variable canónica es `FRAMEKIT_AUTH_ENABLED`:

- ausente o `false`: autenticación desactivada;
- `true`: autenticación activada con usuarios, sesiones y API tokens;
- cualquier otro valor: configuración inválida, sin coerción silenciosa.

El default permanece en `false`. Ni `NODE_ENV=production`, Docker, una base de
datos existente ni credenciales bootstrap lo cambian implícitamente. La
documentación debe recomendar `FRAMEKIT_AUTH_ENABLED=true` antes de exponer una
instalación de producción a una red no confiable.

## Contrato de comportamiento

| Superficie | `FRAMEKIT_AUTH_ENABLED=false` | `FRAMEKIT_AUTH_ENABLED=true` |
|---|---|---|
| `/editor` y `/brand` | Acceso directo, sin cookie ni usuario | Requieren una sesión activa |
| `/login` | Redirige a `/editor` | Muestra login o redirige si ya existe sesión |
| `/settings` | Responde como no encontrada | Requiere sesión y conserva cuentas, tokens y usuarios |
| API `/api/framekit/{login,logout,account,tokens,users,...}` | `404` antes de body, origen o SQLite | Conserva métodos, sesiones, roles y ownership |
| `POST /api/framekit/images/render` | No exige cookie ni Bearer | Acepta sesión same-origin o API token válido |
| Upload dev `/framekit/assets` | No exige sesión; conserva same-origin | Exige sesión válida y same-origin |
| Render privado `/framekit/render/[id]` | Sin cambios | Sin cambios |

Desactivar autenticación no crea un administrador anónimo. No se inicializa
SQLite, no se crea un usuario sintético y no se exponen operaciones de cuentas,
usuarios o tokens. El render privado conserva su token interno en ambos modos.

## Límites de seguridad

- El modo abierto hace públicos Studio y el renderer para cualquier cliente con
  acceso de red al proceso.
- Same-origin del upload de desarrollo se conserva porque evita escrituras
  cross-site y no representa autenticación de usuario.
- Límites de body, validación, imágenes remotas, concurrencia, timeout, red de
  Chromium y tokens privados no cambian.
- Un `Authorization` malformado se ignora solo cuando auth está desactivada; con
  auth activada conserva la precedencia y el rechazo actuales.
- La configuración se consulta en request time para no congelar el entorno al
  importar módulos.
- No se aceptan aliases como `FRAMEKIT_AUTH_DISABLED`, `AUTH_ENABLED` o
  `FRAMEKIT_API_KEY`.

## Ownership

| Responsabilidad | Owner |
|---|---|
| Parseo estricto de `FRAMEKIT_AUTH_ENABLED` | Internals server-only de `packages/framekit/src/server/access/` |
| Image API y desactivación de access API | `packages/framekit/src/server/` |
| Upload dev con same-origin | `packages/framekit/src/tooling/dev/` |
| Rutas de Studio y login | `@mauriciodmo/framekit/studio/root` |
| Usuario opcional y navegación | `@mauriciodmo/framekit/studio` |
| Binding `StudioClient` | Codegen de FrameKit |
| Configuración de despliegue | Cada aplicación consumer |
| Documentación y release | Template, paquetes, sitio EN/ES y tooling de release |

No se añade un nuevo export público. El parser es un detalle interno compartido
por server, Studio root y tooling dev.

## Alcance

Incluido:

- variable server-only estricta y desactivada por defecto;
- Editor, Brand, render PNG y upload dev utilizables sin sesión;
- ausencia total de login, Ajustes y API de acceso en modo abierto;
- modo autenticado actual preservado mediante opt-in;
- tests de ambos modos y actualización del consumer;
- límites de imports contra la arquitectura final;
- documentación, migración, tarballs, E2E y Docker;
- publicación y promoción de ambos paquetes `1.0.0`.

Excluido:

- inferir el modo mediante desarrollo, producción o credenciales existentes;
- permisos parciales o un usuario administrador sintético;
- API key compartida, OAuth, MFA, scopes o RBAC nuevo;
- cambios de schema SQLite o persistencia de render jobs;
- rate limiting interno, serverless o múltiples procesos;
- issues #18 y #19 y cambios de gobierno del repositorio.

## Fases

| Fase | Plan | Resultado | Depende de |
|---:|---|---|---|
| 1 | [Contrato de configuración](./01-runtime-configuration.md) | Completada: parser estricto y default desactivado | Baseline actual |
| 2 | [Límites API y desarrollo](./02-api-and-development-boundaries.md) | Completada: renderer abierto, access API ausente y upload dev protegido | Fase 1 |
| 3 | [Studio y codegen](./03-studio-and-codegen.md) | Completada: Studio sin login, Ajustes ausentes y usuario opcional | Fases 1-2 |
| 4 | [Verificación, arquitectura y release 1.0](./04-v1-verification-and-release.md) | Gates finales, publicación y promoción | Fases 1-3 |

```text
1 → 2 → 3 → 4
```

## Compatibilidad

El cambio modifica intencionalmente el default. Una aplicación que actualice sin
definir la variable dejará de exigir login y tokens. Para conservar el
comportamiento anterior debe configurar antes del despliegue:

```dotenv
FRAMEKIT_AUTH_ENABLED=true
```

No se mantiene fallback basado en `FRAMEKIT_ADMIN_PASSWORD`, usuarios existentes,
SQLite o `NODE_ENV`. Volver temporalmente a `false` no elimina usuarios, sesiones
ni tokens; simplemente deja de consultarlos.

Todo despliegue existente que deba seguir siendo privado configura
`FRAMEKIT_AUTH_ENABLED=true` antes de instalar o desplegar `1.0.0`. No se promueve
el release si ese paso no está visible en la migración y los ejemplos de
producción.

## Gate final

El plan se completa únicamente cuando la fase 4 ha publicado y verificado ambos
paquetes `1.0.0` y los ha promovido al dist-tag final. Presencia de código,
publicación en npm o éxito local por separado no bastan para cerrar el plan.
