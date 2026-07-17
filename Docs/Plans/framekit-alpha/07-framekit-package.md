# 07. Paquete framekit

## Estructura y límites

```text
packages/framekit/
├── src/
│   ├── core/
│   ├── editor/
│   ├── codegen/
│   ├── cli/
│   ├── styles.css
│   ├── index.ts
│   └── editor.ts
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

`core` no puede importar Next, DOM ni componentes del editor. `codegen` y `cli` pueden usar APIs de Node. `editor` es cliente y no puede importar `node:fs`, `path` ni módulos de generación.

## API pública

- [ ] Exportar desde `@mauriciodmo/framekit`: `defineTemplate`, `fields`, `Markdown`, `TemplateDefinition`, `TemplateRenderProps` e `InferTemplateData`.
- [ ] Exportar desde `@mauriciodmo/framekit/editor`: `FrameKitEditor`, `FrameKitNavigation`, tipos de manifest y helpers de árbol de navegación que necesite el consumidor.
- [ ] Exponer `@mauriciodmo/framekit/styles.css` como una ruta CSS, no como import JavaScript.
- [ ] No exponer archivos internos, paths `src/*`, scanner ni validadores privados mediante `exports`.
- [ ] Definir las entradas solo con ESM; no publicar salida CommonJS para alpha.

## Compilación y estilos

- [ ] Usar `tsup` como único compilador de TypeScript del paquete, con entradas `src/index.ts`, `src/editor.ts` y `src/cli.ts`, formato ESM y generación de `.d.ts`.
- [ ] Usar `@tailwindcss/cli` para compilar la fuente CSS del paquete y emitir `dist/styles.css`.
- [ ] Definir `build:js`, `build:css` y `build` en el package para que `build` ejecute ambos pasos de forma determinista.
- [ ] Hacer que el build emita `dist/index.js`, `dist/editor.js`, `dist/cli.js` y sus `.d.ts` equivalentes.
- [ ] Externalizar `next`, `react` y `react-dom` al compilar; el consumidor provee una sola copia de esos paquetes.
- [ ] Declarar `lucide-react`, `modern-screenshot` y `chokidar` como dependencias de runtime del paquete si siguen siendo usados por editor o CLI.
- [ ] Declarar `tsx` como dependencia de runtime del CLI para ejecutar la comprobación temporal de definiciones TSX del consumidor.
- [ ] Generar `dist/styles.css` durante el build; debe contener las utilidades Tailwind usadas por los componentes del editor.
- [ ] Añadir una fuente CSS del paquete que declare explícitamente qué archivos de `src/editor` deben analizarse; no depender del escaneo Tailwind de la app consumidora.
- [ ] Verificar que importar `@mauriciodmo/framekit/styles.css` desde `globals.css` aplica estilos del editor en un proyecto sin configuración Tailwind extra.

## package.json publicable

- [ ] Usar `name: "@mauriciodmo/framekit"`, `version: "0.1.0-alpha.1"`, `type: "module"` y `license: "Apache-2.0"`.
- [ ] Declarar `files: ["dist", "README.md", "LICENSE"]`.
- [ ] Declarar exports explícitos para `.`, `./editor` y `./styles.css`, cada JavaScript con `types` e `import`.
- [ ] Declarar `bin.framekit` apuntando a `./dist/cli.js`.
- [ ] Declarar `next: >=16 <17`, `react: >=19 <20` y `react-dom: >=19 <20` como peer dependencies.
- [ ] Declarar `publishConfig.access: public`.
- [ ] Añadir una comprobación que falle si un archivo de `dist` importa una ruta fuera de `dist` o `node_modules`.

## Studio como consumidor

- [ ] Cambiar todos los imports de plantilla a `@mauriciodmo/framekit`.
- [ ] Cambiar componentes de editor y navegación a `@mauriciodmo/framekit/editor`.
- [ ] Importar `@mauriciodmo/framekit/styles.css` desde las hojas globales de Studio.
- [ ] Eliminar las copias de código migrado de Studio una vez que el paquete sea su único proveedor.

## Cierre

- [ ] Studio no importa archivos desde `packages/framekit/src`.
- [ ] `pnpm --filter @mauriciodmo/framekit build` produce solo artefactos publicables en `dist`.
- [ ] El CSS del editor funciona sin configuración Tailwind adicional del consumidor.
