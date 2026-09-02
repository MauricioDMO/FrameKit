# Pruebas y Distribución

## Comandos de prueba

FrameKit utiliza Vitest como entorno de pruebas en todos los workspaces. Los siguientes comandos están disponibles desde la raíz del repositorio:

Desde un checkout nuevo, construye primero `@mauriciodmo/framekit` antes de
ejecutar `pnpm test`, `pnpm typecheck` o la prueba focalizada de Studio; los
scripts de Studio invocan el CLI de FrameKit desde el paquete construido. El
lane de CI construye los paquetes públicos antes de esos checks.

- `pnpm test` — ejecuta Vitest en todos los workspaces que definen un script `test`
- `pnpm --filter @mauriciodmo/framekit test` — ejecuta las pruebas unitarias del paquete central; las pruebas se ejecutan en entorno Node, con jsdom habilitado para las pruebas del editor que requieren DOM o localStorage
- `pnpm --filter studio test` — ejecuta pruebas de integración para la aplicación Studio; `framekit generate` se llama como paso previo antes de que Vitest se ejecute
- `pnpm --filter @mauriciodmo/create-framekit test` — ejecuta pruebas unitarias para el paquete CLI
- `pnpm test:e2e` — ejecuta la única prueba crítica en Chromium; primero instala el navegador con `pnpm exec playwright install chromium`
- `pnpm typecheck` — ejecuta `tsc --noEmit` en todos los paquetes y adicionalmente verifica el conjunto de fixtures de tipos (casos positivos y negativos de plantillas)
- `pnpm lint` — ejecuta ESLint en todos los workspaces
- `pnpm build` — reconstruye todos los workspaces completamente; el paquete central se construye primero, luego todos los workspaces dependientes

## Qué se prueba

Las siguientes áreas están cubiertas por el conjunto de pruebas:

**Sistema de plantillas:** Descubrimiento de plantillas mediante el escáner (directorios anidados, exclusión de rutas con prefijo punto o guion bajo, validación de formato de slug), generación de código del registro de plantillas y carga de plantillas en tiempo de ejecución.

**Navegación:** Derivación del árbol de navegación desde el manifiesto, orden alfabético de slugs y manejo de categorías anidadas.

**Resolución de datos:** Aplicación de valores por defecto, precedencia del contenido de la variante, overrides de edición del usuario, errores accionables para keys desconocidas y la frontera canónica de renderizado.

**Definición y validación:** Validación en tiempo de ejecución de la forma canónica de metadata, variantes y contenido (descriptores inválidos, límites incoherentes, dimensiones decimales, propiedades superiores no soportadas, render ausente) y validadores a nivel de field (requerido, rango numérico, formato de color, cambio de variante).

**Estado del editor:** Persistencia en localStorage y restauración de sesión, reseteo de una sola variante de contenido (solo se eliminan sus overrides), cambio de variante (no muta los overrides de otras variantes) y limpieza de errores visibles al hacer reset o cambiar de variante.

**CLI:** Análisis de argumentos y rutas de error, verificación que activa el build de Next.js y descubrimiento de directorios de plantillas independientes.

**E2E de navegador:** Un único flujo de Playwright en Chromium abre la entrada
del registro generado `redes-sociales/instagram/promocion-cuadrada`, verifica su
metadata y dimensiones, cambia variantes, edita campos de texto/número/opciones/
booleano/color, comprueba que un borrador numérico incompleto no sustituye el
valor confirmado del preview y exporta un PNG con las dimensiones declaradas.

**Fixtures de tipos:** Tanto casos positivos (plantillas válidas que deben verificar tipos) como casos negativos (plantillas inválidas que deben producir un error de `tsc`, usando `@ts-expect-error`) se ejecutan como parte de `pnpm typecheck`.

## Qué no se prueba

El conjunto de pruebas no cubre:

