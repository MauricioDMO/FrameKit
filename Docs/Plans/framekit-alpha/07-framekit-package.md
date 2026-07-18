# 07. Paquete framekit

## Estructura y límites

```text
packages/framekit/
├── src/
│   ├── core/
│   ├── editor/
│   ├── codegen/
│   ├── styles.css
│   ├── index.ts
│   └── editor.ts
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

`core` no puede importar Next, DOM ni componentes del editor. `codegen` puede usar APIs de Node. `editor` es cliente y no puede importar `node:fs`, `path` ni módulos de generación.

La fase 06 entrega directamente en este paquete el código reutilizable, sus pruebas y los fixtures de tipos. La fase 07 no debe repetir esa extracción: añade la compilación, exports, CSS y metadatos publicables sobre esa estructura ya migrada.

## Experiencia de autoría documentada

- [x] Documentar primero el patrón inline con `defineTemplate`, donde `render`
  obtiene `data` y `locale` sin anotación manual.
- [x] Documentar como patrón para imágenes complejas `definition.ts`,
  `artwork.tsx` y `template.tsx`, usando `defineTemplateBase` y
  `TemplateRenderProps<typeof templateBase>`.
- [x] Explicar que cada plantilla define sus propios locales mediante las claves
  de `content`; FrameKit no limita ni importa los locales de la aplicación.
- [x] Explicar que cada entrada de `content` autocompleta las claves de `fields`,
  exige `language` y rechaza claves desconocidas.
- [x] Explicar que los campos localizados pueden omitirse y que la resolución
  final aplica defaults, contenido y ediciones antes de validar requeridos.
- [x] Aclarar que `template.tsx` es el único punto descubierto por el scanner y
  que módulos, componentes y assets vecinos son privados de la plantilla.
- [x] Incluir ambos patrones en el README del paquete y comprobar sus ejemplos
  mediante `pnpm typecheck` para evitar documentación obsoleta.

## API pública

- [x] Exportar desde `@mauriciodmo/framekit` toda la API existente de `src/index.ts`: `defineTemplateBase`, `defineTemplate`, `fields`, `Markdown`, `validateTemplateData`, `validateTemplateDefinition`, `resolveTemplateData`, `getLocales`, `getDefaultValues`, los descriptores de campos, `TemplateDataValidationError`, `TemplateDefinition`, `TemplateRenderProps` e `InferTemplateData`.
- [x] Hacer que `TemplateRenderProps<typeof templateBase>` sea la forma pública de tipar un componente extraído; los dos genéricos internos de campos y locales no forman parte de la experiencia documentada.
- [x] Exportar desde `@mauriciodmo/framekit/editor` toda la API existente y reutilizable del editor: `FrameKitEditor`, `FrameKitNavigation`, `EditorMessages`, tipos de manifest y helpers de árbol de navegación.
- [x] Exponer `@mauriciodmo/framekit/styles.css` como una ruta CSS, no como import JavaScript.
- [x] No exponer archivos internos ni paths `src/*` mediante `exports`; los validadores, resolvers, descriptores y helpers actualmente exportados son API pública intencional y deben conservarse en la entrada raíz.
- [x] Definir las entradas solo con ESM; no publicar salida CommonJS para alpha.

## Compilación y estilos

- [x] Usar `tsdown` como único compilador de TypeScript del paquete, con entradas `src/index.ts` y `src/editor.ts`, formato ESM y generación de `.d.ts`. La entrada `src/cli.ts` pertenece a la fase 08.
- [x] Usar `@tailwindcss/cli` para compilar la fuente CSS del paquete y emitir `dist/styles.css`.
- [x] Definir `build:js`, `build:css` y `build` en el package para que `build` ejecute ambos pasos de forma determinista.
- [x] Hacer que el build emita `dist/index.js`, `dist/editor.js` y sus `.d.ts` equivalentes. `dist/cli.js` pertenece a la fase 08.
- [x] Externalizar `next`, `react` y `react-dom` al compilar; el consumidor provee una sola copia de esos paquetes.
- [x] Declarar `lucide-react` y `modern-screenshot` como dependencias de runtime del paquete; `chokidar` y `tsx` pertenecen al CLI de la fase 08.
- [x] Generar `dist/styles.css` durante el build; debe contener las utilidades Tailwind usadas por los componentes del editor.
- [x] Añadir una fuente CSS del paquete que declare explícitamente qué archivos de `src/editor` deben analizarse; no depender del escaneo Tailwind de la app consumidora.
- [x] Verificar que importar `@mauriciodmo/framekit/styles.css` desde `globals.css` aplica estilos del editor en un proyecto sin configuración Tailwind extra.

## package.json publicable

- [x] Usar `name: "@mauriciodmo/framekit"`, `version: "0.1.0-alpha.1"`, `type: "module"` y `license: "Apache-2.0"`.
- [x] Declarar `files: ["dist", "README.md", "LICENSE"]`.
- [x] Declarar exports explícitos para `.`, `./editor` y `./styles.css`, cada JavaScript con `types` e `import`.
- [x] No declarar todavía `bin.framekit`; el binario pertenece a la fase 08 junto con `src/cli.ts`.
- [x] Declarar `next: >=16 <17`, `react: >=19 <20` y `react-dom: >=19 <20` como peer dependencies.
- [x] Declarar `publishConfig.access: public`.
- [x] Añadir una comprobación que falle si un archivo de `dist` importa una ruta fuera de `dist` o `node_modules`.

## Studio como consumidor

- [x] Cambiar todos los imports de plantilla a `@mauriciodmo/framekit`.
- [x] Cambiar componentes de editor y navegación a `@mauriciodmo/framekit/editor`.
- [x] Importar `@mauriciodmo/framekit/styles.css` desde las hojas globales de Studio.
- [x] Eliminar las copias de código migrado de Studio una vez que el paquete sea su único proveedor.

## Cierre

- [x] Studio no importa archivos desde `packages/framekit/src`.
- [x] `pnpm --filter @mauriciodmo/framekit build` produce solo artefactos publicables en `dist`.
- [x] El CSS del editor funciona sin configuración Tailwind adicional del consumidor.
