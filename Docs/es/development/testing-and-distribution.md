# Pruebas y Distribución

## Comandos de prueba

FrameKit utiliza Vitest como entorno de pruebas en todos los workspaces. Los siguientes comandos están disponibles desde la raíz del repositorio:

- `pnpm test` — ejecuta Vitest en todos los workspaces que definen un script `test`
- `pnpm --filter @mauriciodmo/framekit test` — ejecuta las pruebas unitarias del paquete central; las pruebas se ejecutan en entorno Node, con jsdom habilitado para las pruebas del editor que requieren DOM o localStorage
- `pnpm --filter studio test` — ejecuta pruebas de integración para la aplicación Studio; `framekit generate` se llama como paso previo antes de que Vitest se ejecute
- `pnpm --filter @mauriciodmo/create-framekit test` — ejecuta pruebas unitarias para el paquete CLI
- `pnpm typecheck` — ejecuta `tsc --noEmit` en todos los paquetes y adicionalmente verifica el conjunto de fixtures de tipos (casos positivos y negativos de plantillas)
- `pnpm lint` — ejecuta ESLint en todos los workspaces
- `pnpm build` — reconstruye todos los workspaces completamente; el paquete central se construye primero, luego todos los workspaces dependientes

## Qué se prueba

Las siguientes áreas están cubiertas por el conjunto de pruebas:

**Sistema de plantillas:** Descubrimiento de plantillas mediante el escáner (directorios anidados, exclusión de rutas con prefijo punto o guion bajo, validación de formato de slug), generación de código del registro de plantillas y carga de plantillas en tiempo de ejecución.

**Navegación:** Derivación del árbol de navegación desde el manifiesto, orden alfabético de slugs y manejo de categorías anidadas.

**Resolución de datos:** Aplicación de valores por defecto, precedencia de contenido por locale, overrides de edición del usuario, y la garantía de que `language` nunca se copia a `data`.

**Definición y validación:** Validación en tiempo de ejecución de definiciones de plantillas (descriptores inválidos, límites incoherentes, dimensiones decimales, render ausente) y validadores a nivel de campo (requerido, rango numérico, formato de URL, comportamiento de cambio de locale).

**Estado del editor:** Persistencia en localStorage y restauración de sesión, reseteo de un solo locale (solo se eliminan los overrides de ese locale), cambio de locale (no muta los overrides de otros locales) y limpieza de errores visibles al hacer reset o cambiar de locale.

**CLI:** Análisis de argumentos y rutas de error, verificación que activa el build de Next.js y descubrimiento de directorios de plantillas independientes.

**Fixtures de tipos:** Tanto casos positivos (plantillas válidas que deben verificar tipos) como casos negativos (plantillas inválidas que deben producir un error de `tsc`, usando `@ts-expect-error`) se ejecutan como parte de `pnpm typecheck`.

## Qué no se prueba

El conjunto de pruebas no cubre:

- **Pruebas de extremo a extremo en navegador** — no existen pruebas de Playwright ni Cypress; las pruebas de integración de Studio cubren la generación y el build, pero no automatizan un navegador.
- **Regresión visual** — no existen pruebas de comparación de píxeles PNG ni de dimensiones.
- **Flujo completo de Studio** — navegar a una página, editar un campo, cambiar de locale, hacer reset y exportar el resultado no está cubierto como un flujo automatizado único.
- **Build y arranque en producción** — la ejecución correcta de `next build` seguida de `next start` no se verifica en las pruebas unitarias ni de integración.
- **Copia de assets** — la copia del directorio public y archivos estáticos no tiene pruebas unitarias directas.
- **Otros sistemas operativos** — Windows y macOS no se verifican, por lo que esta documentación no garantiza una compatibilidad completa entre plataformas.
- **Comportamiento del watcher** — la propagación de señales, vigilancia de archivos bajo carga y casos extremos del watcher están fuera del alcance actual de las pruebas.

## Distribución y empaquetado

### @mauriciodmo/framekit

Construir el tarball con:

```
pnpm --filter @mauriciodmo/framekit pack
```

La lista `files` del paquete incluye `bin/`, `dist/`, `README.md` y `LICENSE`.

tsdown produce una salida ESM sin bundle. Los siguientes paquetes permanecen como externos (no se incluyen en el bundle): `react`, `react-dom`, `next`, `lucide-react`, `modern-screenshot`, `chokidar`, `tsx`. El CSS se compila por separado vía Tailwind CLI y se coloca en `dist/styles.css`.

Una verificación posterior al build (`check-dist.ts`) escanea recursivamente todos los archivos `.js` emitidos bajo `dist/` en busca de violaciones de frontera de imports, verificando que los imports relativos se resuelvan en archivos dentro del paquete. También comprueba que los targets string de `exports` y `bin` sean rutas `./...` hacia archivos existentes dentro del paquete.

### @mauriciodmo/create-framekit

Construir el tarball con:

```
pnpm --filter @mauriciodmo/create-framekit pack
```

La lista `files` del paquete incluye `dist/`, `template/`, `README.md` y `LICENSE`.

Cuando un usuario ejecuta `create-framekit`, el directorio `template/` se copia desde el paquete instalado a su proyecto como una copia independiente, sin referencias al directorio del paquete.

## Prueba de humo del tarball (manual)

Para validar ambos tarballs antes de cualquier paso de publicación:

1. Crear un proyecto consumidor básico aislado fuera del repositorio de FrameKit.
2. Instalar el tarball de FrameKit en el: `pnpm add <ruta-al-tgz-de-framekit>`.
3. Ejecutar `pnpm check` y `pnpm build` en el proyecto consumidor y confirmar que ambos finalizan correctamente.
4. Instalar el tarball de `create-framekit` y ejecutar `create-framekit <nuevo-directorio>` desde una ruta fuera del repositorio.
5. Dentro del proyecto generado, sustituir la dependencia de FrameKit del workspace por el tarball local, luego ejecutar `pnpm install`, `pnpm check` y `pnpm build`.
6. Confirmar que `.framekit/generated/templates.ts` se genera y está en gitignore, y que ninguno de los dos tarballs dejó ninguna referencia al workspace original.

Ambos tarballs deben instalarse y generar sin errores antes de cualquier intento de publicación.

---

[English](../../en/development/testing-and-distribution.md) · [Español](./testing-and-distribution.md)
