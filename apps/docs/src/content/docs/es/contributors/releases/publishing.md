---
title: Publicar una release
description: Ejecuta las comprobaciones de paquetes previas, de publicación y posteriores a la publicación de FrameKit sin seleccionar de antemano los valores de la release.
---

# Publicar una release

Este procedimiento se aplica únicamente a los paquetes públicos
`@mauriciodmo/framekit` y `@mauriciodmo/create-framekit`. El workspace raíz,
Studio y el sitio de documentación son privados y no son destinos de
publicación. Mantén las versiones de los paquetes, el npm dist-tag del momento
de la publicación, las especificaciones exactas del registro y el dist-tag
final como valores proporcionados durante la release. Esta página no selecciona
ninguno de ellos.

La autenticación de FrameKit es opcional. Los smokes de release deben fijar el
modo que ejercitan: usa `FRAMEKIT_AUTH_ENABLED=false` para el baseline abierto y
`FRAMEKIT_AUTH_ENABLED=true` con una contraseña de bootstrap temporal para las
comprobaciones de usuarios, sesiones, tokens y renderizado autenticado.

## Antes de la publicación

Ejecuta los comandos de la release desde la raíz del repositorio con las versiones
de Node.js y pnpm declaradas por el repositorio. Comprueba primero el contrato
del runtime:

```bash
pnpm check:runtime
```

Compila los paquetes públicos en orden. Compila FrameKit primero para que los
consumidores generados y el flujo de creación resuelvan su salida compilada
actual:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
```

Ejecuta los gates del repositorio y, después, crea los archivos de ambos
paquetes para inspeccionarlos:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @mauriciodmo/framekit pack
pnpm --filter @mauriciodmo/create-framekit pack
```

Los manifiestos de los paquetes ejecutan una compilación durante `prepack`, y
cada paquete público tiene comprobaciones de lint, tests y tipos en
`prepublishOnly`. El orden de compilación explícito anterior sigue siendo
importante al diagnosticar salidas obsoletas o inspeccionar los artefactos.

## Inspeccionar tarballs y consumidores aislados

El gate de prepublicación independiente de la versión es:

```bash
pnpm smoke:tarballs
```

`tooling/smoke-tarballs.mjs` crea ambos tarballs en un directorio temporal fuera
del checkout y comprueba sus archivos esperados, los destinos del manifiesto,
los shebangs de los binarios y los límites de los paquetes. Rechaza tests,
secretos, binarios de navegador, referencias al workspace, enlaces locales,
referencias locales `file:` y rutas del checkout.

El mismo comando ejecuta dos recorridos de consumidores aislados:

- un consumidor independiente instalado desde el tarball de FrameKit, con la
  resolución de exportaciones públicas y `framekit generate`, `framekit check` y
  `framekit build`;
- un consumidor generado desde el tarball del creador, con una instalación
  limpia, bindings generados, `generate`, `check`, `build` de producción,
  `start` independiente, disponibilidad HTTP, comprobaciones de autenticación y
  rutas, un baseline explícito en modo abierto, un inicio autenticado con
  bootstrap de usuario y cobertura de tokens/renderizado, y limpieza.

Estas son comprobaciones de artefactos locales antes de la publicación. No
demuestran que npm sirva el paquete ni que una imagen de Docker pueda
instalarlo. La [guía de distribución](/es/contributors/distribution) y la
[guía de consumidores generados](/es/contributors/distribution/generated-consumer)
describen en detalle los límites de los artefactos y de los consumidores.

## Gates de CI y del navegador

Revisa el resultado actual de CI para el cambio. El workflow ejecuta el lane
completo de verificación de Linux en Node.js `22.13.0` y `24`, un lane enfocado
de consumidores generados y empaquetado en Windows con Node.js `22.13.0`, y un
lane E2E de Chromium en Linux. El lane de Linux compila ambos paquetes públicos,
ejecuta lint, tests, comprobación de tipos, la compilación del workspace y las
comprobaciones de dry-run de los paquetes.

Cuando el cambio afecte al comportamiento del navegador o de Studio, ejecuta
localmente el gate actual de Chromium con la misma instalación del navegador
que usa CI:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

El workflow de CI no ejecuta los scripts de smoke de tarballs ni de Docker.
Esos siguen siendo gates de la release independientes. Consulta la [integración
continua](/es/contributors/testing/ci) y [pruebas E2E y
smoke](/es/contributors/testing/e2e-and-smoke) para conocer sus alcances y
límites.

## Publicar los paquetes seleccionados

Comprueba la sesión de npm y publica únicamente el paquete o los paquetes
públicos incluidos en esta release. Usa un npm dist-tag del momento de la release
que no sea el tag de promoción final. Si se publican ambos paquetes, publica
FrameKit primero:

