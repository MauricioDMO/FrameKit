# Optional Authentication

- **Estado:** Planificado; ninguna fase implementada.
- **GitHub issue:** No asignada.
- **Release:** Sin versión preseleccionada.
- **Depende de:** Studio Access, API Tokens, and Server-backed Export fases 1-7.
- **Debe terminar antes de:** Studio Access fase 8, Server Image Rendering paso 8
  y Maintainability fase 6.
- **Runtime objetivo:** Un proceso Node de larga duración por aplicación.
- **Paquete principal:** `@mauriciodmo/framekit`.
- **Consumer canónico:** `packages/create-framekit/template/`.

## Propósito

Hacer opcional la autenticación de FrameKit mediante una única variable booleana,
con un modo local cómodo por defecto y un modo autenticado explícito para
despliegues que exponen Studio o la API a una red no confiable.

La variable canónica será `FRAMEKIT_AUTH_ENABLED`:

- ausente o `false`: autenticación desactivada;
- `true`: autenticación activada con el comportamiento actual de usuarios,
  sesiones y API tokens;
- cualquier otro valor: configuración inválida; no se acepta coerción silenciosa.

La documentación debe recomendar `FRAMEKIT_AUTH_ENABLED=true` para producción.
El valor predeterminado sigue siendo `false`; ni `NODE_ENV=production` ni Docker
lo cambian implícitamente.

## Contrato de comportamiento

| Superficie | `FRAMEKIT_AUTH_ENABLED=false` | `FRAMEKIT_AUTH_ENABLED=true` |
|---|---|---|
| `/editor` y `/brand` | Acceso directo, sin cookie ni usuario | Requieren una sesión activa |
| `/login` | Redirige a `/editor` | Muestra login o redirige si ya existe sesión |
| `/settings` | No existe para el cliente; responde como no encontrada | Requiere sesión y conserva cuentas, tokens y usuarios |
| API de acceso `/api/framekit/{login,logout,account,tokens,users,...}` | Responde `404` sin tocar SQLite | Conserva métodos, origen, sesión, roles y ownership actuales |
| `POST /api/framekit/images/render` | No exige cookie ni Bearer | Acepta sesión same-origin o API token válido |
| Upload dev `/framekit/assets` | No exige sesión; conserva same-origin | Exige sesión válida y same-origin |
| Render privado `/framekit/render/[id]` | Sin cambios | Sin cambios |

Desactivar autenticación no convierte las rutas de gestión en operaciones de
administrador anónimo. No se crea un usuario sintético, no se inicializa SQLite y
no se exponen operaciones de cuenta, usuarios o tokens. El protocolo del render
privado conserva su token interno en ambos modos.

## Límites de seguridad

- El modo desactivado hace públicos Studio y el endpoint de render para cualquier
  cliente con acceso de red al proceso.
- La comprobación same-origin del upload de desarrollo se conserva porque evita
  escrituras cross-site y no es autenticación de usuario.
- Las restricciones de imágenes remotas, límites de body, validación de datos,
  concurrencia, timeout, red de Chromium y token del render privado no cambian.
- Un header `Authorization` malformado se ignora solamente cuando la autenticación
  está desactivada; cuando está activada conserva la precedencia y rechazo actual.
- La configuración se consulta en request time para que los adapters y tests no
  congelen un valor de entorno al importar el módulo.
- No se añade compatibilidad con nombres alternativos como
  `FRAMEKIT_AUTH_DISABLED`, `AUTH_ENABLED` o `FRAMEKIT_API_KEY`.

## Arquitectura objetivo

```text
                    FRAMEKIT_AUTH_ENABLED
                       /              \
                  false                true
                    |                    |
        +-----------+-----------+    users / sessions / api_tokens
        |           |           |        |              |
      Studio    image API   dev upload  session       Bearer token
    editor/brand   public    same-origin   +--------------+
        |           |                                |
        +-----------+--------------------------------+
                            |
                    shared image pipeline
                            |
                  private render token
                            |
                         Chromium
                            |
                           PNG
```

## Ownership

