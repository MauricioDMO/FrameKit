---
title: Límites de importación
description: Mantén los consumidores de FrameKit, las capas de runtime, el código del cliente, el código del servidor, las herramientas y la salida generada dentro de sus límites compatibles.
---

# Límites de importación

Estas reglas describen el contrato actual del repositorio para quienes
contribuyen. El manifiesto del paquete, los entrypoints del código fuente, el
consumidor generado y las pruebas relevantes son la autoridad cuando una página
o un ejemplo no coincide con el código.

## Usa los entrypoints publicados del paquete

Los consumidores importan el paquete público, no su árbol de código fuente. El
`packages/framekit/package.json` actual publica estos entrypoints exactos:

| Especificador del consumidor | Exportación del manifiesto | Límite |
| --- | --- | --- |
| `@mauriciodmo/framekit` | `.` | Contratos de la base y de las plantillas principales. |
| `@mauriciodmo/framekit/editor` | `./editor` | Componentes de Editor del lado del cliente, incluido `TemplateCanvas`. |
| `@mauriciodmo/framekit/client` | `./client` | Fábrica privada de componentes de renderizado del lado del cliente. |
| `@mauriciodmo/framekit/qr` | `./qr` | Componente QR seguro para navegador usado al renderizar plantillas. |
| `@mauriciodmo/framekit/next` | `./next` | Configuración de compilación de Next.js. |
| `@mauriciodmo/framekit/studio` | `./studio` | Composición y mensajes de Studio del lado del cliente. |
| `@mauriciodmo/framekit/studio/root` | `./studio/root` | Fábricas de documentos y páginas del lado del servidor para las rutas de Studio. |
| `@mauriciodmo/framekit/dev` | `./dev` | Descubrimiento basado en Node, generación de código, observación y utilidades de desarrollo. |
| `@mauriciodmo/framekit/server` | `./server` | Contratos de acceso, imágenes y renderizado exclusivos de Node/servidor. |
| `@mauriciodmo/framekit/styles.css` | `./styles.css` | Hoja de estilos publicada. |

El proyecto generado usa sus propios alias `@framekit/generated/*` para los
módulos generados y los entrypoints publicados de FrameKit para el código
reutilizable. Consulta la
[referencia de la API del paquete para usuarios](/es/users/reference/package-api)
para conocer los símbolos y ejemplos de consumidores, en lugar de duplicar
estos contratos aquí.

## Conserva la dirección de las capas

FrameKit separa el código reutilizable de base, la interfaz de producto, el
runtime de servidor y el tooling:

- **Foundation** incluye el entrypoint raíz del paquete y los módulos de plantillas, campos, validación, datos, tipos y Markdown principales. Foundation no depende de Editor, Studio, Server ni Tooling.
- **Editor, QR y Studio** son capas orientadas al navegador. `TemplateCanvas` cruza el límite público mediante `./editor` y el renderizado QR lo hace mediante `./qr`; los consumidores usan los entrypoints publicados en lugar de rutas internas.
- **Server** posee el acceso exclusivo de Node/servidor, las imágenes, los trabajos de renderizado, el navegador y el comportamiento HTTP expuestos mediante `./server`. Mantén esta fachada fuera de los bundles del navegador y de los componentes del cliente.
- **Tooling** posee el descubrimiento, la generación de código, la observación de archivos, el servidor de desarrollo y el ciclo de vida de la CLI mediante `./dev` y la CLI del paquete. Mantén su trabajo con el sistema de archivos y los procesos fuera de los grafos reutilizables del cliente.

El entrypoint público es un límite, no un atajo para evitar la propiedad de las
capas. Cuando un cambio cruza capas, actualiza al responsable y su fachada
compatible en lugar de importar un archivo de implementación de otra capa.

La configuración de autenticación pertenece al servidor. `FRAMEKIT_AUTH_ENABLED`
solo se lee en los límites de Server, Studio-root y servidor de desarrollo; los
consumidores no deben inferir autenticación de `NODE_ENV`, las credenciales ni
SQLite, ni exponer el almacenamiento de acceso desde el código cliente.

## Mantén separados los grafos del cliente y del servidor

El código del cliente no importa `./server` en tiempo de ejecución. Se permiten
las importaciones exclusivamente de tipos (`import type`) de tipos de payload del
servidor, como `ResolvedRenderPayload`, porque no añaden una dependencia de
ejecución. Usa `@mauriciodmo/framekit/client`, `@mauriciodmo/framekit/editor` o
`@mauriciodmo/framekit/qr` detrás del límite orientado al navegador correspondiente,
y mantén `@mauriciodmo/framekit/server` en los módulos de rutas de Node/servidor.
El código del servidor prepara el payload de renderizado; el componente de
renderizado del cliente recibe ese payload en su límite de cliente.

Los módulos integrados de Node como `node:fs`, `node:path`, `node:crypto` y
`node:module` permanecen en Server y Tooling cuando corresponde. No introduzcas
dependencias de Node o Playwright en Foundation, Editor, QR ni los bundles del
cliente orientados al navegador.

## Trata el código generado como salida

Los registros generados, las vinculaciones del cliente, los assets de plantilla
copiados y la salida de compilación son salida de integración, no una segunda
implementación mantenida. El código fuente mantenido permanece en las rutas de
plantillas y marcas del consumidor y en el código fuente del paquete que genera
esas salidas.

Ejecuta el comando relevante de FrameKit para volver a generar la salida después
de cambiar su código fuente. No edites manualmente `src/generated/framekit/`,
`public/framekit/`, `.framekit/` ni la salida de compilación. La [guía de
arquitectura del código generado](/es/contributors/architecture/generated-code)
describe el flujo del repositorio; la [referencia de archivos
generados](/es/users/reference/generated-files) describe las rutas orientadas al
consumidor.

## Revisión de límites

Antes de fusionar un cambio transversal, comprueba que:

- las importaciones del consumidor usan uno de los entrypoints del manifiesto anteriores;
- Foundation sigue sin dependencias de Editor, Studio, Server ni Tooling;
- los grafos del cliente no importan `./server` ni módulos integrados de Node en tiempo de ejecución; las importaciones exclusivamente de tipos (`import type`) de tipos de payload del servidor están permitidas;
- los módulos integrados de Node permanecen en Server o Tooling cuando el runtime los necesita;
- `TemplateCanvas` se consume mediante `./editor`;
- los archivos generados se volvieron a generar en lugar de editarse; y
- los detalles orientados al consumidor enlazan a la [referencia de la API del paquete para usuarios](/es/users/reference/package-api).

La [guía de arquitectura](/es/contributors/architecture) ofrece el mapa más
amplio del workspace y del runtime. Úsala junto con el [desarrollo
local](/es/contributors/getting-started/local-development) cuando un cambio de
límite necesite una verificación específica o de integración.
