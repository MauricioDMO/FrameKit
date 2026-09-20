# Fase 4 - Verificación

## Objetivo

Demostrar que ambos modos funcionan de extremo a extremo y que abrir la frontera
de autenticación no cambia las demás defensas del renderer.

## Matriz mínima

| Caso | Auth off | Auth on |
|---|---:|---:|
| `/editor` sin cookie | `200` | redirect `/login` |
| `/brand` sin cookie | `200` | redirect `/login` |
| `GET /login` sin cookie | redirect `/editor` | `200` |
| `/settings` sin cookie | `404` | redirect `/login` |
| `GET /api/framekit/account` sin cookie | `404` | `401` |
| `POST /api/framekit/login` con body válido | `404` sin leer body | contrato de login actual |
| `POST /api/framekit/images/render` sin credenciales | llega al parsing/pipeline | `401` |
| `POST /api/framekit/images/render` con token válido | llega al pipeline | llega al pipeline |
| `POST /framekit/assets` same-origin sin cookie | permitido | `401` |
| `POST /framekit/assets` cross-origin sin cookie | `403` | `401` por orden actual |
| `POST /framekit/assets` cross-origin con sesión válida | `403` | `403` |
| `GET /framekit/render/:id` sin token interno | `404` | `404` |

Los métodos no soportados conservan `405` únicamente en el modo autenticado. En
el modo abierto, toda la access API está ausente y responde `404` antes del match
de método.

## Cobertura automatizada

- Mantener tests unitarios del parser y tests de request time.
- Ejecutar las suites server, Studio, tooling dev y codegen.
- Configurar el Playwright existente con `FRAMEKIT_AUTH_ENABLED=true` para que
  siga probando login, redirects, sesiones, tokens y rechazo anónimo.
- Configurar también con `FRAMEKIT_AUTH_ENABLED=true` los entornos autenticados de
  `tooling/smoke-tarballs.mjs` y `tooling/smoke-docker.mjs`; ambos prueban login,
  rechazo anónimo, sesión o token y no deben heredar el nuevo default.
- Cubrir el modo default desactivado con tests de integración enfocados; no crear
  una segunda aplicación E2E salvo que la cobertura HTTP existente no pueda
  demostrar el flujo.
- Confirmar que el modo abierto no llama `getDatabase`, `bootstrapUsers`,
  `getSession` ni `authenticateApiToken` antes de renderizar o procesar la imagen.
- Confirmar que las pruebas no dependen de un `.env` local no versionado.

## Regresiones de seguridad

Revalidar explícitamente:

- límites y content type del body;
- host allowlist y materialización Node de imágenes remotas;
- timeout y capacidad de render;
- bloqueo de red externa de Chromium;
- aislamiento, expiración y eliminación de render jobs;
- token interno del render privado;
- same-origin para mutaciones autenticadas y para upload dev;
- invalid-Bearer precedence cuando auth está activa;
- no inclusión de secretos en bundles cliente o payloads de render.

## Consumers y distribución

- Generar desde limpio los bindings de `apps/studio` y del template.
- Verificar que los adapters de rutas no contienen lógica duplicada.
- Construir `@mauriciodmo/framekit` antes de Studio y consumers.
- Si el cambio afecta artefactos empaquetados, inspeccionar el tarball y ejecutar
  el smoke aislado definido en la documentación de distribución.

## Comandos

Ejecutar primero checks enfocados y después:

```bash
pnpm check:runtime
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
```

Para distribución, usar los comandos de `fk-release`; no improvisar un consumer
dentro del workspace.

## Exit gate

La fase termina cuando la matriz mínima está cubierta, Playwright conserva el
flujo autenticado mediante opt-in, los checks del repositorio pasan y las
defensas no relacionadas con autenticación tienen evidencia de no regresión.
