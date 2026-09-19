---
title: Desarrollo para colaboradores
description: Conecta la arquitectura de FrameKit con el desarrollo local, la verificación, la distribución, los lanzamientos y el trabajo de documentación.
---

# Desarrollo para colaboradores

Usa esta página después de [primeros pasos para colaboradores](/es/contributors/getting-started)
y la [guía de arquitectura](/es/contributors/architecture). Conecta un cambio con
el área del repositorio que lo gestiona y con las comprobaciones que demuestran
que está listo. Los contratos de la API orientada a consumidores pertenecen a la
[referencia de la API del paquete para usuarios](/es/users/reference/package-api),
no a una segunda referencia de la API para colaboradores.

## Elige la siguiente guía

| Tema | Guía | Propósito |
| --- | --- | --- |
| Estructura del repositorio y capas de runtime | [Arquitectura](/es/contributors/architecture) | Ubicar la responsabilidad, los límites del código fuente, la salida generada y los flujos de runtime. |
| Dirección de las importaciones y puntos de entrada públicos | [Límites de importación](/es/contributors/development/import-boundaries) | Mantener a los consumidores en las exportaciones publicadas y separar las responsabilidades de Foundation, client, Server y Tooling. |
| Primera ejecución local y comandos enfocados | [Desarrollo local](/es/contributors/getting-started/local-development) | Instalar desde la raíz, conservar el orden de compilación de los paquetes y elegir los comandos del workspace. |
| Verificación enfocada | [Desarrollo local](/es/contributors/getting-started/local-development) | Empezar con los comandos enfocados del workspace responsable y las comprobaciones de la raíz. |
| Distribución de paquetes | [Arquitectura de paquetes](/es/contributors/architecture/packages) | Confirmar los paquetes públicos, los workspaces privados y las exportaciones del manifiesto antes de empaquetar. |
| Alcance del lanzamiento | [Contribuir a FrameKit](/es/contributors/) | Mantener el trabajo versionado dentro de la responsabilidad de los paquetes públicos y verificar el comportamiento orientado a consumidores. |
| Sitio de documentación | [Desarrollo local](/es/contributors/getting-started/local-development) | Ejecutar los comandos del workspace de documentación desde la raíz y mantener separados los públicos de colaboradores y usuarios. |

## Del código fuente al lanzamiento

1. Identifica el workspace y la capa de runtime responsables. Comienza por la [arquitectura del repositorio](/es/contributors/architecture/repository),
   la [arquitectura de paquetes](/es/contributors/architecture/packages) y los [límites de importación](/es/contributors/development/import-boundaries).
2. Cambia el código fuente mantenido, no los registros generados, los recursos copiados ni la
   salida de compilación. La [guía de código generado](/es/contributors/architecture/generated-code)
   explica qué comandos recrean esas salidas.
3. Ejecuta el comando enfocado del workspace responsable desde la raíz del repositorio.
   La [guía de desarrollo local](/es/contributors/getting-started/local-development)
   documenta el orden de compilación centrado en los paquetes y los scripts disponibles.
4. Ejecuta las comprobaciones apropiadas para el cambio. Comienza con los comandos enfocados de
   [desarrollo local](/es/contributors/getting-started/local-development) y añade comprobaciones
   más amplias de la raíz cuando el cambio atraviese workspaces.
5. Si el cambio afecta a un paquete público, una exportación o un consumidor generado, sigue la
   [arquitectura de paquetes](/es/contributors/architecture/packages) para confirmar la
   responsabilidad y las exportaciones del manifiesto antes de empaquetar. Mantén los ejemplos
   para consumidores enlazados a la [referencia de la API del paquete para usuarios](/es/users/reference/package-api).
6. Trata un lanzamiento versionado como un cambio de paquete público: confirma su responsabilidad
   y sus exportaciones en la [arquitectura de paquetes](/es/contributors/architecture/packages)
   antes de aplicar el proceso de lanzamiento del repositorio.
7. Para los cambios de documentación, usa [desarrollo local](/es/contributors/getting-started/local-development)
   para los comandos del workspace de documentación y mantén las instrucciones para consumidores
   en la [documentación para usuarios](/es/users/).

## Mantén separadas las responsabilidades

La ruta para colaboradores tiene varias perspectivas relacionadas, pero distintas:

- [Arquitectura](/es/contributors/architecture) explica dónde residen el comportamiento y la salida.
- [Límites de importación](/es/contributors/development/import-boundaries) explica qué
  importaciones y direcciones de capa están permitidas.
- [Desarrollo local](/es/contributors/getting-started/local-development) cubre los
  comandos enfocados, las compilaciones de documentación y el primer paso de verificación.
- [Arquitectura de paquetes](/es/contributors/architecture/packages) identifica los
  paquetes públicos y las exportaciones antes del trabajo de distribución o lanzamiento.
- [Documentación para usuarios](/es/users/) cubre los contratos para consumidores; las
  páginas para colaboradores mantienen separadas la responsabilidad del repositorio y el flujo de trabajo.

Usa la [referencia de la API del paquete para usuarios](/es/users/reference/package-api) y la
[referencia de archivos generados](/es/users/reference/generated-files) para los contratos de
consumidores y el comportamiento de los proyectos generados. Esta sección para colaboradores
registra la responsabilidad del repositorio y el flujo de trabajo sin duplicar esos contratos.