```bash
npm whoami
: "${PUBLISH_TAG:?Set the release-time npm dist-tag}"
# Run only the commands for packages included in this release.
pnpm --filter @mauriciodmo/framekit publish --access public --tag "$PUBLISH_TAG"
pnpm --filter @mauriciodmo/create-framekit publish --access public --tag "$PUBLISH_TAG"
```

No uses `npm publish --workspace` ni `npm publish --prefix`; este workspace
define la propiedad de los paquetes mediante pnpm. No añadas `--otp` al comando
de publicación. Si npm solicita un OTP, introdúcelo en el terminal interactivo.

## Después de la publicación

### Smoke de Docker

Cuando el paquete exacto de FrameKit esté disponible en npm, ejecuta la
comprobación de Docker respaldada por el registro si la release incluye el
recorrido del consumidor generado de Docker:

```bash
pnpm smoke:docker -- <exact-published-framekit-version>
```

El script requiere un semver publicado exacto. Verifica el paquete mediante npm,
compila y ejecuta la imagen generada, comprueba su usuario `node` sin privilegios
y el entrypoint `tini`, ejercita un contenedor explícitamente configurado en modo
abierto y otro con `FRAMEKIT_AUTH_ENABLED=true`, la autenticación y la representación PNG, y
comprueba la persistencia al reemplazar el contenedor. No sustituye el smoke
local de tarballs, los tests unitarios, la comprobación de tipos ni el E2E de
Chromium.

### Smoke del registro npm

Ejecuta el smoke de npm posterior a la publicación únicamente después de que los
paquetes seleccionados estén disponibles en el registro. El smoke comprueba los
contratos de ambos paquetes públicos, pero los dos paquetes no tienen que formar
parte de la misma release. Proporciona valores exactos, del momento de la release,
para `CORE_SPEC` y `CREATOR_SPEC`, además de un tag esperado para cada paquete:

- Para un paquete incluido en esta entrega, usa su especificación exacta recién
  publicada y el tag del momento de la release usado para la publicación de ese
  paquete.
- Para un paquete sin cambios, usa su especificación publicada exacta existente
  y su tag previsto existente. No exijas que el paquete sin cambios reciba el
  nuevo tag de publicación.

Usa `EXPECTED_FRAMEKIT_DIST_TAG` para `@mauriciodmo/framekit` y
`EXPECTED_CREATE_FRAMEKIT_DIST_TAG` para `@mauriciodmo/create-framekit`. Si ambos
paquetes se publican juntos, ambos valores pueden ser el mismo tag del momento
de la release. Si solo se publica un paquete, únicamente ese paquete usa el tag
del momento de la release; el otro valor conserva el tag previsto del paquete sin
cambios.

El smoke completo actual del registro se puede reproducir desde un shell de
Bash fuera del contexto del checkout usado por el consumidor temporal:

```bash
set -eu

: "${CORE_SPEC:?Set the exact @mauriciodmo/framekit npm spec}"
: "${CREATOR_SPEC:?Set the exact @mauriciodmo/create-framekit npm spec}"
: "${EXPECTED_FRAMEKIT_DIST_TAG:?Set FrameKit's expected npm dist-tag}"
: "${EXPECTED_CREATE_FRAMEKIT_DIST_TAG:?Set create-framekit's expected npm dist-tag}"

CORE_VERSION="$(npm view "$CORE_SPEC" version)"
CREATOR_VERSION="$(npm view "$CREATOR_SPEC" version)"
test "$CORE_SPEC" = "@mauriciodmo/framekit@$CORE_VERSION"
test "$CREATOR_SPEC" = "@mauriciodmo/create-framekit@$CREATOR_VERSION"

# Check each package's expected tag independently.
test "$(npm view @mauriciodmo/framekit "dist-tags.$EXPECTED_FRAMEKIT_DIST_TAG")" = "$CORE_VERSION"
test "$(npm view @mauriciodmo/create-framekit "dist-tags.$EXPECTED_CREATE_FRAMEKIT_DIST_TAG")" = "$CREATOR_VERSION"

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

# The runner and consumer are outside the FrameKit checkout.
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
  '@mauriciodmo/framekit/client',
  '@mauriciodmo/framekit/dev',
  '@mauriciodmo/framekit/editor',
  '@mauriciodmo/framekit/next',
  '@mauriciodmo/framekit/server',
  '@mauriciodmo/framekit/studio',
  '@mauriciodmo/framekit/studio/root',
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
if (typeof declared !== 'string' || declared.length === 0) throw new Error('Creator template has no FrameKit dependency')
console.log(`Creator template FrameKit dependency: ${declared}`)
packageJson.dependencies['@mauriciodmo/framekit'] = process.env.CORE_VERSION
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
NODE
npm install
CORE_VERSION="$CORE_VERSION" node --input-type=module <<'NODE'
import { readFile } from 'node:fs/promises'

const installed = JSON.parse(await readFile('node_modules/@mauriciodmo/framekit/package.json', 'utf8'))
if (installed.version !== process.env.CORE_VERSION) throw new Error(`Unexpected FrameKit version: ${installed.version}`)
NODE
npx --no-install framekit generate
npx --no-install framekit check
npx --no-install framekit build
test -f src/generated/framekit/templates.ts

PORT=4318
FRAMEKIT_AUTH_ENABLED=true FRAMEKIT_ADMIN_PASSWORD=framekit-registry-smoke-password FRAMEKIT_DATABASE_PATH=:memory: HOSTNAME=127.0.0.1 PORT="$PORT" npx --no-install framekit start > "$SMOKE_DIR/start.log" 2>&1 &
SERVER_PID=$!
node --input-type=module - "$PORT" <<'NODE'
const port = process.argv[2]
const deadline = Date.now() + 30_000

while (Date.now() < deadline) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/login`)
    if (response.ok) process.exit(0)
  } catch {
    // The standalone server may still be starting.
  }
  await new Promise((resolve) => setTimeout(resolve, 250))
}

