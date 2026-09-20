# Fase 2 - Límites API y desarrollo

## Objetivo

Aplicar el modo opcional en las fronteras HTTP server-side sin debilitar las
validaciones que no pertenecen a autenticación.

## Image API

Actualizar `createStudioImageHandler` para consultar el helper de la fase 1 antes
de autenticar:

- con auth desactivada, continuar directamente al body y al pipeline de render;
- con auth activada, conservar Bearer primero y sesión same-origin como fallback
  solo cuando no existe header `Authorization`;
- conservar la validación de configuración de render antes del procesamiento;
- conservar body máximo, forma JSON exacta, lookup, validación, allowlist remota,
  deadline, capacidad y abort;
- no pasar un usuario sintético al pipeline, porque el render no consume identidad.

El modo desactivado debe aceptar clientes sin cookie, `Origin` o Bearer. Si el
cliente envía un Bearer inválido, no debe convertir una ruta pública en `401`.

## Access API

Actualizar `createStudioAccessHandler` para que todas sus rutas respondan `404`
cuando auth está desactivada:

- `/api/framekit/login` y `/api/framekit/logout`;
- `/api/framekit/account` y `/api/framekit/account/password`;
- `/api/framekit/tokens` y `/api/framekit/tokens/:id`;
- `/api/framekit/users` y sus rutas dinámicas de password/tokens.

El rechazo ocurre antes de leer body, comprobar origen, abrir SQLite, ejecutar
bootstrap o mutar sesiones. Se usa el error `not_found` existente; no se crea un
nuevo código público para una superficie intencionalmente ausente.

Con auth activada, el orden de método, same-origin, sesión, rol y ownership no
cambia.

## Upload de assets de desarrollo

Actualizar `authorizeAssetRequest`:

- auth desactivada: exigir same-origin y omitir cookie/sesión;
- auth activada: conservar la cookie, validación de secreto, same-origin y sesión;
- auth desactivada: una solicitud cross-origin recibe `403`;
- auth activada: conservar el orden actual, donde una cookie ausente o inválida
  recibe `401` antes de comprobar origen y una sesión válida cross-origin recibe
  `403`;
- el endpoint sigue siendo exclusivo del servidor de desarrollo.

No se vuelve público el filesystem de desarrollo para clientes cross-site.

## Tests

Extender la cobertura más cercana:

- `server/__tests__/studio-image-handler.test.ts`: request sin credenciales pasa
  cuando auth está desactivada y conserva `401` al activarla;
- `server/__tests__/api-handler.test.ts`: el dispatcher mantiene métodos y routing;
- `server/access/__tests__/http.test.ts`: access API devuelve `404` sin leer body
  ni tocar bootstrap/SQLite y conserva el contrato autenticado con `true`;
- tests de dev HTTP/asset authorization: upload same-origin sin sesión pasa con
  auth desactivada, cross-origin falla y el modo activado conserva la sesión.

Los tests deben restaurar las variables modificadas para no depender del orden de
ejecución.

## Archivos principales

- `packages/framekit/src/server/image-handler/index.ts`;
- `packages/framekit/src/server/access/http/index.ts`;
- `packages/framekit/src/server/api-handler.ts` solo si el dispatcher necesita
  propagar el estado; evitar lógica duplicada;
- `packages/framekit/src/tooling/dev/create-dev-server/asset-authorization.ts`;
- tests correspondientes bajo los `__tests__/` existentes.

## Exit gate

La fase termina cuando el render funciona sin credenciales por defecto, la API de
acceso está ausente sin inicializar persistencia, el upload dev conserva
same-origin y toda la cobertura autenticada pasa con opt-in explícito.