- **Regresión visual** — el E2E de Chromium valida la firma PNG y las dimensiones de su cabecera, pero no existen pruebas de comparación de píxeles PNG ni snapshots visuales.
- **Matriz de navegadores** — solo se cubre el flujo crítico de Chromium; Firefox, WebKit, snapshots visuales, exportación al portapapeles y carga de imágenes no son gates requeridos.
- **Build y arranque de producción como un único smoke** — CI ejecuta builds de producción, pero no arranca el servidor standalone generado; el smoke aislado de tarballs de abajo cubre manualmente la secuencia de build y arranque, no Vitest ni el lane PR de Chromium.
- **Copia de assets del standalone de producción** — la copia del directorio public del consumidor y de los archivos estáticos de Next en la salida standalone no tiene pruebas unitarias directas; las pruebas de codegen sí cubren el descubrimiento y la copia de assets de plantillas.
- **Otros sistemas operativos** — Windows tiene un smoke focalizado de consumidor en CI, pero esta documentación no garantiza soporte amplio de Windows ni macOS.
- **Comportamiento del watcher** — la propagación de señales, vigilancia de archivos bajo carga y casos extremos del watcher están fuera del alcance actual de las pruebas.

## Gates permanentes de CI

- Ubuntu ejecuta las verificaciones completas del repositorio en Node.js `22.13.0` y `24` con pnpm `11.14.0`.
- Windows ejecuta las verificaciones focalizadas de discovery, codegen, creator, typecheck, paquetes y consumidor generado en Node.js `22.13.0`.
- Ubuntu ejecuta el único E2E de Chromium en Node.js `22.13.0`; el lane instala Chromium e inicia Studio con `pnpm dev`.

El smoke de creator en Windows usa `create-framekit <directorio> -n`, instala las
dependencias del proyecto generado y ejecuta `framekit generate` y
`framekit check`. No afirma cobertura de build de producción ni de navegador en
Windows.

## Distribución y empaquetado

### @mauriciodmo/framekit

Construir el tarball con:

```
pnpm --filter @mauriciodmo/framekit pack
```

La lista `files` del paquete incluye `bin/`, `dist/`, `README.md` y `LICENSE`.

tsdown produce una salida ESM sin bundle. Los siguientes paquetes permanecen como externos (no se incluyen en el bundle): `react`, `react-dom`, `next`, `@tabler/icons-react`, `modern-screenshot`, `chokidar`, `tsx`. El CSS se compila por separado vía Tailwind CLI y se coloca en `dist/styles.css`.

Una verificación posterior al build (`check-dist.ts`) escanea recursivamente todos los archivos `.js` emitidos bajo `dist/` en busca de violaciones de frontera de imports, verificando que los imports relativos se resuelvan en archivos dentro del paquete. También comprueba que los targets string de `exports` y `bin` sean rutas `./...` hacia archivos existentes dentro del paquete.

### @mauriciodmo/create-framekit

Construir el tarball con:

```
pnpm --filter @mauriciodmo/create-framekit pack
```

La lista `files` del paquete incluye `dist/`, `template/`, `README.md` y `LICENSE`.

Cuando un usuario ejecuta `create-framekit`, el directorio `template/` se copia desde el paquete instalado a su proyecto como una copia independiente, sin referencias al directorio del paquete.

## Prueba de humo del tarball (manual)

Ejecuta esta secuencia versionless desde una shell Bash. Los dos tarballs se
construyen en un directorio temporal y cada consumidor se crea fuera del
repositorio. No ejecutes los comandos del consumidor desde el checkout de
FrameKit.

