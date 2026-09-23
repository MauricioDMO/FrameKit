# Fase 4 - Verificación, arquitectura y release 1.0

## Objetivo

Verificar la arquitectura definitiva en ambos modos de autenticación, cerrar los
gates de distribución y publicar `@mauriciodmo/framekit@1.0.0` y
`@mauriciodmo/create-framekit@1.0.0`.

Esta es la única checklist final del repositorio. No reabre fases históricas ni
duplica evidencia: repite solo los checks que pueden fallar contra el producto
que realmente se publicará.

## Depende de

- fases 1-3 completadas con sus tests enfocados;
- renderer PNG, Studio Access y consumer de seis archivos presentes;
- sitio bilingüe publicado y disponible bajo `/en/` y `/es/`;
- tarballs locales de ambos paquetes públicos.

## Matriz de autenticación

| Caso | Auth off | Auth on |
|---|---:|---:|
| `/editor` sin cookie | `200` | redirect `/login` |
| `/brand` sin cookie | `200` | redirect `/login` |
| `GET /login` sin cookie | redirect `/editor` | `200` |
| `/settings` sin cookie | `404` | redirect `/login` |
| `GET /api/framekit/account` sin cookie | `404` | `401` |
| `POST /api/framekit/login` con body válido | `404` sin leer body | contrato de login actual |
| `POST /api/framekit/images/render` sin credenciales | llega al pipeline | `401` |
| `POST /api/framekit/images/render` con token válido | llega al pipeline | llega al pipeline |
| `POST /framekit/assets` same-origin sin cookie | permitido | `401` |
| `POST /framekit/assets` cross-origin sin cookie | `403` | `401` por orden actual |
| `POST /framekit/assets` cross-origin con sesión válida | `403` | `403` |
| `GET /framekit/render/:id` sin token interno | `404` | `404` |

Los métodos no soportados conservan `405` en modo autenticado. En modo abierto,
la access API completa responde `404` antes de método, body, origen o SQLite.

## Cobertura obligatoria

- parser con variable ausente, `false`, `true`, valores inválidos y lectura en
  request time;
- modo abierto sin llamadas a `getDatabase`, `bootstrapUsers`, `getSession` o
  `authenticateApiToken`;
- modo autenticado con login, logout, roles, ownership, tokens, expiración y
  last-active-administrator;
- invalid Bearer con precedencia sobre sesión solo en modo autenticado;
- Editor y Brand sin usuario, navegación sin Ajustes e idioma/tema disponibles;
- codegen y type-tests con `user?: StudioUser`;
- body limitado, content type, forma JSON exacta y errores estables;
- allowlist de imágenes, redirects, límites de bytes y validación raster;
- deadline, abort, capacidad, aislamiento y cleanup de Chromium;
- jobs privados con ID/token independientes, TTL y eliminación en todos los
  resultados;
- token privado fuera de URL, DOM, assets, logs y payload público;
- upload dev same-origin en ambos modos;
- ningún secreto, base SQLite, browser o workspace reference dentro de tarballs.

El Playwright E2E principal debe definir `FRAMEKIT_AUTH_ENABLED=true` para seguir
probando login, sesión, tokens y rechazo anónimo. El modo abierto necesita una
cobertura HTTP enfocada, no una segunda aplicación E2E completa.

## Límites arquitectónicos

Reinventariar el grafo después de las fases 1-3 y hacer ejecutables estos límites
mediante la configuración ESLint existente. Usar `no-restricted-imports` si cubre
el grafo verificado; no añadir otro framework o checker arquitectónico.

Entradas públicas soportadas:

```text
@mauriciodmo/framekit
@mauriciodmo/framekit/client
@mauriciodmo/framekit/editor
@mauriciodmo/framekit/next
@mauriciodmo/framekit/studio
@mauriciodmo/framekit/studio/root
@mauriciodmo/framekit/dev
@mauriciodmo/framekit/server
@mauriciodmo/framekit/styles.css
```

Reglas mínimas:

- Foundation (`types.ts`, `core/**`, `markdown/**` y shared seguro) no importa
  Editor, Studio, Server, Tooling ni built-ins de Node;
- Editor no importa Studio, Server ni Tooling;
- Studio reusable/client no importa Server ni Tooling;
- Server puede usar Foundation, Node y Playwright, pero no implementaciones de
  Editor, Studio o Tooling;
- Tooling puede usar Node y contratos foundation, sin crear dependencias inversas
  desde runtime reusable;
