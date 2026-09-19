---
title: Dependencias
description: Elige cuidadosamente la ubicación de las dependencias y actualiza los manifiestos del workspace y el lockfile desde la raíz del repositorio.
---

# Dependencias

Mantén pequeño el grafo de dependencias y haz que cada dependencia pertenezca al
workspace que la ejecuta. Prefiere una API de la plataforma o una dependencia ya
instalada para el runtime propietario antes de añadir un paquete nuevo.

## Elige el límite existente más pequeño

Usa este orden cuando una funcionalidad parezca necesitar una dependencia:

1. Usa una funcionalidad integrada de Node.js, una API del navegador o una
   utilidad existente del repositorio cuando cubra el comportamiento.
2. Reutiliza una dependencia instalada cuando ya proporcione la capacidad
   necesaria. Por ejemplo, el runtime ya se encarga de instalar el navegador
   mediante `playwright-core`, y la generación de código usa las dependencias
   existentes `tsx` y `chokidar`.
3. Añade una dependencia nueva solo cuando la plataforma y el grafo actual no
   cubran el requisito. Registra por qué pertenece al manifiesto propietario.

No añadas una dependencia al workspace raíz solo porque sea conveniente para un
paquete. Mantén las dependencias exclusivas de Node fuera de los grafos de
Foundation, Editor y del cliente orientado al navegador. La página de [límites de
importación](/es/contributors/development/import-boundaries) describe la
separación entre Client, Server y Tooling.

## Actualiza el manifiesto propietario

Elige el manifiesto según quién ejecute el código:

| Código | Manifiesto y tipo de dependencia |
| --- | --- |
| Runtime o tooling reutilizable público | `packages/framekit/package.json` `dependencies`, `peerDependencies` o `devDependencies`, según corresponda |
| Implementación pública del creador | `packages/create-framekit/package.json` |
| Runtime del consumidor generado | `packages/create-framekit/template/package.json` `dependencies` o `devDependencies` |
| Studio de primera parte | `apps/studio/package.json` |
| Tooling de la documentación | `apps/docs/package.json` |
| Mantenimiento exclusivo del repositorio | `package.json` raíz |

Usa `peerDependencies` cuando el consumidor deba proporcionar un framework
compatible, como hace FrameKit con Next.js, React y React DOM. Usa
`dependencies` de runtime para el código que se importe cuando se ejecute el
paquete publicado. Mantén los paquetes exclusivos de compilación, pruebas y
tipos en `devDependencies`.

Los paquetes públicos deben seguir siendo instalables fuera de este workspace.
No añadas referencias de dependencias `workspace:`, `link:` o `file:` locales a
un paquete público. La prueba smoke del tarball rechaza esas referencias en el
contenido del paquete empaquetado.

## Actualiza los manifiestos del workspace y el lockfile

Después de cambiar el manifiesto de un paquete del workspace, ejecuta `pnpm install`
desde la raíz para actualizar el lockfile junto con el manifiesto. Tras cualquier
cambio de `package.json`, ejecuta también `pnpm build` desde la raíz:

```bash
pnpm install
pnpm build
```

Revisa tanto el manifiesto como `pnpm-lock.yaml`. No edites manualmente el
lockfile ni hagas commit de un cambio del manifiesto sin la actualización
correspondiente del lockfile. Un checkout limpio todavía debe poder instalar con:

```bash
pnpm install --frozen-lockfile
```

`packages/create-framekit/template/package.json` es diferente: se copia en los
consumidores generados y no es un importer del workspace en
`pnpm-workspace.yaml`. Sus cambios de dependencias no añaden una entrada al
lockfile raíz. Valida esos cambios mediante el [flujo de instalación y smoke del
consumidor generado](/es/contributors/distribution/generated-consumer) en lugar
de afirmar que requieren una actualización del lockfile raíz.

Mantén el contrato del repositorio en Node.js `>=22.13.0` y pnpm `>=11.14.0` al
elegir versiones. Si esos requisitos cambian, actualiza los manifiestos
correspondientes, el workflow de CI y la documentación comprobada, y ejecuta:

```bash
pnpm check:runtime
```

## Verifica los cambios de dependencias

Ejecuta las comprobaciones definidas por el `package.json` del workspace
propietario y, después, las validaciones del paquete y del consumidor cuando la
dependencia sea pública o afecte a proyectos generados. Adapta la lista a los
scripts disponibles; por ejemplo, `apps/docs/package.json` define `build`, pero
no `lint`, `test` ni `typecheck`:

```bash
pnpm --filter <workspace> lint
pnpm --filter <workspace> test
pnpm --filter <workspace> typecheck
pnpm --filter <workspace> build
pnpm --filter @mauriciodmo/framekit pack --dry-run
pnpm --filter @mauriciodmo/create-framekit pack --dry-run
```

Usa `pnpm smoke:tarballs` para consumidores de paquetes aislados. Usa
`pnpm smoke:docker -- <exact-published-framekit-version>` solo para la ruta de
Docker de FrameKit publicado; verifica la dependencia publicada, la compilación
de la imagen, el runtime del navegador, la API y el comportamiento del
almacenamiento persistente. Para un cambio entre workspaces, termina con las
comprobaciones raíz de `lint`, `test`, `typecheck` y `build`.
