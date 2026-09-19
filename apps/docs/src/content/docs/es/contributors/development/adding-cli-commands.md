---
title: Añadir comandos de CLI
description: Amplía las CLI de FrameKit y create-framekit con sintaxis probada, comportamiento de uso y validación del consumidor.
---

# Añadir comandos de CLI

FrameKit publica dos binarios con responsables y contratos de argumentos diferentes.
Cambia conjuntamente el parser, el despacho, el texto de uso, las pruebas y la
ruta del consumidor.

## Conocer ambas CLI

| Binario | Entrada de código fuente y compilación | Forma actual del comando |
| --- | --- | --- |
| `framekit` | `packages/framekit/src/tooling/cli/index.ts` -> `dist/cli.js`, envuelto por `bin/framekit.js` | `generate`, `check`, `dev`, `build`, `start` y `browser install [--with-deps]` |
| `create-framekit` | `packages/create-framekit/src/cli.ts` -> `dist/cli.js` | <code>[project-directory] [-y&#124;-n]</code> y `update-skills [project-directory]` |

La CLI de FrameKit usa `process.cwd()` como raíz del proyecto; sus comandos
estándar rechazan los argumentos adicionales y `browser install` acepta
opcionalmente `--with-deps`. Su comando de navegador delega en la CLI de
Playwright incluida en el paquete. El creador analiza un directorio de proyecto
opcional y las opciones `-y` o `-n`; `update-skills` acepta su propio directorio
de proyecto opcional.

## Actualizar un comando de forma segura

1. Define los argumentos aceptados, las formas no válidas, el comportamiento de salida y el texto de uso
   antes de cambiar el despacho.
2. Actualiza el parser propietario y la rama del comando. Mantén el trabajo con
   el sistema de archivos del proyecto en el helper del comando en lugar de
   duplicarlo en el parser.
3. Mantén alineados el binario del manifiesto del paquete y la entrada de compilación.
   Ejecuta la compilación del paquete para probar el comando tanto mediante su salida
   compilada como mediante su fuente.
4. Actualiza la referencia de CLI orientada a usuarios correspondiente cuando
   cambie la sintaxis pública, sin convertir el flujo de trabajo de contribuidores
   en una segunda referencia de API.

## Probar la sintaxis y el comportamiento

Para `framekit`, la suite basada en `spawn` de
`packages/framekit/src/tooling/cli/__tests__/cli.test.ts` cubre argumentos
faltantes, desconocidos y adicionales, formas no válidas del navegador, fallos
de comandos y comportamientos exitosos de generación, comprobación e inicio. La
delegación del navegador tiene cobertura específica en `browser.test.ts`; los
requisitos del runtime tienen cobertura en `runtime.test.ts`.

Para `create-framekit`, mantén la cobertura de los helpers del proyecto en
`packages/create-framekit/src/__tests__/cli.test.ts` y la cobertura de
versiones del runtime en `runtime.test.ts`. Añade casos explícitos de parser y uso
siempre que cambie un comando u opción del creador. Cubre las formas aceptadas,
las opciones conflictivas o desconocidas, los directorios faltantes, los
códigos de salida y el mensaje que se muestra al usuario. Si el parser sigue
siendo privado, pruébalo mediante el `main` exportado o el binario compilado en
lugar de debilitar el contrato de comandos público.

Ejecuta las suites enfocadas desde la raíz del repositorio:

```bash
pnpm --filter @mauriciodmo/framekit exec vitest run src/tooling/cli
pnpm --filter @mauriciodmo/create-framekit test
```

## Validar un consumidor real

Una prueba de CLI que se ejecuta en un directorio temporal es útil, pero no
demuestra que los binarios empaquetados, los destinos del manifiesto y el
consumidor generado sean compatibles. Para cambios en cualquiera de las dos
CLI públicas, ejecuta:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm smoke:tarballs
```

La prueba smoke del tarball crea consumidores aislados, instala los paquetes,
resuelve las exportaciones públicas, ejecuta `create-framekit` y prueba los
comandos `framekit generate`, `check`, `build` y `start` del proyecto generado.
Ejecuta también `pnpm test:e2e` cuando el comando cambie el comportamiento
orientado al navegador.