```bash
set -eu

REPO_ROOT="$PWD"
SMOKE_DIR="$(mktemp -d)"
trap 'rm -rf "$SMOKE_DIR"' EXIT

pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm --filter @mauriciodmo/framekit pack --pack-destination "$SMOKE_DIR"
pnpm --filter @mauriciodmo/create-framekit pack --pack-destination "$SMOKE_DIR"

CORE_TGZ="$(find "$SMOKE_DIR" -maxdepth 1 -name 'mauriciodmo-framekit-*.tgz' -print -quit)"
CREATOR_TGZ="$(find "$SMOKE_DIR" -maxdepth 1 -name 'mauriciodmo-create-framekit-*.tgz' -print -quit)"
test -n "$CORE_TGZ" && test -n "$CREATOR_TGZ"

# Límites del paquete: existen los archivos esperados y no se publican fuentes/tests/secrets.
tar -tzf "$CORE_TGZ" | rg -q '^package/bin/framekit\.js$'
tar -tzf "$CORE_TGZ" | rg -q '^package/dist/index\.js$'
tar -tzf "$CORE_TGZ" | rg -q '^package/dist/styles\.css$'
tar -tzf "$CREATOR_TGZ" | rg -q '^package/dist/cli\.js$'
tar -tzf "$CREATOR_TGZ" | rg -q '^package/template/package\.json$'
for archive in "$CORE_TGZ" "$CREATOR_TGZ"; do
  if tar -tzf "$archive" | rg -q '(^|/)tests?/|(^|/)node_modules/|(^|/)\.env'; then
    printf 'Archivo inesperado de tests, dependencia o secreto en %s\n' "$archive" >&2
    exit 1
  fi
done

# Ningún archivo conserva metadata workspace, links locales ni la ruta absoluta del checkout.
mkdir "$SMOKE_DIR/inspect-core" "$SMOKE_DIR/inspect-creator"
tar -xzf "$CORE_TGZ" -C "$SMOKE_DIR/inspect-core"
tar -xzf "$CREATOR_TGZ" -C "$SMOKE_DIR/inspect-creator"
for directory in "$SMOKE_DIR/inspect-core/package" "$SMOKE_DIR/inspect-creator/package"; do
  if rg -n --hidden -e 'workspace:' -e 'link:' -e 'file:\.\.' "$directory" || rg -n --hidden -F "$REPO_ROOT" "$directory"; then
    printf 'Referencia al workspace encontrada en %s\n' "$directory" >&2
    exit 1
  fi
done

# Instala el creator en un runner separado y crea un proyecto sin interacción.
mkdir "$SMOKE_DIR/runner"
cd "$SMOKE_DIR/runner"
npm init -y
npm install "$CREATOR_TGZ"
npx --no-install create-framekit "$SMOKE_DIR/consumer" -n

# Sustituye la dependencia generada por el tarball del core y usa el gestor de paquetes del proyecto generado.
cd "$SMOKE_DIR/consumer"
node --input-type=module - "$CORE_TGZ" <<'NODE'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const [tarball] = process.argv.slice(2)
const packagePath = path.resolve('package.json')
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
packageJson.dependencies['@mauriciodmo/framekit'] = `file:${path.resolve(tarball)}`
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
NODE
npm install
npx --no-install framekit generate
npx --no-install framekit check
npx --no-install framekit build
test -f src/generated/framekit/templates.ts
rg -q '^src/generated/framekit$' .gitignore

# Inicia el servidor standalone, consulta un route de Studio por HTTP y limpia con el trap.
PORT=4317
HOSTNAME=127.0.0.1 PORT="$PORT" npx --no-install framekit start > "$SMOKE_DIR/start.log" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; rm -rf "$SMOKE_DIR"' EXIT
node --input-type=module - "$PORT" <<'NODE'
const port = process.argv[2]
const deadline = Date.now() + 30_000

while (Date.now() < deadline) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/editor`)
    if (response.ok) process.exit(0)
  } catch {
    // El servidor standalone todavía puede estar iniciando.
  }
  await new Promise((resolve) => setTimeout(resolve, 250))
}

console.error(`Studio no estuvo listo en el puerto ${port}`)
process.exit(1)
NODE
```

El smoke solo pasa cuando ambos tarballs reales tienen el contenido esperado,
no contienen `workspace:`, links locales ni rutas del checkout, y el consumidor generado por
el creator completa generation, check, build de producción, arranque standalone
y readiness HTTP. El smoke exacto contra npm después de publicar permanece como
handoff separado con las especificaciones de paquetes suministradas durante el
release; consulta el [smoke del registro npm después de publicar](#smoke-del-registro-npm-después-de-publicar-manual-antes-de-promocionar).

## Smoke del registro npm después de publicar (manual, antes de promocionar)

Ejecuta esto solo cuando los paquetes ya estén disponibles en npm. Es una puerta
separada del smoke de tarballs previo a publicar: no puede impedir la carga
inicial, pero un fallo bloquea la promoción al dist-tag previsto. Nunca publiques
ni cambies un dist-tag como parte de esta comprobación.

Proporciona estas entradas durante el release. Ambas especificaciones deben ser
especificaciones exactas del registro, no rangos; el dist-tag se comprueba por
separado:

```bash
set -eu

: "${CORE_SPEC:?Define la especificación npm exacta de @mauriciodmo/framekit}"
: "${CREATOR_SPEC:?Define la especificación npm exacta de @mauriciodmo/create-framekit}"
: "${EXPECTED_DIST_TAG:?Define el dist-tag npm previsto}"

