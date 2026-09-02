# Referencia CLI de FrameKit

## Uso

```
framekit <generate|check|dev|build|start>
```

Todos los comandos `framekit` usan `process.cwd()` como raíz del proyecto y rechazan argumentos posicionales u opciones adicionales. No hay flags `--help`, `--version` ni archivo de configuración. No existe forma de especificar un directorio de plantillas alternativo; FrameKit siempre explora `src/templates`.

---

## `create-framekit`

`create-framekit` es la CLI para crear proyectos, distribuida como `@mauriciodmo/create-framekit`. Acepta un directorio de proyecto opcional y las banderas `-y` y `-n`:

```sh
create-framekit [directorio-del-proyecto] [-y|-n]
```

La CLI copia la plantilla inicial a un directorio nuevo, instala dependencias opcionalmente y, cuando se selecciona la instalación y termina correctamente, genera el catálogo de plantillas. También puede inicializar Git opcionalmente. No sobrescribe un directorio existente, aunque esté vacío.

Sin `-y` ni `-n`, si no proporcionas el directorio, lo solicita. Detecta `pnpm` o `npm` desde el entorno y te pide elegir cuando no puede detectarlos. Las preguntas restantes son:

- ¿Instalar dependencias? Por defecto: sí.
- ¿Ejecutar `pnpm approve-builds` al usar pnpm e instalar dependencias? Por defecto: sí.
- ¿Inicializar un repositorio Git y crear un commit inicial? Por defecto: sí.

`-y` acepta todas las preguntas y `-n` las rechaza todas. Si se usa cualquiera de las dos banderas sin un directorio, se crea `./framekit`. En este modo, si no se detecta el gestor de paquetes, se usa `pnpm` sin preguntar. Las banderas `--y` y `--n` no son válidas.

### `create-framekit update-skills`

Actualiza las skills oficiales de un proyecto existente:

```sh
create-framekit update-skills [directorio-del-proyecto]
```

```sh
pnpm dlx @mauriciodmo/create-framekit update-skills
npm exec --yes @mauriciodmo/create-framekit -- update-skills ./my-framekit
```

Si no se proporciona un directorio del proyecto, el valor predeterminado es `.` (el directorio de trabajo actual). El comando copia las skills oficiales incluidas en el paquete `create-framekit` instalado y reemplaza los directorios de skills oficiales. También elimina los directorios heredados conocidos: `framekit-project-setup`, `framekit-studio-usage` y `framekit-template-creation`. Los demás directorios de skills, incluidos los personalizados, se conservan. El comando no actualiza los archivos de la aplicación.

Para desarrollar el repositorio localmente, compila y ejecuta la CLI sin publicarla:

```sh
pnpm --filter @mauriciodmo/create-framekit build && node packages/create-framekit/dist/cli.js ./my-local-framekit
```

Los colores se activan en la salida de terminal y pueden desactivarse con `NO_COLOR=1`.

---

## `framekit generate`

