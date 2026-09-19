---
title: Verificación del consumidor generado
description: Crea un consumidor aislado de FrameKit y verifica la generación, la validación, la compilación de producción y el inicio independiente.
---

# Verificación del consumidor generado

El paquete creador contiene la plantilla canónica. `create-framekit` copia esa
plantilla en un directorio nuevo; no enlaza el proyecto nuevo con el repositorio
ni con el paquete instalado. Ejecuta este flujo fuera del checkout de FrameKit
para que la resolución del workspace no pueda ocultar fugas de paquetes y rutas.

## Flujo aislado

Este flujo no interactivo deja explícitas la instalación y la generación. `-n`
rechaza las indicaciones de instalación y Git del creador, lo que facilita
inspeccionar el estado previo a la generación:

```bash
set -eu

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

mkdir "$SMOKE_DIR/runner"
cd "$SMOKE_DIR/runner"
npm init -y
npm install @mauriciodmo/create-framekit
npx --no-install create-framekit "$SMOKE_DIR/consumer" -n

cd "$SMOKE_DIR/consumer"
npm install
npx --no-install framekit generate
npx --no-install framekit check
npx --no-install framekit build

PORT=4317
HOSTNAME=127.0.0.1 PORT="$PORT" npx --no-install framekit start > "$SMOKE_DIR/start.log" 2>&1 &
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
```

`framekit start` es un comando de larga duración. Ejecútalo solo después de una
compilación correcta, mantenlo en segundo plano con su PID y su registro
capturados, consulta periódicamente la ruta `/login` del consumidor para
comprobar que está listo y deja que el trap de limpieza lo detenga y elimine el
directorio temporal. La [referencia de create-framekit](/es/users/reference/cli/create-framekit)
documenta las rutas compatibles del creador con `pnpm` y `npm`.

Para la versión reproducible de este flujo basada en artefactos de paquetes,
ejecuta el smoke del repositorio en lugar de sustituir las versiones de los
paquetes manualmente:

```bash
pnpm smoke:tarballs
```

Ese script empaqueta ambos paquetes públicos, instala cada archivo comprimido en directorios
temporales fuera del checkout y ejecuta un consumidor core independiente y un
consumidor generado por el creador.

## Qué demuestra cada paso

| Paso | Qué demuestra |
| --- | --- |
| `create-framekit ... -n` | El creador puede copiar la plantilla distribuida en un directorio nuevo e independiente. Antes de la generación, el consumidor no tiene dependencias instaladas ni bindings de FrameKit generados. |
| `npm install` | Las dependencias declaradas del proyecto generado se resuelven desde el registro de paquetes seleccionado o desde el artefacto local. |
| `framekit generate` | El código fuente bajo `src/templates/` y `src/brand/` puede producir `src/generated/framekit/templates.ts`, `brands.ts`, `studio-client.tsx` y `render-client.tsx`, además de copiar los recursos de las plantillas bajo `public/framekit/templates/`. |
| `framekit check` | La generación se ejecuta primero y después se valida cada definición de plantilla y variante de contenido descubierta. El comprobador temporal bajo `.framekit/` se elimina después. No es una comprobación de TypeScript. |
| `framekit build` | El proyecto supera `check`, ejecuta `next build` y prepara la salida de producción independiente bajo `.framekit/next/`. |
| `framekit start` | La salida independiente existente se inicia mediante HTTP. No vuelve a generar, validar ni compilar. |

La [referencia de la CLI de FrameKit](/es/users/reference/cli/framekit) es la
fuente del comportamiento de los comandos. No se debe inferir que una
comprobación del consumidor es correcta a partir de una prueba unitaria local
del paquete ni de una compilación ejecutada dentro del checkout de FrameKit.

## Inspecciona el proyecto copiado

El código fuente mantenido de la plantilla canónica incluye las rutas de App
Router, `next.config.ts`, `Dockerfile`, `.env.example`, `src/profile.ts` y el
ejemplo bajo `src/templates/example/`. La forma canónica de las rutas contiene:

- `src/app/[section]/[[...slug]]/page.tsx` para las secciones de Studio;
- `src/app/api/framekit/[...action]/route.ts` para la API de FrameKit;
- `src/app/framekit/render/[id]/page.tsx` para la representación privada;
- `src/app/globals.css` y `src/app/layout.tsx`; y
- `src/app/login/page.tsx` para la ruta pública de inicio de sesión.

El consumidor generado debe importar el código reutilizable desde los puntos de
entrada públicos del paquete, como `@mauriciodmo/framekit/studio/root`,
`@mauriciodmo/framekit/server` y `@mauriciodmo/framekit/styles.css`. Sus módulos
generados deben importar mediante `@framekit/generated/*`. No debe importar
`packages/framekit/src/**`.

## Código fuente y salida generada

Mantén separadas la plantilla canónica y el consumidor generado:

| Categoría | Rutas | Regla |
| --- | --- | --- |
| Código fuente mantenido de la plantilla | `packages/create-framekit/template/src/`, `next.config.ts`, `Dockerfile`, `.env.example` y la configuración del proyecto | Cambia estas fuentes cuando cambie el proyecto inicial. Vuelve a compilar y empaqueta el paquete creador. |
| Salida generada del consumidor | `src/generated/framekit/`, `public/framekit/`, `.framekit/`, `.framekit/next/`, `.next/`, `*.tsbuildinfo` y `next-env.d.ts` | Salida desechable. Vuelve a generarla o compílala; no la edites manualmente ni la añadas al archivo comprimido del creador. |
| Datos de runtime del consumidor | `.framekit-data/` | Almacenamiento SQLite persistente cuando se usa. Consérvalo entre reinicios y despliegues; no es un registro generado. |

La referencia de archivos generados explica con más detalle las rutas de salida
del consumidor: [archivos generados](/es/users/reference/generated-files). El
flujo de trabajo del contribuidor también enumera las reglas de salida
desechable del repositorio en [mantén desechable la salida generada](/es/contributors/development/workflow#mantener-desechable-la-salida-generada).

## Consumidores locales y publicados

`pnpm smoke:tarballs` es la compuerta de artefactos locales previa a la
publicación. Verifica el contenido de los archivos, la resolución de las
exportaciones públicas, la secuencia `generate`/`check`/`build` del consumidor
generado, la disponibilidad independiente y la limpieza. No demuestra que npm
sirva el paquete publicado ni que una imagen de Docker pueda instalar la versión
publicada.

Después de la publicación, el smoke exacto del registro npm es una compuerta
manual de release independiente. Usa valores exactos de `CORE_SPEC` y
`CREATOR_SPEC`, verifica sus versiones con `npm view` y los valores
independientes de `EXPECTED_FRAMEKIT_DIST_TAG` y
`EXPECTED_CREATE_FRAMEKIT_DIST_TAG`, instálalos en un runner temporal, crea el
consumidor, instala su versión exacta de core y repite `generate`, `check`,
`build` y `start`. Registra las versiones resueltas y el resultado antes de la
limpieza.
Consulta [pruebas E2E y smoke](/es/contributors/testing/e2e-and-smoke) para
conocer la diferencia entre las comprobaciones basadas en archivos y las
basadas en el registro.