CORE_VERSION="$(npm view "$CORE_SPEC" version)"
CREATOR_VERSION="$(npm view "$CREATOR_SPEC" version)"
test "$CORE_SPEC" = "@mauriciodmo/framekit@$CORE_VERSION"
test "$CREATOR_SPEC" = "@mauriciodmo/create-framekit@$CREATOR_VERSION"

# Comprueba el dist-tag previsto de forma independiente del smoke del consumidor.
test "$(npm view @mauriciodmo/framekit "dist-tags.$EXPECTED_DIST_TAG")" = "$CORE_VERSION"
test "$(npm view @mauriciodmo/create-framekit "dist-tags.$EXPECTED_DIST_TAG")" = "$CREATOR_VERSION"

SMOKE_DIR="$(mktemp -d)"
SERVER_PID=""
cleanup() {
  if test -n "$SERVER_PID"; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$SMOKE_DIR"
}
trap cleanup EXIT

# El runner y el consumidor están fuera del checkout de FrameKit.
mkdir "$SMOKE_DIR/runner"
cd "$SMOKE_DIR/runner"
npm init -y >/dev/null
npm install "$CREATOR_SPEC" "$CORE_SPEC"
test -x node_modules/.bin/create-framekit
test -x node_modules/.bin/framekit
test -f node_modules/@mauriciodmo/create-framekit/dist/cli.js
test -f node_modules/@mauriciodmo/framekit/bin/framekit.js
node --input-type=module <<'NODE'
for (const specifier of [
  '@mauriciodmo/framekit',
  '@mauriciodmo/framekit/editor',
  '@mauriciodmo/framekit/studio',
  '@mauriciodmo/framekit/studio/root',
  '@mauriciodmo/framekit/dev',
  '@mauriciodmo/framekit/styles.css',
]) console.log(specifier, import.meta.resolve(specifier))
NODE

npx --no-install create-framekit "$SMOKE_DIR/consumer" -n
cd "$SMOKE_DIR/consumer"
CORE_VERSION="$CORE_VERSION" node --input-type=module <<'NODE'
import { readFile, writeFile } from 'node:fs/promises'

const packagePath = 'package.json'
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
const declared = packageJson.dependencies?.['@mauriciodmo/framekit']
if (typeof declared !== 'string' || declared.length === 0) throw new Error('La plantilla del creator no tiene dependencia de FrameKit')
console.log(`Dependencia de FrameKit declarada por la plantilla del creator: ${declared}`)
packageJson.dependencies['@mauriciodmo/framekit'] = process.env.CORE_VERSION
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
NODE
npm install
CORE_VERSION="$CORE_VERSION" node --input-type=module <<'NODE'
import { readFile } from 'node:fs/promises'

const installed = JSON.parse(await readFile('node_modules/@mauriciodmo/framekit/package.json', 'utf8'))
if (installed.version !== process.env.CORE_VERSION) throw new Error(`Versión inesperada de FrameKit: ${installed.version}`)
NODE
npx --no-install framekit generate
npx --no-install framekit check
npx --no-install framekit build
test -f src/generated/framekit/templates.ts

PORT=4318
HOSTNAME=127.0.0.1 PORT="$PORT" npx --no-install framekit start > "$SMOKE_DIR/start.log" 2>&1 &
SERVER_PID=$!
node --input-type=module - "$PORT" <<'NODE'
const port = process.argv[2]
const deadline = Date.now() + 30_000

while (Date.now() < deadline) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/editor`)
    if (response.ok) process.exit(0)
  } catch {
    // El servidor standalone todavía puede estar iniciando.
  }
  await new Promise((resolve) => setTimeout(resolve, 250))
}

console.error(`Studio no estuvo listo en el puerto ${port}`)
process.exit(1)
NODE
```

Registra el resultado antes de la limpieza: `CORE_SPEC`, `CREATOR_SPEC`, las
versiones resueltas, `EXPECTED_DIST_TAG`, el registro, las versiones de Node/npm,
la marca de tiempo, PASS o FAIL y la salida relevante o el log de arranque. El
rango/versión de FrameKit declarado por el creator y la versión exacta del core
instalado deben constar en ese registro. Una carga exitosa no equivale a una
puerta de registro exitosa.

---

[English](../../en/development/testing-and-distribution.md) · [Español](./testing-and-distribution.md)