- consumers usan únicamente exports soportados y aliases generados;
- `packages/framekit/src/**` y subpaths públicos no soportados se rechazan;
- `./server` se rechaza en Client Components;
- `TemplateCanvas` cruza el boundary mediante `./editor`;
- el lint del creator cubre `template/src` sin añadir un script paralelo;
- tests positivos y negativos prueban la identidad de la regla aplicada;
- imports dinámicos y strings generados se inventariarán por separado, sin afirmar
  que ESLint los valida.

### Inventario manual de imports dinámicos y strings generados

ESLint comprueba imports estáticos del código fuente, pero no valida los
specifiers de `import()` ni el contenido de los strings que producen módulos.
Este inventario es manual; su cobertura ejecutable viene de las pruebas de
generación y del smoke de consumers.

| Fuente | Destino y forma emitida | Cobertura existente |
|---|---|---|
| `findTemplates` descubre `src/templates/**/template.tsx`; `create-template-module.ts` (`createTemplateModule`) | `src/generated/framekit/templates.ts` emite `load: () => import(<specifier relativo>)` para cada `template` descubierto. | `apps/studio/src/__tests__/framekit/generation.integration.test.ts` carga el módulo, ejecuta cada `entry.load()` y valida definición y metadata. El smoke del consumer empaquetado genera y ejecuta el registro. |
| `create-template-module.ts` (`createTemplateModule`) | `src/generated/framekit/templates.ts` también emite el import estático de tipo `import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'`. | La prueba de integración importa el módulo generado; el build del consumer empaquetado procesa el import de tipo. |
| `findBrandComponents` identifica directorios de marca mediante `component.tsx` y exige `preview.tsx` y `README.md`; `create-brand-module.ts` (`createBrandModule`) genera sus entradas. | `src/generated/framekit/brands.ts` emite loaders dinámicos relativos a `preview`, además de `brandManifest` y `brandRegistry`; el módulo no emite imports estáticos. | La prueba de integración ejecuta cada `brand.load()` y un loader de `brandRegistry`. El smoke del consumer empaquetado verifica la generación. |
| `collect-template-summaries.ts` (`collectTemplateSummaries`) | El runner temporal `.framekit/summary-*/templates.mts` emite imports estáticos de `node:fs/promises` y `@mauriciodmo/framekit`, además de los imports dinámicos indicados en la fila siguiente. Se elimina en `finally`. | La prueba de integración alcanza el runner mediante `writeTemplateModule`; la generación del consumer empaquetado también lo ejecuta. |
| `collect-template-summaries.ts` (`collectTemplateSummaries`) | El mismo `.framekit/summary-*/templates.mts` importa dinámicamente cada `template.tsx` descubierto mediante specifiers relativos. | La prueba de integración ejercita la carga durante `writeTemplateModule`; el smoke del consumer empaquetado ejecuta la generación. |
| `tooling/cli/check.ts` (`check`) | El runner temporal `.framekit/check-*/templates.mts` emite el import estático `import { resolveTemplateData, validateTemplateData, validateTemplateDefinition } from '@mauriciodmo/framekit'`, además de los imports dinámicos de la fila siguiente. Se elimina en `finally`. | Tanto el consumer independiente como el consumer generado por el creator ejecutan `check` durante la validación empaquetada. |
| `tooling/cli/check.ts` (`check`) | El mismo `.framekit/check-*/templates.mts` importa dinámicamente las plantillas descubiertas mediante specifiers relativos. | `pnpm smoke:tarballs` ejecuta este `check` en ambos consumers durante la fase de validación empaquetada. |
| `write-template-module.ts` (`createStudioClientModule`, `createRenderClientModule`) | Emite `studio-client.tsx` con imports estáticos de `@mauriciodmo/framekit/studio`, `./templates` y `./brands`; emite `render-client.tsx` con imports de `@mauriciodmo/framekit/client` y `./templates`. | La prueba de integración afirma estos imports emitidos; el build del consumer empaquetado procesa los bindings generados. |

En `pnpm smoke:tarballs`, tanto el consumer independiente como el consumer
generado por el creator ejecutan `check` durante la validación empaquetada. Solo
el consumer generado por el creator continúa a `runStartSmoke`; sus
verificaciones open/auth posteriores son smoke tests de runtime del servidor,
no invocaciones adicionales de `check`.

Por tanto, ESLint no se considera validación de imports dinámicos o strings
generados: esa frontera queda registrada manualmente y cubierta por ejecución de
los loaders generados y los consumers empaquetados.

## Consumer y Docker

