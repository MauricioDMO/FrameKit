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

- [ ] Mover los archivos de la aplicación actual a `apps/studio/`, incluidos `src`, `public`, `next.config.ts`, `tsconfig.json`, ESLint y scripts locales.
- [ ] Mantener recursos de Studio bajo `apps/studio/public`; no moverlos al paquete porque son assets de una plantilla de ejemplo.
- [ ] Crear `packages/framekit/`, `packages/create-framekit/` y `examples/basic/` con sus propios `package.json` privados mientras aún no estén listos para empaquetar.
- [ ] Cambiar `pnpm-workspace.yaml` para incluir exactamente `apps/*`, `packages/*` y `examples/*`, manteniendo `allowBuilds` existente.
- [ ] Convertir el `package.json` raíz en `private: true`, sin dependencias de runtime de Studio.
- [ ] Mover dependencias compartidas de tooling a la raíz solo cuando todos los paquetes las consuman; las dependencias de ejecución permanecen en cada paquete.

## Scripts y dependencias locales

- [ ] Definir scripts raíz explícitos para ejecutar lint, tests, typecheck y build en todos los workspaces.
- [ ] Mantener scripts de aplicación en `apps/studio/package.json` para arrancar solo Studio.
- [ ] Añadir `@mauriciodmo/framekit: workspace:*` a las dependencias de Studio una vez creado el paquete.
- [ ] Prohibir imports de rutas como `../../../packages/framekit/src`; Studio debe importar solo `@mauriciodmo/framekit`, `/editor` o `/styles.css`.
- [ ] Crear `examples/basic` como consumidor independiente, sin código fuente compartido con Studio.

## Cierre

- [ ] `pnpm install` en la raíz resuelve todos los workspaces.
- [ ] `pnpm --filter studio dev` inicia la aplicación.
- [ ] Studio compila consumiendo `@mauriciodmo/framekit` mediante `workspace:*` y ninguna ruta interna del paquete.
