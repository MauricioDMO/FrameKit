---
title: Lanzamientos para contribuidores
description: Separa el desarrollo de FrameKit sin versionado de los lanzamientos de paquetes públicos y sus comprobaciones de verificación.
---

# Lanzamientos para contribuidores

El desarrollo de FrameKit no tiene versión hasta que se prepara un paquete público
para su publicación. El trabajo normal se acumula en el repositorio y en la sección
`Unreleased` de `CHANGELOG.md`; un lanzamiento es la operación separada de
versionar, empaquetar, publicar y verificar uno o ambos paquetes públicos.

## Alcance del lanzamiento

Solo estos paquetes son destinos de lanzamientos públicos:

| Paquete | Responsabilidad del lanzamiento |
| --- | --- |
| `@mauriciodmo/framekit` | El runtime reutilizable, los puntos de entrada públicos, la hoja de estilos y la CLI `framekit`. |
| `@mauriciodmo/create-framekit` | La CLI `create-framekit` y la plantilla canónica para consumidores. |

El workspace raíz, `apps/studio/` y `apps/docs/` son privados. No son paquetes
adicionales que deban publicarse. Confirma la propiedad y el límite de exportación en la
[guía de distribución](/es/contributors/distribution) antes de iniciar una
publicación.

Los dos paquetes públicos se versionan de forma independiente. Un lanzamiento de
`create-framekit` no requiere una nueva versión de `@mauriciodmo/framekit`, a
menos que la plantilla necesite una nueva API principal. Cuando la plantilla
adopte una nueva API principal, actualiza la dependencia exacta de
`@mauriciodmo/framekit` en
`packages/create-framekit/template/package.json` a la versión publicada antes
de publicar `@mauriciodmo/create-framekit`. Cuando se publiquen ambos paquetes,
publica primero FrameKit porque el proyecto generado depende de él. La [guía de
versionado y registro de cambios](/es/contributors/releases/versioning-and-changelog)
describe las responsabilidades del paquete y del registro de cambios.

Los flujos de smoke test del tarball local y del registro posteriores a la
publicación reemplazan la dependencia de FrameKit del consumidor generado por
un paquete principal exacto para realizar pruebas aisladas. Por lo tanto, no validan
por sí mismos la declaración publicada de la plantilla; inspecciona el manifiesto
de la plantilla como parte de la preparación del lanzamiento.

## Desarrollo sin versionado

Durante el desarrollo:

- no selecciones una futura versión de lanzamiento en la documentación ni en el
  trabajo de código fuente;
- mantén los cambios visibles para el usuario en el `CHANGELOG.md` raíz, bajo
  `Unreleased`;
- ejecuta las comprobaciones enfocadas del workspace propietario y las
  comprobaciones más amplias que requiera el cambio; y
- mantén alineados los cambios del paquete, del consumidor y de la salida
  generada sin tratar una compilación local o un resultado antiguo de CI como un
  resultado de lanzamiento.

El [flujo de trabajo de contribuidores](/es/contributors/development/workflow)
cubre el recorrido desde un checkout limpio y los comandos enfocados. La [guía
de pruebas para contribuidores](/es/contributors/testing) explica qué demuestra
cada nivel de verificación.

## Flujo de lanzamiento

Cuando se prepare realmente un lanzamiento, sigue este orden:

1. Identifica el paquete o los paquetes públicos modificados y revisa las
   entradas relevantes de `Unreleased`.
2. Actualiza únicamente el campo de versión en el manifiesto del paquete público
   de cada paquete incluido en el lanzamiento. No versionas el workspace raíz privado, Studio
   ni el workspace de documentación.
3. Ejecuta las comprobaciones locales de publicación de la [guía de
   publicación](/es/contributors/releases/publishing), incluidas las
   compilaciones de paquetes, las comprobaciones, la inspección de tarballs y
   los consumidores aislados.
4. Publica únicamente los tarballs de los paquetes públicos seleccionados usando
   un `dist-tag` de npm elegido para el lanzamiento que no sea el tag final de promoción.
5. Ejecuta la comprobación del registro posterior a la publicación y cualquier
   comprobación de Docker aplicable. Promueve cada paquete publicado a su
   `dist-tag` final solo después de que esas comprobaciones pasen.

El repositorio no tiene ningún flujo de trabajo de CI específico de lanzamientos ni
una política de ramas que añadir a este procedimiento. La [guía de CI](/es/contributors/testing/ci)
describe las comprobaciones que se ejecutan para los pushes y las pull requests,
mientras que [E2E y pruebas smoke](/es/contributors/testing/e2e-and-smoke)
establece la diferencia entre las comprobaciones del navegador, de tarball y de
Docker.

## Páginas de lanzamientos

| Página | Uso |
| --- | --- |
| [Versionado y registro de cambios](/es/contributors/releases/versioning-and-changelog) | Mantener independientes las versiones de los paquetes y mantener el registro de cambios compartido. |
| [Publicación](/es/contributors/releases/publishing) | Ejecutar las comprobaciones previas a la publicación, publicar los paquetes seleccionados y completar la verificación posterior a la publicación. |