El consumer empaquetado debe conservar exactamente seis archivos mantenidos bajo
`src/app` y regenerar `templates.ts`, `brands.ts`, `studio-client.tsx` y
`render-client.tsx` desde un directorio generado ausente.

El smoke de Docker debe comprobar:

- runtime standalone bajo `tini` y usuario no-root;
- Chromium instalado desde la versión fijada por FrameKit;
- modo abierto sin SQLite ni credenciales y render PNG válido;
- modo autenticado con bootstrap, sesión y API token;
- volumen `/data` escribible y persistente entre dos contenedores;
- usuarios, sesiones y tokens conservados después de reemplazar el contenedor;
- render jobs ausentes después de reiniciar el proceso;
- firma y dimensiones PNG correctas;
- ningún acceso externo inesperado desde Chromium.

`tooling/smoke-tarballs.mjs` y los escenarios autenticados deben definir
`FRAMEKIT_AUTH_ENABLED=true` explícitamente. `tooling/smoke-docker.mjs` debe
probar ambos modos y la sustitución de contenedor; una ejecución contra el
artefacto histórico `0.8.1` no satisface este gate.

## Documentación y migración

Actualizar antes de versionar:

- `README.md` y `README.es.md`;
- `packages/framekit/README.md`;
- `packages/create-framekit/README.md`;
- `packages/create-framekit/template/README.md`;
- `packages/create-framekit/template/.env.example`;
- páginas EN/ES de getting started, configuración, Studio, APIs, seguridad,
  deployment, troubleshooting, distribución y releases bajo
  `apps/docs/src/content/docs/`;
- guías de migración EN/ES versionadas de `0.8.x` a `1.0.0` y `CHANGELOG.md`;
- skills canónicas bajo `Docs/skills/`, seguidas por `pnpm sync:skills`.

La documentación debe declarar que auth está desactivada por defecto, que
producción debe habilitarla explícitamente y que una instalación abierta expone
Studio y el renderer a cualquier cliente con acceso de red. No debe presentar
login, SQLite o API tokens como requisitos del modo abierto.

El `.env.example` incluye como mínimo:

```dotenv
# Optional; defaults to false. Enable authentication before exposing FrameKit in production.
FRAMEKIT_AUTH_ENABLED=false
```

Las variables de bootstrap deben indicar que solo se usan cuando auth está
activada. El Dockerfile no fija auth a `true`. Los ejemplos de despliegue privado
y los escenarios autenticados lo pasan explícitamente; el escenario Docker
abierto usa `false` o la variable ausente. La migración ordena configurar
`FRAMEKIT_AUTH_ENABLED=true` en despliegues privados existentes antes de instalar
o desplegar `1.0.0`; no se usa la presencia de usuarios o credenciales como
fallback.

La guía versionada EN/ES para la migración de `0.8.x` a `1.0.0` vive bajo
`apps/docs/src/content/docs/{en,es}/users/migrations/` y debe enlazarse desde
ambos índices de migraciones y desde la entrada `BREAKING` del changelog.

La migración también explica el camino inverso: una instalación que se usó
primero en modo abierto necesita `FRAMEKIT_AUTH_ENABLED=true` y un
`FRAMEKIT_ADMIN_PASSWORD` válido para crear el primer administrador al activar
auth. Volver a `false` no borra usuarios, sesiones ni tokens.

Verificar que `https://framekit.mauriciodmo.com/en/` y `/es/` responden, que las
rutas principales y enlaces internos funcionan y que los READMEs y metadata npm
apuntan al sitio canónico después de publicar.

## Verificación local

Después de cualquier cambio de manifests, ejecutar `pnpm install` desde la raíz.
Construir FrameKit antes de los comandos que invocan su CLI:

```bash
pnpm check:runtime
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm --filter docs build
pnpm test:e2e
pnpm smoke:tarballs
```

Inspeccionar además ambos tarballs y confirmar que el consumer aislado ejecuta
`generate`, `check`, `build`, `start` y HTTP readiness fuera del workspace.

### Estado de verificación local — 2026-09-22

Las comprobaciones finales de este worktree se registraron como aprobadas:

- `pnpm check:runtime`;
- `pnpm lint`;
- `pnpm test` (todos los workspaces);
- `pnpm typecheck`;
- `pnpm build`;
- `pnpm test:e2e` (3/3);
- `pnpm smoke:tarballs` (ambos tarballs `1.0.0` y consumers open/auth);
- `pnpm sync:skills` (terminó correctamente; no produjo cambios visibles en las
  fuentes ni en las copias sincronizadas).

