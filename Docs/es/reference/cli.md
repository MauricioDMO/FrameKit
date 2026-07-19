# Referencia CLI de FrameKit

## Uso

```
framekit <generate|check|dev|build|start>
```

Todos los comandos usan `process.cwd()` como raíz del proyecto. No hay flags `--help`, `--version` ni archivo de configuración. No existe forma de especificar un directorio de plantillas alternativo; FrameKit siempre explora `src/templates`.

---

## `framekit generate`

Escanea `src/templates` en busca de directorios de plantillas y genera un archivo de registro.

El escaneo registra cada directorio que contiene un archivo `template.tsx`. Los subdirectorios dentro de un directorio de plantilla no se recorren; los componentes internos, definiciones ni activos no se tratan como plantillas hijas.

Si no se encuentra ninguna plantilla, el comando termina con código 1 e imprime un mensaje de error identificando el directorio vacío. El archivo de salida se escribe únicamente cuando su contenido ha cambiado.

La salida se escribe en `.framekit/generated/templates.ts` con imports literales diferidos (lazy). En caso de éxito, el comando imprime la cantidad de plantillas encontradas.

```sh
framekit generate
# FrameKit: 3 plantilla(s)
```

---

## `framekit check`

Valida la definición de cada plantilla y su contenido resuelto en todas las regionales declaradas.

El comando primero ejecuta `generate` para asegurar que el registro esté actualizado. Luego crea un directorio temporal de comprobación dentro de `.framekit/` y escribe un archivo TypeScript temporal que importa cada plantilla mediante `tsx` bundler. Esto usa el `tsconfig` del proyecto consumidor, por lo que los imports TypeScript, la sintaxis TSX y los aliases de ruta se resuelven igual que durante el desarrollo.

Para cada plantilla, `validateTemplateDefinition` verifica la estructura de la definición: dimensiones (ancho y alto deben ser enteros positivos finitos), campos, contenido y la función render. Para cada regional declarada en la definición, `resolveTemplateData` resuelve los datos de la plantilla sin ediciones del usuario (objeto de datos de usuario vacío), y `validateTemplateData` verifica los valores resueltos: campos requeridos presentes, campos numéricos respetan las restricciones min/max, y campos URL son URLs válidas.

El directorio temporal de comprobación se elimina siempre al terminar, tanto si la comprobación pasa como si falla.

Los errores estructurados se reportan por plantilla, por regional y por campo:

```
/ruta/a/src/templates/example/template.tsx: content.en.title: required
/ruta/a/src/templates/example/template.tsx: content.en.count: number_too_small (min: 3)
/ruta/a/src/templates/example/template.tsx: content.es.url: invalid_url
```

El proceso de comprobación termina con código `1` cuando reporta errores de validación. Los errores de definición usan el mismo formato `archivo: mensaje`, por ejemplo `.../template.tsx: render must be a function`.

`framekit check` no es una verificación de tipos TypeScript ni llama a `render` ni prueba la exportación a PNG. Usa `next build` para la verificación de tipos.

```sh
framekit check
```

---

## `framekit dev`

Inicia un servidor de desarrollo con actualizaciones en vivo del registro de plantillas.

Antes de iniciar el servidor, el comando ejecuta `generate` para producir el registro inicial. Luego inicia un servidor de desarrollo Next.js con Turbopack y un servidor HTTP personalizado que maneja solicitudes HTTP y actualizaciones WebSocket para Hot Module Replacement.

El observador de plantillas monitorea `src/templates` solo para cambios estructurales: un nuevo archivo `template.tsx`, un archivo `template.tsx` eliminado, o un directorio nuevo o eliminado bajo `src/templates`. Las ediciones al contenido de un `template.tsx` existente no activan regeneración; Next HMR gestiona ese contenido automáticamente. Cuando se detecta un cambio estructural, la regeneración se aplaza 150ms (debounce). Solo una generación se ejecuta a la vez; si llega un cambio estructural mientras una generación está en curso, el cambio pendiente es recogido por la generación en curso antes de terminar.

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

El comando primero ejecuta `framekit check`. Si la validación falla, la construcción se aborta y el paso de build de Next.js nunca se ejecuta. Si la validación pasa, se ejecuta `next build`.

Después de una construcción exitosa, el directorio de salida del servidor standalone se ubica buscando un archivo `server.js` cuyo archivo `.framekit/next/BUILD_ID` hermano exista. Debe encontrarse exactamente uno; el comando falla si se descubren cero o más de un candidato.

Una vez localizado el servidor standalone, los siguientes activos se copian junto a él:

- Directorio `public/`, si existe
- Directorio `.framekit/next/static/`

Esto asegura que el servidor standalone pueda servir activos estáticos sin un CDN.

```sh
framekit build
```

---

## `framekit start`

Inicia el servidor standalone de producción.

El comando busca exactamente un archivo `server.js` dentro de `.framekit/next/standalone/` cuya salida trazada adyacente contenga un archivo `BUILD_ID`. Si se encuentran cero o más de un candidato, el comando falla con un error. FrameKit no resuelve aquí opciones de host o puerto de producción: inicia `server.js` con el entorno heredado del proceso padre. El servidor standalone generado por Next lee `PORT`, `HOSTNAME` y `KEEP_ALIVE_TIMEOUT`; `FRAMEKIT_HOST` y `HOST` no se asignan a `HOSTNAME`.

El servidor standalone se lanza como proceso hijo con el entorno heredado. Los códigos de salida y las señales se propagan al proceso padre.

```sh
framekit start
```

---

## Comportamiento General de la CLI

- Todos los comandos operan sobre `process.cwd()` como raíz del proyecto.
- No hay flags `--help`, `--version` ni archivo de configuración.
- No existe forma de especificar un directorio de plantillas alternativo.
- Los procesos hijos heredan el entorno y stdio del padre.
- Los archivos temporales se limpian incluso en caso de fallo.

[English](../../en/reference/cli.md) | [Español](./cli.md)
