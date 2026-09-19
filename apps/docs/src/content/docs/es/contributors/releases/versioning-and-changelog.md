---
title: Versionado y registro de cambios
description: Versiona los paquetes públicos de FrameKit de forma independiente y mantén el registro de cambios compartido alineado con el trabajo publicado.
---

# Versionado y registro de cambios

FrameKit tiene dos manifiestos de paquetes públicos y un registro de cambios raíz compartido. Mantén el desarrollo sin versiones y, después, asigna una versión únicamente al paquete o a los paquetes que formen parte de la publicación.

## Versiones de los paquetes

| Manifiesto | Estado del paquete | Responsabilidad de la versión |
| --- | --- | --- |
| `packages/framekit/package.json` | Público | Versión de `@mauriciodmo/framekit`. |
| `packages/create-framekit/package.json` | Público | Versión de `@mauriciodmo/create-framekit`. |
| `package.json` | Espacio de trabajo raíz privado | No tiene una versión de publicación de paquete público. |

Las versiones de los paquetes públicos son independientes. Un cambio limitado a
`@mauriciodmo/create-framekit` no requiere cambiar la versión del paquete core.
Cambia la versión del core cuando la plantilla del creador u otro artefacto
publicado necesite una nueva API del core. Si se publican ambos paquetes, publica
`@mauriciodmo/framekit` antes que `@mauriciodmo/create-framekit` para que el
consumidor generado pueda resolver el paquete core requerido.

La plantilla copiada del creador declara su dependencia de
`@mauriciodmo/framekit` en `packages/create-framekit/template/package.json`. Mantén
esa dependencia en la versión publicada actual del core, a menos que la plantilla
requiera una nueva API del core. Cuando adopte una nueva API del core, establece
esa dependencia exacta en la versión publicada del core antes de publicar
`@mauriciodmo/create-framekit`. Esa dependencia es una dependencia del proyecto
consumidor, no un motivo para versionar el paquete core con cada cambio
exclusivo del creador.

El flujo local de smoke con tarball y el flujo de smoke del registro posterior a la
publicación reemplazan la dependencia de FrameKit del consumidor generado por un
paquete core exacto para realizar pruebas aisladas. Por lo tanto, no validan
por sí mismos la declaración de la plantilla; verifica el manifiesto de la plantilla
antes de publicar el paquete del creador.

No selecciones ni documentes una versión futura por adelantado. Durante la
preparación de una publicación, actualiza únicamente el manifiesto del paquete
seleccionado y, después, ejecuta las [comprobaciones de publicación](/es/contributors/releases/publishing) desde la raíz del repositorio.

## Responsabilidad del registro de cambios

Actualmente, el repositorio mantiene un único `CHANGELOG.md` raíz; no utiliza un
archivo de registro de cambios separado para cada paquete público. Su registro de
desarrollo actual comienza con:

```text
## Unreleased

### Changed
```

Mientras el trabajo no tenga versión, añade los cambios visibles para el usuario al
registro compartido `Unreleased` y conserva el estilo de encabezados existente.
Revisa esas entradas durante la preparación de la publicación y mantén las entradas
relevantes para el paquete o los paquetes públicos que se publiquen. El registro de
cambios es un registro de los cambios del repositorio; no demuestra que se haya
publicado un paquete.

No copies una ejecución histórica de CI, un resultado de smoke ni una versión de
paquete al registro de cambios como contrato permanente de publicación. Las
comprobaciones actuales y su alcance pertenecen a la [guía de pruebas para colaboradores](/es/contributors/testing), la [guía de distribución](/es/contributors/distribution) y la [guía de publicación](/es/contributors/releases/publishing).

## Lista de comprobación del versionado

Antes de publicar:

1. Identifica qué paquete público cambió.
2. Revisa las entradas correspondientes de `Unreleased` en `CHANGELOG.md`.
3. Actualiza únicamente la versión del manifiesto del paquete público seleccionado.
4. Si la plantilla del creador necesita una nueva API del core, prepara primero el paquete core, establece la dependencia exacta de `@mauriciodmo/framekit` en `packages/create-framekit/template/package.json` en esa versión publicada del core y hazlo antes de publicar el paquete del creador.
5. Ejecuta `pnpm check:runtime` y, después, sigue la secuencia de compilación, empaquetado y smoke de la [guía de publicación](/es/contributors/releases/publishing).
