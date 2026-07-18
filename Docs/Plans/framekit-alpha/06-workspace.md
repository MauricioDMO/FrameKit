# 06. Workspace

## Estructura objetivo

```text
apps/
  studio/
packages/
  framekit/
  create-framekit/
examples/
  basic/
package.json
```

El repositorio raíz nunca se publica. Solo `packages/framekit` y `packages/create-framekit` tendrán nombre de npm y `publishConfig`.

## Migración física

La migración se hace por propiedad, no como un movimiento literal de todo `src`. Esto evita mover el núcleo y el editor a Studio para después extraerlos otra vez al paquete.

- [x] Mover el código propio de la aplicación a `apps/studio/`, incluidos sus rutas, componentes, i18n, `public`, `next.config.ts`, `tsconfig.json`, ESLint y scripts locales.
- [x] Mover directamente el código reutilizable de `src/lib/framekit/` a `packages/framekit/src/`, incluyendo sus pruebas unitarias del núcleo y editor.
- [x] Mover el scanner y generador a `packages/framekit/src/codegen/`, dejando en Studio solo el caller específico de generación hasta completar la fase 08.
- [x] Mover los fixtures de tipos a `packages/framekit/tests/types/` con su `tsconfig.json`; no moverlos a Studio.
- [x] Mantener `tests/application/generation.integration.test.ts` junto a Studio como prueba de integración de aplicación; moverla a `apps/studio/src/test/framekit/generation.integration.test.ts`.
- [x] Mantener recursos de Studio bajo `apps/studio/public`; no moverlos al paquete porque son assets de una plantilla de ejemplo.
- [x] Crear `packages/framekit/`, `packages/create-framekit/` y `examples/basic/` con sus propios `package.json` privados mientras aún no estén listos para empaquetar.
- [x] Cambiar `pnpm-workspace.yaml` para incluir exactamente `apps/*`, `packages/*` y `examples/*`, manteniendo `allowBuilds` existente.
- [x] Convertir el `package.json` raíz en `private: true`, sin dependencias de runtime de Studio.
- [x] Mantener las dependencias de ejecución en cada workspace y el tooling local junto a los workspaces que lo consumen.

## Scripts y dependencias locales

- [x] Definir scripts raíz explícitos para ejecutar lint, tests, typecheck y build en todos los workspaces.
- [x] Mantener scripts de aplicación en `apps/studio/package.json` para arrancar solo Studio.
- [x] Añadir `@mauriciodmo/framekit: workspace:*` a las dependencias de Studio una vez creado el paquete y configurar sus entradas de desarrollo para consumir el código del paquete sin rutas `../../../packages/framekit/src`.
- [x] Prohibir imports de rutas como `../../../packages/framekit/src`; Studio debe importar solo `@mauriciodmo/framekit`, `/editor` o `/styles.css`.
- [x] Crear `examples/basic` como consumidor independiente, sin código fuente compartido con Studio.

## Resolución de la transición al paquete

La exigencia de que Studio consuma `@mauriciodmo/framekit` no se interpreta como que el paquete deba estar vacío durante esta fase. `packages/framekit` debe recibir el código reutilizable y una entrada workspace mínima utilizable por Studio desde la fase 06; la fase 07 añadirá la compilación publicable, exports, CSS y metadatos npm.

- [x] No duplicar FrameKit bajo `apps/studio/src/lib/framekit` para resolver temporalmente la dependencia.
- [x] Mantener registry, manifest, rutas de Studio y plantilla piloto dentro de `apps/studio`.
- [x] Hacer que el codegen genere el tipo de import correcto para el consumidor final cuando Studio deje de usar el alias `@/lib/framekit`.

## Cierre

- [x] `pnpm install` en la raíz resuelve todos los workspaces.
- [x] `pnpm --filter studio dev` inicia la aplicación.
- [x] Studio compila consumiendo `@mauriciodmo/framekit` mediante `workspace:*` y ninguna ruta interna del paquete.