console.error(`Studio was not ready on port ${port}`)
process.exit(1)
NODE

node --input-type=module - "$PORT" <<'NODE'
const port = process.argv[2]
const origin = `http://127.0.0.1:${port}`
const request = { template: 'example' }

const missingAuth = await fetch(`${origin}/api/framekit/images/render`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(request)
})
if (missingAuth.status !== 401) throw new Error(`Expected 401 before login, got ${missingAuth.status}`)

const login = await fetch(`${origin}/api/framekit/login`, {
  method: 'POST',
  headers: { origin, 'content-type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'framekit-registry-smoke-password' })
})
const loginBody = await login.text()
if (login.status !== 200) throw new Error(`Login failed: ${login.status} ${loginBody}`)
const sessionCookie = login.headers.get('set-cookie')?.split(';', 1)[0]
if (!sessionCookie) throw new Error('Login did not return a session cookie')

const tokenResponse = await fetch(`${origin}/api/framekit/tokens`, {
  method: 'POST',
  headers: { cookie: sessionCookie, origin, 'content-type': 'application/json' },
  body: JSON.stringify({ name: 'Registry smoke token' })
})
const tokenBody = await tokenResponse.json()
if (tokenResponse.status !== 201 || typeof tokenBody.token !== 'string') {
  throw new Error(`Token creation failed: ${tokenResponse.status} ${JSON.stringify(tokenBody)}`)
}

const image = await fetch(`${origin}/api/framekit/images/render`, {
  method: 'POST',
  headers: { authorization: `Bearer ${tokenBody.token}`, 'content-type': 'application/json' },
  body: JSON.stringify(request)
})
const imageBytes = new Uint8Array(await image.arrayBuffer())
const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]
if (image.status !== 200 || image.headers.get('content-type') !== 'image/png' || !pngSignature.every((byte, index) => imageBytes[index] === byte)) {
  throw new Error(`PNG render failed: ${image.status} ${image.headers.get('content-type')}`)
}
console.log('Authenticated registry smoke passed: login, token, and PNG render')
NODE
```

Antes de que se ejecute la limpieza, registra `CORE_SPEC`, `CREATOR_SPEC`,
ambos tags esperados de los paquetes, las versiones resueltas, el registro, las
versiones de Node.js y npm, la marca de tiempo, PASS o FAIL, la salida de los
comandos relevantes y `$SMOKE_DIR/start.log`. La versión o el rango de FrameKit
declarado por el creador y la versión exacta del core instalado deben constar en
ese registro. El trap `cleanup` detiene el servidor independiente y elimina el
runner y el consumidor temporales. Nunca publiques ni cambies un dist-tag como
parte de esta comprobación. Una carga correcta en npm no es un gate correcto del
registro; un fallo del registry-smoke bloquea la promoción final, no la carga
inicial.

## Promover solo después de los gates

No promociones un paquete a su dist-tag final hasta que hayan pasado los gates
locales de publicación, las comprobaciones aplicables de CI y del navegador, el
smoke de tarballs y las comprobaciones del registro posteriores a la
publicación. Después de la comprobación de Docker, cuando corresponda, promociona
únicamente los paquetes publicados en esta entrega, usando las versiones exactas
devueltas por el smoke del registro:

```bash
npm dist-tag add <package>@<resolved-version> <final-dist-tag>
```

El comando anterior es una entrega del momento de la release. Esta página no
elige intencionadamente una versión ni un dist-tag final. La publicación final
en npm y la promoción son gates externos separados que ejecuta el responsable de
la release después de que todos los smokes pasen.
