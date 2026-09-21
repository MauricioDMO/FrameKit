---
title: Distribución para contribuidores
description: Compila, inspecciona y ejecuta pruebas smoke de los paquetes públicos de FrameKit fuera del checkout.
---

# Distribución para contribuidores

El trabajo de distribución verifica lo que un proyecto externo puede instalar y
usar. Los manifiestos de los paquetes, la configuración de compilación, la
plantilla canónica y los scripts de pruebas smoke son la autoridad para este flujo.

## Límite de los paquetes públicos

Solo estos dos paquetes son destinos de distribución pública:

| Paquete | Fuente mantenida | Responsabilidad publicada |
| --- | --- | --- |
| `@mauriciodmo/framekit` | `packages/framekit/` | Runtime reutilizable, puntos de entrada públicos, hoja de estilos y la CLI `framekit`. |
| `@mauriciodmo/create-framekit` | `packages/create-framekit/` | El creador de proyectos `create-framekit` y la plantilla canónica para consumidores. |

El workspace raíz, `apps/studio/` y `apps/docs/` son workspaces privados del
repositorio. No son paquetes públicos adicionales y no deben tratarse como
dependencias de consumidores publicables. Consulta la [arquitectura de paquetes](/es/contributors/architecture/packages)
para conocer la propiedad y la [guía de exportaciones de paquetes](/es/contributors/distribution/package-exports)
para conocer el límite del consumidor.

## Compila en el orden de los paquetes

Ejecuta las compilaciones de los paquetes públicos desde la raíz del repositorio:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
```

La compilación de FrameKit genera sus declaraciones de tipos, archivos ESM
y CSS, y después ejecuta su comprobación de distribución. La compilación del
creador genera `dist/cli.js` y ejecuta las mismas comprobaciones de los destinos
de distribución. Compila primero el paquete runtime para que cualquier
consumidor del workspace o proyecto generado resuelva sus archivos `dist/`
actuales.

`pack` también ejecuta la compilación `prepack` de cada paquete. El orden de
compilación explícito sigue siendo útil al inspeccionar artefactos o diagnosticar
una compilación de paquete obsoleta. El [flujo de trabajo de contribuidores](/es/contributors/development/workflow)
cubre las comprobaciones específicas de los workspaces, mientras que las
[pruebas para contribuidores](/es/contributors/testing) describen los niveles de
pruebas más amplios.

## Qué contienen los tarballs

Las listas `files` de los manifiestos definen los límites de los paquetes.

`@mauriciodmo/framekit` incluye:

- `bin/`, incluido `bin/framekit.js`;
- `dist/`, incluidos los puntos de entrada públicos compilados y `dist/styles.css`;
- `README.md`; y
- `LICENSE`.

La prueba smoke comprueba entradas requeridas representativas, como
`package/dist/index.js`, `package/dist/client.js`,
`package/dist/client.d.ts`, `package/dist/server.js`,
`package/dist/server.d.ts` y `package/dist/styles.css`.

`@mauriciodmo/create-framekit` incluye:

- `dist/`, incluido `dist/cli.js`;
- `template/`, incluido su manifiesto de paquete, `.dockerignore`, `Dockerfile`,
  `next.config.ts`, `.env.example` y los seis archivos canónicos de `src/app`;
- `README.md`; y
- `LICENSE`.

Su manifiesto excluye `node_modules`, `.next`, `.framekit`,
`.framekit-data`, `public/framekit`, `src/generated/framekit`,
`*.tsbuildinfo` y `next-env.d.ts` de la plantilla. Estas exclusiones mantienen
los datos generados, locales o de runtime fuera del archivo del creador.

## Inspecciona antes de publicar

Ejecuta la verificación de artefactos local independiente de la versión desde la
raíz del repositorio:

```bash
pnpm smoke:tarballs
```

El script empaqueta ambos paquetes públicos en un directorio temporal fuera del
checkout e inspecciona los archivos extraídos. Comprueba que:

- existan los archivos esperados, los destinos de exportación del manifiesto y los binarios ejecutables;
- los destinos de los paquetes permanezcan dentro de su paquete y los binarios tengan shebangs;
- no estén presentes pruebas, `node_modules`, secretos, credenciales, claves privadas, archivos de bases de datos, binarios de navegador ni `.framekit-data`;
- los archivos del archivo no contengan ninguna ruta del checkout ni referencias `workspace:`, `link:` o `file:` locales; y
- las exportaciones públicas y los límites del runtime de cliente/servidor se resuelvan desde el paquete core empaquetado.

El mismo comando también prueba consumidores fuera del checkout. Cubre un
consumidor independiente instalado desde el tarball core y un consumidor
generado a partir del tarball del creador. Consulta [consumidor generado](/es/contributors/distribution/generated-consumer)
para conocer el ciclo de vida de los comandos. Esta es una verificación de
tarballs local; no descarga un navegador ni compila y ejecuta una imagen de
Docker.

## Mantén separadas las verificaciones de publicación

La prueba smoke local del tarball y la prueba smoke del registro posterior a la
publicación responden preguntas diferentes. La verificación local inspecciona
exactamente lo que se empaquetó antes de publicar. La verificación del registro
instala especificaciones exactas de paquetes desde npm después de publicar,
comprueba sus versiones resueltas y los dist-tags previstos, resuelve las
exportaciones públicas, crea un consumidor aislado y ejecuta la secuencia de
generación, comprobación, compilación e inicio en modos abierto y autenticado,
incluido el inicio de sesión autenticado, la creación de un token y el
renderizado PNG. Registra `CORE_SPEC`,
`CREATOR_SPEC`, `EXPECTED_FRAMEKIT_DIST_TAG`, `EXPECTED_CREATE_FRAMEKIT_DIST_TAG`,
las versiones resueltas, las versiones del runtime, la marca de tiempo y PASS o
FAIL. Usa especificaciones exactas del registro, no rangos; una carga correcta
no equivale a una verificación correcta del registro.

El versionado, el changelog y los procedimientos de publicación pertenecen a la
[guía de releases](/es/contributors/releases), la [guía de versionado y changelog](/es/contributors/releases/versioning-and-changelog)
y la [guía de publicación](/es/contributors/releases/publishing) aprobadas. Esta
sección de distribución se mantiene centrada en los artefactos y las
verificaciones de consumidores que usan esos procedimientos.

Docker es una comprobación operativa independiente respaldada por el registro:

```bash
pnpm smoke:docker -- <exact-published-framekit-version>
```

Compila el consumidor canónico en una imagen de Docker a partir de la versión
exacta de FrameKit publicada, inicia contenedores explícitos en modo abierto y
autenticado, comprueba la autenticación y la representación PNG, y comprueba la
persistencia al reemplazar el contenedor. No
sustituye la prueba smoke local del tarball, las pruebas unitarias, las
comprobaciones de tipos ni las pruebas E2E del navegador. Compara las
verificaciones en [E2E y pruebas smoke](/es/contributors/testing/e2e-and-smoke).

Para consultar el mapa exacto de exportaciones y las reglas de importación de los
paquetes, usa [exportaciones de paquetes](/es/contributors/distribution/package-exports).
