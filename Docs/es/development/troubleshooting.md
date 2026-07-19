# Resolución de problemas

Problemas comunes y sus soluciones al desarrollar con FrameKit.

---

## "No se encontraron plantillas" / catálogo vacío

FrameKit descubre las plantillas escaneando el directorio `src/templates`. Si el catálogo aparece vacío, puede haber varias causas.

**Causa: `src/templates` está vacío**

Si el directorio no contiene directorios de plantillas, `framekit generate` no encuentra nada que registrar. Añade al menos un directorio de plantilla con un archivo `template.tsx` dentro. Si `src/templates` no existe, la generación falla con un error del sistema de archivos `ENOENT`; primero crea el directorio.

**Causa: los directorios de plantillas no siguen kebab-case**

Cada directorio dentro de `src/templates` debe seguir el patrón `^[a-z0-9]+(?:-[a-z0-9]+)*$` — letras minúsculas, números y guiones simples entre segmentos. Un directorio llamado `MyTemplate`, `my_template` o `template.v1` hará que `framekit generate` falle con un error de segmento inválido.

**Causa: los directorios que comienzan con `_` o `.` se ignoran**

FrameKit omite cualquier directorio cuyo nombre empiece por `_` o `.`. Estos se tratan como rutas privadas o ignoradas. Renombra el directorio para quitar el prefijo.

**Causa: falta el archivo `template.tsx` dentro del directorio**

Cada directorio de plantilla debe contener un archivo `template.tsx`. Los directorios sin este archivo se tratan como carpetas de categoría y FrameKit desciende en ellos buscando un `template.tsx` más abajo, pero un directorio sin `template.tsx` en ningún nivel no aporta nada al catálogo.

**Solución: ejecuta `framekit generate`**

Esto regenera `.framekit/generated/templates.ts` a partir del estado actual de `src/templates`. Ejecútalo después de corregir cualquiera de los problemas anteriores:

```
framekit generate
```

Cuando no existen plantillas, el comando termina con código `1` e imprime la ruta actual, por ejemplo:

```text
No se encontraron plantillas en: /path/to/project/src/templates
```

---

## Errores de segmento de ruta inválido

**Causa: el segmento del directorio contiene mayúsculas, guiones bajos o caracteres inválidos**