Warnings no bloqueantes observados: el warning ESLint existente por un `<img>`
de ejemplo, warnings de tamaño de chunks y ruta 404 en docs, y el warning de
trazado dinámico del filesystem de Studio. La build local de docs no verifica el
despliegue ni los enlaces del sitio público. Estos resultados locales tampoco
sustituyen el CI final, Docker contra npm, el registry smoke ni los gates de
publicación y promoción.

Antes de publicar debe pasar el CI del commit final: matrices Linux Node 22.13 y
24, lane Windows del consumer generado y lane Chromium E2E. Un gate local no
sustituye esas plataformas.

## Versionado y publicación

1. Cambiar ambos manifests públicos a `1.0.0`.
2. Fijar `@mauriciodmo/framekit` a `1.0.0` en
   `packages/create-framekit/template/package.json`.
3. Convertir `CHANGELOG.md` de `Unreleased` en el release `1.0.0` y dejar un nuevo
   bloque `Unreleased` vacío.
4. Ejecutar `pnpm install`, todos los gates locales y la inspección de tarballs.
5. Elegir un dist-tag temporal distinto del tag final.
6. Publicar primero `@mauriciodmo/framekit@1.0.0` con ese tag.
7. Confirmar mediante npm que exports, homepage y dependencia `playwright-core`
   pertenecen al artefacto publicado.
8. Ejecutar `pnpm smoke:docker -- 1.0.0` contra npm.
9. Publicar `@mauriciodmo/create-framekit@1.0.0` con el mismo tag temporal.
10. Ejecutar el smoke de registry con specs exactas de ambos paquetes y comprobar
    que el creator instala FrameKit `1.0.0`.
11. Verificar documentación, rutas públicas y metadata de ambos paquetes.
12. Promover ambos paquetes al dist-tag final solo después de aprobar todos los
    checks anteriores.

Una publicación correcta no equivale a una promoción correcta. Si un artefacto
publicado falla, no se sobrescribe ni se promueve: se corrige y se publica una
nueva versión.

El smoke del paso 10 usa el procedimiento ejecutable de
`apps/docs/src/content/docs/en/contributors/releases/publishing.md`. Debe definir:

```bash
: "${PUBLISH_TAG:?Set the temporary publication dist-tag}"
export CORE_SPEC=@mauriciodmo/framekit@1.0.0
export CREATOR_SPEC=@mauriciodmo/create-framekit@1.0.0
export EXPECTED_FRAMEKIT_DIST_TAG="$PUBLISH_TAG"
export EXPECTED_CREATE_FRAMEKIT_DIST_TAG="$PUBLISH_TAG"
```

Después ejecuta el bloque de registry smoke documentado allí desde fuera del
checkout y registra specs, versiones resueltas, tags, runtime y resultado. No se
promueve ningún tag desde dentro del smoke.

## Checklist final

- [x] Fases 1-3 aprobadas (estado registrado en el plan maestro).
- [x] Matriz auth off/on cubierta (`check:runtime` y tests locales).
- [x] SQLite no se inicializa en modo abierto (`check:runtime` y tests locales).
- [x] Defensas de renderer y upload dev revalidadas (tests locales).
- [x] Límites arquitectónicos aplicados y testeados (lint y tests locales).
- [x] Consumer de seis archivos funciona desde tarballs (`smoke:tarballs`, open/auth).
- [x] E2E autenticado y cobertura abierta pasan (E2E 3/3 y checks locales de runtime).
- [ ] Docker prueba ambos modos, Chromium y persistencia entre contenedores.
- [x] Documentación EN/ES, READMEs, migración, changelog y skills coinciden (build local de docs aprobado).
- [x] Gates locales del repositorio pasan (`check:runtime`, lint, test, typecheck,
      build, E2E y tarball smoke).
- [ ] Sitio público EN/ES desplegado; rutas principales y enlaces verificados en
      vivo (la build local no acredita este gate).
- [ ] CI final pasa en Linux Node 22.13/24, Windows consumer y Chromium E2E.
- [ ] `@mauriciodmo/framekit@1.0.0` pasa Docker desde npm.
- [ ] `@mauriciodmo/create-framekit@1.0.0` genera un consumer válido desde npm.
- [ ] Ambos paquetes pasan el smoke de registry con specs exactas.
- [ ] Ambos paquetes están promovidos al dist-tag final.

## Exit gate

La fase y el plan terminan cuando todas las casillas están completas y ambos
paquetes `1.0.0` están publicados, verificados desde npm y promovidos. En ese
momento `Docs/Plans/` puede retirarse por completo o iniciar un plan nuevo con
alcance posterior a 1.0.