Escanea `src/templates` en busca de directorios de plantillas y genera el registro de plantillas local del proyecto. Este comando es opcional: `dev`, `check` y `build` generan automáticamente; `start` no genera. Consulta el [issue #12 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/12).

El escaneo registra cada directorio no oculto y cuyo nombre no comienza por guion bajo que contiene un archivo `template.tsx`. Los subdirectorios dentro de un directorio de plantilla no se recorren; los componentes internos, las definiciones y los recursos no se tratan como plantillas hijas.

Si no se encuentra ninguna plantilla, el comando termina con código 1 e imprime un mensaje de error identificando el directorio vacío. El archivo de salida se escribe únicamente cuando su contenido ha cambiado.

La salida se escribe en `src/generated/framekit/templates.ts`. El módulo generado tiene una única exportación de tiempo de ejecución, `templates: TemplateRegistryEntry[]`. Cada entrada incluye `slug`, `segments`, metadata `meta` validada, `width` y `height`, `variants`, `variantKeys` en el orden de declaración, un manifiesto `assets` y una función `load` lazy para la definición de la plantilla. El título de una plantilla está disponible como `meta.title`; no existen las salidas superiores `title`, `templateManifest` ni `templateRegistry`. La generación también escribe `src/generated/framekit/brands.ts` para el catálogo opcional de marcas. Esta salida generada en el código fuente es distinta de `.framekit/next`, que es la salida de build de Next.js configurada mediante `distDir`.

Los assets se leen desde `assets/common` y `assets/<variant>`. Los archivos de imagen compatibles se copian a `public/__framekit/templates/<slug>/...`, y las URL del manifiesto apuntan a esos archivos copiados. Se rechazan los subdirectorios de assets no ocultos, los nombres inválidos y las claves duplicadas; cada regeneración elimina primero el árbol de assets generado anterior.

Durante la generación, cada `template.tsx` descubierto se importa y valida con `tsx`. Los fallos de importación y de validación de la definición reportan la ruta del `template.tsx` afectado.

```sh
framekit generate
# FrameKit: 3 templates
```

---

## `framekit check`

Valida la definición de cada plantilla y su contenido resuelto en todas las variantes declaradas.

El comando primero ejecuta `generate`, que importa y valida cada plantilla mediante `tsx`, para asegurar que el registro esté actualizado. Luego crea un directorio temporal de comprobación dentro de `.framekit/` y escribe un archivo TypeScript temporal que importa cada plantilla mediante el `tsx` incluido. Esto usa el `tsconfig` del proyecto consumidor, por lo que los imports TypeScript, la sintaxis TSX y los aliases de ruta se resuelven igual que durante el desarrollo.

Para cada plantilla, `validateTemplateDefinition` verifica la estructura canónica de la definición: metadata, dimensiones (el ancho y el alto deben ser enteros positivos finitos), fields, variantes, contenido con solo valores de fields y la función de renderizado. Para cada variante declarada en la definición, `resolveTemplateData` resuelve los datos de la plantilla sin ediciones del usuario (con un objeto de datos de usuario vacío), y `validateTemplateData` verifica los valores resueltos: los fields obligatorios están presentes, los fields numéricos respetan las restricciones de mínimo, máximo y `step`, y los fields de color usan valores hexadecimales válidos.

El directorio temporal de comprobación se elimina siempre al terminar, tanto si la comprobación pasa como si falla.

Los errores estructurados se reportan por plantilla, por variante y por field:

```
/ruta/a/src/templates/example/template.tsx: content.en.title: required
/ruta/a/src/templates/example/template.tsx: content.en.count: number_too_small (min: 3)
```

El proceso de comprobación termina con código `1` cuando reporta errores de validación. Los errores de definición usan el mismo formato `archivo: mensaje`, por ejemplo `.../template.tsx: render must be a function`.

`framekit check` no es una verificación de tipos TypeScript ni llama a `render` ni prueba la exportación a PNG. Usa `next build` para la verificación de tipos.

```sh
framekit check
```

---

## `framekit dev`

Inicia un servidor de desarrollo con actualizaciones en vivo del registro de plantillas.

Antes de iniciar el servidor, el comando ejecuta `generate` para producir el registro inicial. Luego inicia un servidor de desarrollo de Next.js con Turbopack y manejo personalizado del servidor HTTP, incluidos los cambios de protocolo de WebSocket para la sustitución de módulos en caliente.

El observador de plantillas monitorea todos los archivos y directorios bajo `src/templates`. Las adiciones, ediciones y eliminaciones activan la regeneración. Los cambios en cualquier ruta bajo `src/brand` también activan la regeneración; las demás rutas bajo `src` no lo hacen. Solo una generación se ejecuta a la vez; si llega un cambio mientras una generación está en curso, el cambio pendiente es recogido por la generación en curso antes de terminar.

FrameKit resuelve directamente el hostname y el puerto del servidor de desarrollo usando las siguientes variables de entorno (en orden de prioridad):

| Variable        | Valor por defecto | Notas                                                      |
| --------------- | ----------------- | ---------------------------------------------------------- |
| `FRAMEKIT_HOST` | `HOST`            | Cadena de fallback: `FRAMEKIT_HOST` → `HOST` → `localhost` |
| `PORT`          | `3000`            | Debe ser un entero entre 1 y 65535                         |

El comando gestiona `SIGINT` y `SIGTERM` correctamente, cerrando el servidor antes de terminar.

```sh
FRAMEKIT_HOST=0.0.0.0 PORT=4000 framekit dev
# FrameKit Studio: http://0.0.0.0:4000
```

---

## `framekit build`

Ejecuta la validación y luego construye la aplicación Next.js de producción.

El comando primero ejecuta `framekit check`, por lo que el registro se genera automáticamente y toda la validación ocurre antes de la construcción de Next.js. Si la validación falla, la construcción se aborta y el paso de build de Next.js nunca se ejecuta. Si la validación pasa, se ejecuta `next build`.

Después de una construcción exitosa, el directorio de salida del servidor standalone se ubica buscando un archivo `server.js` cuya salida trazada adyacente contenga `.framekit/next/BUILD_ID`. Debe encontrarse exactamente uno; el comando falla si se descubren cero o más de un candidato.

Una vez localizado el servidor standalone, los siguientes activos se copian junto a él:

- Directorio `public/`, si existe
- Directorio `.framekit/next/static/`

Esto asegura que el servidor standalone pueda servir activos estáticos sin un CDN.

```sh
framekit build
```

---

## `framekit start`

Inicia el servidor standalone de producción. No genera el registro de plantillas.

El comando busca exactamente un archivo `server.js` dentro de `.framekit/next/standalone/` cuya salida trazada adyacente contenga un archivo `BUILD_ID`. Si se encuentran cero o más de un candidato, el comando falla con un error. FrameKit no resuelve aquí opciones de host o puerto de producción: inicia `server.js` con el entorno heredado del proceso padre. El servidor standalone generado por Next lee `PORT`, `HOSTNAME` y `KEEP_ALIVE_TIMEOUT`; `FRAMEKIT_HOST` y `HOST` no se asignan a `HOSTNAME`. `start` no genera ni copia la salida del registro; solo localiza e inicia el servidor standalone existente.

El servidor standalone se lanza como proceso hijo con el entorno heredado. Los códigos de salida y las señales se propagan al proceso padre.

```sh
framekit start
```

---

## Comportamiento General de la CLI

- Todos los comandos operan sobre `process.cwd()` como raíz del proyecto.
- No hay flags `--help`, `--version` ni archivo de configuración.
- No existe forma de especificar un directorio de plantillas alternativo.
- `generate` es opcional; `dev`, `check` y `build` generan automáticamente, mientras que `start` no genera.
- Los procesos hijos heredan el entorno y stdio del padre.
- Los archivos temporales se limpian incluso en caso de fallo.

## Gates operativos de verificación

Los gates permanentes del repositorio son versionless: Ubuntu ejecuta las comprobaciones completas en Node.js `22.13.0` y `24` con pnpm `11.14.0`; Windows ejecuta comprobaciones focalizadas del consumidor generado en Node.js `22.13.0`; y Ubuntu ejecuta un único flujo crítico de Studio en Chromium con Node.js `22.13.0`. Los comandos correspondientes del repositorio incluyen `pnpm check:runtime`, `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm test:e2e` y la inspección dry de paquetes con `pnpm --filter <package> pack --dry-run`.

Las comprobaciones de distribución están separadas. Durante la preparación del release, los maintainers eligen las versiones de los paquetes y ejecutan el smoke de tarballs reales en un consumidor aislado; después de publicar, se proporcionan especificaciones npm exactas y el dist-tag previsto para un smoke de registro separado antes de promocionar. Los gates versionless del repositorio no seleccionan ni codifican una versión de release. Consulta [Pruebas y Distribución](../development/testing-and-distribution.md) para las secuencias reproducibles.

[English](../../en/reference/cli.md) | [Español](./cli.md)
