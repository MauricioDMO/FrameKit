# Fase 1 - Contrato de configuración

- **Estado:** Completada.

## Objetivo

Introducir una única fuente de verdad server-only para decidir si la
autenticación está activa, sin cambiar todavía rutas ni UI.

## Contrato

`FRAMEKIT_AUTH_ENABLED` acepta únicamente:

| Valor | Resultado |
|---|---|
| Variable ausente | `false` |
| `false` | `false` |
| `true` | `true` |
| Vacío, mayúsculas, espacios, `1`, `0`, `yes`, `no` u otro valor | Error de configuración |

El parser no depende de `NODE_ENV`, no lee archivos `.env` por sí mismo y acepta
un `NodeJS.ProcessEnv` inyectable para tests. El acceso normal usa `process.env`.

## Implementación esperada

- Añadir un helper interno bajo `packages/framekit/src/server/access/`, por
  ejemplo `isAuthenticationEnabled(env = process.env)`.
- Mantenerlo fuera de los exports públicos de `./server` y `./studio/root`.
- Producir un error estable y accionable que nombre `FRAMEKIT_AUTH_ENABLED` y los
  dos valores aceptados.
- Leer la variable cuando se atiende la solicitud o se renderiza la página, no al
  evaluar el módulo ni al crear un singleton global.
- No mezclar esta opción con `parseImageRenderConfig`: autenticación también
  afecta Studio y tooling dev, no solo el renderer.

El helper lanza el error interno estable. Cada frontera lo traduce sin exponer
detalles del entorno: Studio deja que Next produzca su error server-side, access
API responde `500 internal_error`, image API responde su `503 api_not_configured`
existente y el upload dev responde `500` con un mensaje genérico. Ningún valor
inválido abre la aplicación ni cae al modo autenticado por accidente.

## Tests

Añadir un test enfocado bajo el árbol `src/server/access/__tests__/` que cubra:

- variable ausente;
- `false` explícito;
- `true` explícito;
- valores inválidos representativos;
- ausencia de coerción por `NODE_ENV=production`;
- evaluación independiente con distintos objetos de entorno.

Los tests existentes que verifican comportamiento autenticado deberán optar por
`FRAMEKIT_AUTH_ENABLED=true` cuando sus fases consumidoras se implementen. No se
debe cambiar globalmente el entorno de Vitest para esconder el nuevo default.
Esto incluye explícitamente los setups de:

- `server/access/__tests__/http.test.ts`;
- `server/__tests__/image-handler.test.ts`;
- `server/__tests__/studio-image-handler.test.ts`;
- `tooling/dev/__tests__/create-dev-server.test.ts`;
- `apps/studio/src/__tests__/framekit/access-adapters.test.ts`.

## Archivos principales

- `packages/framekit/src/server/access/`;
- `packages/framekit/src/server/access/__tests__/`.

## Fuera de alcance

- rutas HTTP;
- UI de Studio;
- cambios de schema;
- documentación pública;
- aliases o compatibilidad con variables históricas.

## Exit gate

- [x] El parser tiene cobertura completa.
- [x] El valor ausente es `false`.
- [x] Los valores inválidos fallan de forma explícita.
- [x] El helper permanece interno.
- [x] Los tests enfocados de access pasan.

Implementación: `packages/framekit/src/server/access/config.ts`.
Cobertura: `packages/framekit/src/server/access/__tests__/config.test.ts`.
