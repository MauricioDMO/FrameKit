# Fase 5 - API de imágenes, seguridad y deployment

- **Estado:** Pendiente.
- **Depende de:** Fases 0-4.
- **Resultado:** Integradores y operadores pueden exponer FrameKit sin depender
  de Plans históricos para entender autenticación, Chromium o persistencia.

## Objetivo

Documentar como una sola historia el API HTTP, el pipeline de rendering y el
runtime de producción. Las instrucciones deben presentar primero los límites de
seguridad y después los ejemplos de exposición pública.

## Fuentes de verdad

```text
packages/framekit/src/server/api-handler.ts
packages/framekit/src/server/access/**
packages/framekit/src/server/image-handler/**
packages/framekit/src/server/image-input/**
packages/framekit/src/server/config.ts
packages/framekit/src/server/render-image.ts
packages/framekit/src/server/browser.ts
packages/create-framekit/template/.env.example
packages/create-framekit/template/Dockerfile
scripts/smoke-docker.mjs
tests/e2e/image-api.spec.ts
```

## Páginas objetivo

```text
en/users/reference/http-api/index.md
en/users/reference/http-api/access.md
en/users/reference/http-api/image-render.md
en/users/reference/http-api/errors.md
en/users/deployment/index.md
en/users/deployment/runtime.md
en/users/deployment/docker-and-persistence.md
en/users/deployment/security-and-reverse-proxies.md
en/users/guides/render-images-with-the-api.md
en/users/troubleshooting/rendering.md
en/users/troubleshooting/deployment.md
```

## Contrato HTTP

La referencia debe cubrir estas rutas vigentes:

```text
POST   /api/framekit/images/render
POST   /api/framekit/login
POST   /api/framekit/logout
GET    /api/framekit/account
PATCH  /api/framekit/account
POST   /api/framekit/account/password
GET    /api/framekit/tokens
POST   /api/framekit/tokens
DELETE /api/framekit/tokens/:id
GET    /api/framekit/users
POST   /api/framekit/users
PATCH  /api/framekit/users/:id
DELETE /api/framekit/users/:id
POST   /api/framekit/users/:id/password
GET    /api/framekit/users/:id/tokens
```

Debe explicar:

- Cookie HttpOnly para todas las rutas de acceso, cuenta, tokens y usuarios.
- Sesión same-origin o Bearer token solamente para
  `POST /api/framekit/images/render`.
- Matriz por ruta: cuenta y tokens propios requieren sesión; gestión de usuarios
  requiere sesión de administrador; rendering acepta sesión o Bearer token.
- Excepciones explícitas: propietario o administrador pueden consultar los tokens
  de un usuario y revocar un token; nunca reciben nuevamente su secret completo.
- Precedencia estricta de Authorization: un Bearer inválido no cae a sesión.
- Requisito same-origin para mutaciones autenticadas por cookie.
- Límite de 64 KiB para bodies JSON de acceso y gestión.
- En el endpoint de imagen, autenticación antes de parsing, lookup, fetch remoto
  o reserva de browser. Login necesariamente lee sus credenciales antes de poder
  autenticarlas.
- Request exacto de imagen: template, variant y data.
- PNG como único output inicial y respuestas `no-store`.
- Códigos estables de validación, autenticación, autorización, capacidad y
  timeout sin depender de parsing de mensajes.

## Seguridad de imágenes

- Aceptar paths root-relative permitidos, data URLs raster válidas y HTTPS hacia
  hosts explícitamente permitidos.
- Limitar paths root-relative a `/assets/` y `/framekit/templates/`.
- Rechazar HTTP, IP literals, credenciales, puertos, redirects inseguros,
  traversal, SVG y firmas MIME inválidas.
- Descargar imágenes remotas desde Node y convertirlas antes de Chromium.
- Aplicar el límite actual de 12,000,000 bytes al body, 8,000,000 bytes a cada
  imagen preparada y un máximo de tres redirects remotos.
- Mantener secretos fuera de URL, DOM, errores y logs.
- Explicar que assets públicos y bundles cliente no son confidenciales.

## Ruta exclusiva de desarrollo

El dev server expone `POST /framekit/assets` para reemplazar assets desde Studio.
Requiere una sesión activa, solo escribe dentro de los namespaces de templates
permitidos y no forma parte del API de producción `/api/framekit/**`.

## Configuración

```text
FRAMEKIT_ADMIN_USERNAME
FRAMEKIT_ADMIN_PASSWORD
FRAMEKIT_DATABASE_PATH
FRAMEKIT_ALLOWED_IMAGE_HOSTS
FRAMEKIT_MAX_CONCURRENT_RENDERS
FRAMEKIT_RENDER_TIMEOUT_MS
PORT
FRAMEKIT_HOST
HOST
```

Documentar defaults, límites y momento de lectura. `FRAMEKIT_HOST` y `HOST`
pertenecen al dev server; `PORT` también define el origen loopback privado del
renderer. Dejar explícito que `FRAMEKIT_PUBLIC_ORIGIN` y `FRAMEKIT_API_KEY` no
están soportados.

La guía Docker debe distinguir además las variables operativas fijadas por la
imagen (`NODE_ENV`, `HOSTNAME` y `PLAYWRIGHT_BROWSERS_PATH`) de la configuración
pública propia de FrameKit.

## Runtime y deployment

- `framekit browser install` y `--with-deps`.
- Build standalone y `framekit start` después de build exitoso.
- Chromium singleton con context/page aislados por render.
- Capacidad acotada, timeout y cleanup de context, capacidad y job por request.
  El browser se reutiliza durante la vida del proceso; no existe cierre
  automático por inactividad ni una API pública de shutdown.
- Render jobs temporales en `globalThis + Map`, TTL actual de 120 segundos y
  pérdida al reiniciar.
- SQLite persistente separado de jobs efímeros.
- `/data/framekit.sqlite` como path preparado por la imagen. La persistencia solo
  existe cuando el deployment monta `/data` como volumen durable.
- Container no-root y `tini`.
- Un proceso Node de larga duración por contenedor como topología soportada.
- HTTPS y throttling de login en reverse proxy o load balancer.
- Limitación explícita para serverless y múltiples replicas compartiendo estado.

## Fuera de alcance

- OAuth, MFA, recuperación por email, organizaciones o scopes.
- Redis, queues, object storage o render jobs persistentes.
- Múltiples formatos, DPI o rendering asíncrono.
- Diseñar una arquitectura multi-replica futura.

## Verificación

- Comparar endpoints con el dispatcher actual.
- Comparar variables con parsers y template `.env.example`.
- Ejecutar ejemplos Bearer contra el E2E o smoke vigente.
- Validar Docker, restart y persistencia según el harness existente.

## Exit gate

- [ ] Todas las rutas públicas vigentes tienen auth, request y response claros.
- [ ] Las rutas eliminadas no aparecen como alternativas actuales.
- [ ] La guía de seguridad precede a la exposición pública.
- [ ] Persistencia SQLite y jobs en memoria no se confunden.
- [ ] Docker, Chromium y restricciones de topología están documentados.