Cuando FrameKit recorre `src/templates`, cada nombre de directorio debe coincidir con `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Un segmento como `Hero-Section`, `my_template` o `Template1` no coincide y lanza un error en el momento de la generación.

**Solución: renombra el directorio a kebab-case minúscula**

Renombra el directorio ofensivo para que cada segmento esté en minúsculas y separado por guiones. Por ejemplo, `Hero-Section` se convierte en `hero-section`.

---

## TypeScript no puede encontrar `@framekit/generated/templates`

**Causa: tsconfig.json no tiene el alias de ruta `@framekit/*`**

El `templates.ts` generado vive en `.framekit/generated/templates.ts`, pero TypeScript no sabe resolver `@framekit/generated/templates` a esa ruta sin un alias de ruta configurado.

**Solución: añade el alias de ruta en tsconfig.json**

Añade lo siguiente al campo `paths` en tu `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@framekit/*": [".framekit/*"]
    }
  }
}
```

---

## CSS de FrameKit faltante / editor sin estilos

**Causa: CSS no importado en el layout**

FrameKit incluye una hoja de estilos que debe ser incluida para que el editor se renderice correctamente.

**Solución: importa la hoja de estilos**

Añade la importación a tu archivo de layout o `globals.css`:

```css
@import '@mauriciodmo/framekit/styles.css';
```

O impórtalo directamente en tu archivo de layout:

```ts
import '@mauriciodmo/framekit/styles.css'
```

---

## `create-framekit` falla con "el directorio ya existe"

**Causa: el directorio destino ya existe (incluso si está vacío)**

`create-framekit` se niega a sobrescribir un directorio existente, aunque ese directorio esté vacío. Esto es para prevenir pérdida accidental de datos.

**Solución: usa un nombre de directorio completamente nuevo**

Elige un nombre de directorio que no exista ya en la ubicación actual. `create-framekit` lo creará desde cero a partir de la plantilla.

---

## La instalación falla en el proyecto generado

**Causa: fallo de compilación de dependencia nativa**

Algunas dependencias (`sharp`, `esbuild`, `@parcel/watcher`) usan binarios nativos. Los gestores de paquetes normalmente instalan un binario precompilado, pero pueden recurrir a la compilación cuando no hay un binario compatible disponible. Si tu sistema carece de la cadena de herramientas de compilación necesaria (Python, make, un compilador de C++), el paso de instalación falla.

**Solución: asegúrate de que las herramientas de compilación estén disponibles y reintenta**

Instala `python`, `make` y una cadena de herramientas de C++ (como `build-essential` en Debian/Ubuntu o las Visual Studio Build Tools en Windows), y luego reintenta la instalación. No uses `pnpm install --ignore-scripts` como solución general: puede dejar las dependencias nativas sin sus artefactos de postinstall. Es preferible corregir la cadena de herramientas y usar las entradas `allowBuilds` del `pnpm-workspace.yaml` del repositorio o del proyecto generado. Usa la supresión de scripts solo para un diagnóstico deliberado; después recompila las dependencias afectadas y verifica el proyecto con `pnpm check` y `pnpm build`.

**Nota:** `create-framekit` conserva el directorio del proyecto parcialmente creado para diagnóstico incluso cuando la instalación falla.

---

## El puerto de `framekit dev` ya está en uso

**Causa: otro proceso ocupa el puerto**

El puerto por defecto es `3000`. Si algo más ya está escuchando en ese puerto, `framekit dev` termina con un error.

**Solución: establece un puerto diferente**

Usa la variable de entorno `PORT` para elegir un puerto disponible:

```
PORT=3001 framekit dev
```

`PORT` debe ser un entero entre 1 y 65535, pero el puerto seleccionado también debe estar disponible y permitido por el sistema operativo. También puedes controlar la dirección de enlace con `FRAMEKIT_HOST` o `HOST`:

```
FRAMEKIT_HOST=0.0.0.0 PORT=3000 framekit dev
```

---

## `framekit build` falla la validación

**Causa: errores en la definición de la plantilla**

`framekit build` ejecuta `framekit check` antes de compilar. La validación detecta problemas estructurales en las definiciones de las plantillas, incluyendo:

- dimensiones inválidas (ancho o alto que no sean enteros positivos)
- campos requeridos faltantes
- sin entradas de contenido para un idioma
- un campo llamado `language` (esta clave está reservada)

La comprobación produce una salida de errores estructurada por plantilla, por idioma y por campo, nombrando el archivo exacto y la regla que falló.

**Solución: ejecuta `framekit check` para ver los errores detallados**

Ejecuta el comando check directamente para ver todos los errores de validación sin hacer una compilación completa:

```
framekit check
```

**Nota:** `framekit check` no verifica que una plantilla se renderice correctamente ni que la exportación PNG funcione. Solo comprueba la estructura de la definición y la forma de los datos.

---

## `framekit start` no encuentra el servidor

**Causa: no existe una build de producción**

`framekit start` necesita la salida de `framekit build`, que produce un servidor Node.js standalone dentro de `.framekit/next`. Si no has ejecutado `framekit build`, el servidor no puede iniciarse.

**Solución: ejecuta `framekit build` primero**

```
framekit build
framekit start
```

**Causa: se encontraron múltiples candidatos de `server.js`**

En estructuras de monorepo anidadas, `framekit start` puede encontrar más de un `server.js` dentro del directorio de salida standalone. Resuelve la ambigüedad buscando un archivo `BUILD_ID` en un directorio `.framekit/next` junto a cada `server.js`.

**Solución: asegúrate de tener una única salida de `next build`**

`framekit build` copia los assets estáticos de `.framekit/next/static` a la salida standalone. Ejecuta `framekit build` desde una única compilación de Next.js (no varias), y evita directorios `.next` o `standalone` anidados que puedan confundir la búsqueda.

**Nota:** FrameKit identifica el servidor correcto buscando un archivo `BUILD_ID` en la ubicación esperada junto a cada candidato `server.js`.

El otro fallo de inicio en producción se reporta con código `1` y el mensaje literal `No existe una build de producción. Ejecuta framekit build primero.` cuando falta `.framekit/next/standalone`.

---

## La exportación PNG falla o exporta una imagen en blanco o incorrecta

**Causa: errores de validación de datos**

La exportación requiere que todos los datos de la plantilla sean válidos. Campos requeridos vacíos, URLs inválidas y números fuera del rango declarado causan fallos de validación que impiden que la exportación produzca una imagen utilizable.

**Causa: las fuentes aún no se han cargado**

Se espera `document.fonts.ready` antes de la captura, pero si tu plantilla carga fuentes de forma diferida o usa fuentes web que no logran cargarse, la imagen exportada puede mostrar fuentes de respaldo en lugar de las deseadas.

**Causa: imágenes de origen cruzado bloqueadas por el navegador**

Si la plantilla usa imágenes de un origen diferente y el servidor no envía las cabeceras CORS apropiadas, el navegador bloquea que la imagen se incluya en la captura del canvas.

**Causa: el navegador carece de las capacidades requeridas**

La exportación PNG usa `modern-screenshot` (que depende de DOM y canvas). Algunos entornos — como navegadores headless sin soporte completo de DOM — no pueden realizar la captura.

**Nota:** La exportación es enteramente del lado del navegador; no hay renderizado del lado del servidor.

**Nota:** Esta es una función en alpha. Aún no hay opciones de formato o escala — solo PNG, a las dimensiones declaradas en la definición de la plantilla, a escala 1.

---

## Los cambios en archivos generados no se reflejan en dev

**Causa: editar contenido de plantilla existente depende de Next HMR, no de la regeneración del registro**

Los cambios en el contenido dentro de un archivo `template.tsx` existente son detectados por Hot Module Replacement de Next.js, no por el watcher de FrameKit. El watcher solo responde a cambios estructurales.

**Causa: el registro solo se regenera para archivos o directorios de `template.tsx` NUEVOS o ELIMINADOS**

El watcher desencadena la regeneración del registro cuando se añade o elimina un `template.tsx`, o cuando se añade o elimina un directorio bajo `src/templates`. Editar el cuerpo de un `template.tsx` existente no regenera el catálogo.

**Solución: reinicia `framekit dev` si los cambios estructurales no desencadenan la regeneración**

Si añades o eliminas un directorio de plantilla o archivo `template.tsx` y el catálogo no se actualiza, reinicia `framekit dev`.

---

## Windows: `pnpm dev` o `pnpm dlx` no funcionan

**Causa: la sintaxis de variables de entorno es diferente**

Las shells POSIX usan la sintaxis `VAR=value comando` para establecer variables de entorno para un solo comando. `cmd.exe` de Windows no soporta esta sintaxis de forma nativa.

**Solución: usa sintaxis compatible con Windows**

En `cmd.exe`:

```
set VAR=value && pnpm dev
```

En PowerShell:

```
$env:VAR="value"; pnpm dev
```

Como alternativa, establece la variable de forma permanente mediante `setx` o a través de la UI de Variables de Entorno de Windows.

**Nota:** `create-framekit` selecciona `pnpm.cmd` en Windows, pero el flujo completo en Windows no está cubierto por CI ni por la suite automatizada actual.

---

[English](../../en/development/troubleshooting.md) | [Español](../../es/development/troubleshooting.md)
