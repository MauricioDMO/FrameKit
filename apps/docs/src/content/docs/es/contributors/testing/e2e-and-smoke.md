---
title: Pruebas E2E y smoke
description: Ejecuta comprobaciones del navegador Chromium y pruebas smoke de distribución para consumidores y contenedores de FrameKit.
---

# Pruebas E2E y smoke

Estas comprobaciones ejercitan límites que las suites locales de Vitest del
paquete no cubren. Ejecútalas desde la raíz del repositorio después de las
comprobaciones enfocadas del cambio.

## E2E de Chromium

Instala el navegador que usa el flujo de trabajo del repositorio y ejecuta el
script E2E raíz:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

El archivo `playwright.config.ts` raíz descubre `e2e/**/*.spec.ts` y usa un
dispositivo Desktop Chrome contra `http://localhost:3000`. Su comando de
servidor web compila `@mauriciodmo/framekit`, compila Studio e inicia el
servidor de Studio de producción con credenciales de administrador exclusivas
para pruebas y una base de datos en memoria.

### Flujo de Studio

`e2e/studio.spec.ts` comprueba que la ruta de inicio de sesión es pública y que
las rutas protegidas redirigen sin credenciales. El flujo autenticado abre la
ruta de la plantilla generada, comprueba los metadatos y las dimensiones
declaradas, cambia de variante, edita campos de texto, número, color, opción y
booleano, y verifica que un borrador de número incompleto no sustituya el valor
confirmado de la vista previa. Después descarga un PNG y comprueba su firma PNG,
encabezado y dimensiones declaradas.

### Flujo de la API de imágenes

`e2e/image-api.spec.ts` comprueba la API de imágenes de producción autenticada con una
sesión de Studio y un token de API. Verifica el acceso no autenticado rechazado,
los encabezados de respuesta PNG, la firma PNG y las dimensiones renderizadas.

El comando E2E es una comprobación del recorrido crítico en Chromium. No
promete cobertura de regresiones visuales de píxeles, una matriz completa de
navegadores, cobertura del portapapeles ni cobertura de todas las interacciones
de Studio. Firefox y WebKit no están configurados como gates de CI.

## Smoke de tarballs

Ejecuta el smoke de empaquetado independiente de la versión desde la raíz del
repositorio:

```bash
pnpm smoke:tarballs
```

El script de `tooling/smoke-tarballs.mjs` crea ambos tarballs públicos en un
directorio temporal fuera del checkout. Comprueba las entradas esperadas del
archivo, los destinos de los paquetes, los binarios y los límites de los
paquetes. Rechaza tests, secretos, binarios de navegador, referencias al
workspace, enlaces locales y rutas del checkout.

Después verifica dos recorridos de consumidores aislados:

- un consumidor independiente instalado desde el tarball de
  `@mauriciodmo/framekit`, incluida la resolución de exportaciones públicas,
  `framekit generate`, `framekit check` y `framekit build`;
- un consumidor creado por el tarball de `@mauriciodmo/create-framekit`, que
  incluye una instalación limpia, bindings generados, `generate`, `check`,
  `build` de producción, `start` independiente, disponibilidad HTTP,
  comprobaciones de autenticación y rutas, y un cierre limpio.

Este smoke demuestra que los artefactos empaquetados pueden instalarse y usarse
fuera del checkout. No es una suite de Vitest, no construye una imagen ni ejecuta
un contenedor de Docker y no descarga un navegador. Esas comprobaciones siguen
siendo independientes.

## Smoke de Docker

Ejecuta esta comprobación de lanzamiento con una versión exacta publicada de
FrameKit:

```bash
pnpm smoke:docker -- <exact-published-framekit-version>
```

`tooling/smoke-docker.mjs` resuelve esa versión exacta desde npm, copia el
consumidor canónico a un directorio temporal, crea un lockfile usando el
paquete publicado, compila la imagen de Docker generada y la ejecuta con un
volumen persistente. Comprueba el usuario `node` sin privilegios de la imagen y
el entrypoint `tini`, espera a que esté disponible, rechaza una solicitud de
imagen no autenticada, inicia sesión, crea un token de API y verifica una
respuesta PNG. También reemplaza el contenedor para comprobar el comportamiento
persistente de la cuenta y el token, y confirma que un trabajo de renderizado
temporal no se conserva después del reemplazo.

El smoke de Docker es un gate operativo de lanzamiento respaldado por el
registro. Requiere Docker y una versión exacta del paquete publicada, y no
sustituye las pruebas unitarias, la comprobación de tipos, el E2E del navegador
ni el smoke de tarballs. Tampoco proporciona regresión visual ni una matriz
completa de navegadores.

## Comparación de los gates

| Comprobación | Artefacto y entorno | Demuestra | No demuestra |
| --- | --- | --- | --- |
| Chromium E2E | Compilación de producción de Studio y Chromium real | Recorridos críticos de inicio de sesión, edición, API de imágenes y PNG | Igualdad de píxeles, gate del portapapeles, Firefox/WebKit ni todos los recorridos de la interfaz |
| Smoke de tarball | Tarballs públicos empaquetados localmente y consumidores temporales | Contenido de los paquetes, exportaciones públicas, compilación del consumidor generado y disponibilidad independiente | Comportamiento de la imagen Docker o instalación del navegador |
| Smoke de Docker | Paquete exacto de npm en la imagen Docker generada | Compilación del contenedor respaldada por el registro, inicio, persistencia, autenticación y comportamiento de la API PNG | Cobertura de pruebas unitarias, cobertura visual ni compatibilidad amplia con navegadores |

Para consultar la propiedad de los paquetes y los procedimientos para
consumidores generados, usa la [guía de distribución](/es/contributors/distribution)
y la [guía de consumidores generados](/es/contributors/distribution/generated-consumer).
