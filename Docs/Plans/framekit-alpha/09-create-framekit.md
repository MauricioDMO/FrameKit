# 09. Creador de proyectos

## Interfaz de alpha

El único uso soportado será:

```bash
pnpm dlx @mauriciodmo/create-framekit mi-proyecto
```

- [ ] Exponer el binario `create-framekit` desde `@mauriciodmo/create-framekit`.
- [ ] Exigir exactamente un argumento de directorio; mostrar uso y salir con error si falta o hay argumentos extra.
- [ ] Rechazar una ruta que ya exista; no mezclar archivos con un directorio existente durante alpha.
- [ ] Crear rutas relativas desde el cwd y normalizarlas antes de escribir.
- [ ] No preguntar por package manager, git, tema, idioma, autenticación, base de datos ni plantilla.

## Paquete del creador

- [ ] Crear `packages/create-framekit/src/cli.ts` y compilarlo a ESM con `tsup`.
- [ ] Declarar `name: "@mauriciodmo/create-framekit"`, `type: "module"`, `bin.create-framekit: "./dist/cli.js"` y `publishConfig.access: public`.
- [ ] Incluir en `files` únicamente `dist`, `template`, README y LICENSE para que el tarball pueda crear proyectos.
- [ ] Copiar `template/` desde la ubicación del paquete instalado, no desde `process.cwd()`, para que funcione con `pnpm dlx`.

## Contenido de `template/`

```text
template/
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── editor/[[...slug]]/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── templates/
│       └── ejemplo/template.tsx
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

- [ ] La página raíz enlaza o redirige a `/editor`.
- [ ] La ruta de editor usa `templateManifest` y `templateRegistry` generados por FrameKit.
- [ ] `globals.css` importa `@mauriciodmo/framekit/styles.css`.
- [ ] La plantilla ejemplo importa `defineTemplate`, `fields` y `Markdown` solo desde `@mauriciodmo/framekit`.
- [ ] La plantilla ejemplo contiene al menos un campo de texto y un idioma, para que el proyecto sea utilizable inmediatamente.
- [ ] Mantener la plantilla inicial en el patrón inline para reducir archivos, pero enlazar desde su README al patrón documentado con `defineTemplateBase` para diseños complejos.
- [ ] `package.json` declara Next 16, React 19 y `@mauriciodmo/framekit` con la misma versión alpha publicada por el creador.
- [ ] `.gitignore` incluye `node_modules`, `.next` y `/src/.framekit/`.
- [ ] No copiar `src/.framekit`; debe crearlo el CLI después de instalar dependencias.

## Ejecución

- [ ] Copiar la plantilla sin archivos de desarrollo ni dependencias instaladas.
- [ ] Ejecutar `pnpm install` dentro del proyecto nuevo.
- [ ] Ejecutar `pnpm framekit generate` después de instalar para crear el manifiesto inicial.
- [ ] Si falla instalación o generación, devolver error, preservar el directorio para diagnóstico e indicar el comando que falló.
- [ ] Mostrar como salida final los comandos `cd <proyecto>` y `pnpm dev`.

## Cierre

- [ ] Un proyecto recién creado contiene una plantilla visible en `/editor`.
- [ ] `pnpm build` funciona sin cambios manuales.