| Responsabilidad | Owner |
|---|---|
| Parseo estricto de `FRAMEKIT_AUTH_ENABLED` | Internals server-only de `packages/framekit/src/server/access/` |
| Bypass de autenticación del render y desactivación de access API | `packages/framekit/src/server/` |
| Protección same-origin del upload dev | `packages/framekit/src/tooling/dev/` |
| Rutas de Studio y login | `@mauriciodmo/framekit/studio/root` |
| Visibilidad de Ajustes y usuario opcional | `@mauriciodmo/framekit/studio` |
| Binding `StudioClient` con usuario opcional | Codegen de FrameKit |
| Valor de despliegue | Cada aplicación consumer |
| Referencia y recomendación de producción | Template, package README y documentación EN/ES |

No se añade un nuevo export público. El parser es un detalle interno compartido
por server, Studio root y tooling dev.

## Alcance

Incluido:

- una variable booleana server-only, estricta y desactivada por defecto;
- acceso sin sesión a Editor y Brand;
- render PNG sin credenciales;
- upload de assets de desarrollo sin sesión y con same-origin;
- desactivación completa de login, cuentas, usuarios, sesiones y API tokens;
- ocultar la navegación hacia Ajustes cuando no hay autenticación;
- conservar sin cambios el modo autenticado mediante opt-in;
- tests de ambos modos y documentación EN/ES;
- actualización del consumer generado, ejemplos de entorno y smokes.

Excluido:

- detectar automáticamente desarrollo o producción;
- activar autenticación implícitamente por `NODE_ENV`;
- un usuario administrador anónimo o sintético;
- permisos parciales en el modo desactivado;
- auth por API key compartida;
- cambios de schema o migraciones SQLite;
- OAuth, MFA, scopes, RBAC nuevo o rate limiting;
- hacer confidenciales assets públicos o bundles cliente;
- cambiar el protocolo del render privado.

## Fases

Las fases son secuenciales. Cada una conserva un check ejecutable antes de
continuar.

| Fase | Plan | Resultado principal | Depende de |
|---:|---|---|---|
| 1 | [Contrato de configuración](./01-runtime-configuration.md) | Parser estricto, default desactivado y contrato testeado | Baseline actual |
| 2 | [Límites API y desarrollo](./02-api-and-development-boundaries.md) | Render público opcional, access API apagada y upload dev funcional | Fase 1 |
| 3 | [Studio y codegen](./03-studio-and-codegen.md) | Studio sin login, Ajustes ausentes y binding con usuario opcional | Fases 1-2 |
| 4 | [Verificación](./04-verification.md) | Cobertura de ambos modos, E2E autenticado y gates del repositorio | Fases 1-3 |
| 5 | [Documentación y rollout](./05-documentation-and-rollout.md) | Consumer, docs EN/ES y advertencia de producción coherentes | Fase 4 |

Orden obligatorio:

```text
1 → 2 → 3 → 4 → 5
```

## Compatibilidad

Este cambio modifica intencionalmente el default. Una aplicación que actualice
FrameKit sin definir la variable dejará de exigir login y tokens. Para conservar
el comportamiento anterior debe configurar:

```dotenv
FRAMEKIT_AUTH_ENABLED=true
```

No se mantiene un fallback basado en la presencia de
`FRAMEKIT_ADMIN_PASSWORD`, usuarios existentes, la base de datos o
`NODE_ENV=production`: cualquiera de esos heurísticos haría ambiguo el contrato y
podría alternar el modo sin intención explícita.

## Gate final

El plan se completa cuando:

- las cinco fases aprobaron sus exit gates;
- sin variable, Editor, Brand, render PNG y upload dev funcionan sin credenciales;
- sin variable, login, Ajustes y la API de acceso no están disponibles;
- con `FRAMEKIT_AUTH_ENABLED=true`, sesiones, roles, tokens y same-origin conservan
  el comportamiento previo;
- ningún camino desactivado inicializa SQLite o crea un usuario implícito;
- el render privado y las demás defensas del pipeline permanecen intactos;
- consumer generado, primera aplicación, E2E, build, typecheck y lint pasan;
- `.env.example`, README y documentación EN/ES describen el default inseguro para
  redes públicas y recomiendan activar autenticación en producción;
- el handoff hacia Studio Access fase 8 y Server Image Rendering paso 8 queda
  actualizado para revalidar este nuevo baseline después de cerrar el plan.
