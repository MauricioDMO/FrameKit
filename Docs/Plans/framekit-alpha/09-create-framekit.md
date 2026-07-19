# 09. Creador de proyectos

## Interfaz de alpha

El único uso soportado será:

```bash
pnpm dlx @mauriciodmo/create-framekit mi-proyecto
```

- [x] Exponer el binario `create-framekit` desde `@mauriciodmo/create-framekit`.
- [x] Exigir exactamente un argumento de directorio; mostrar uso y salir con error si falta o hay argumentos extra.
- [x] Rechazar una ruta que ya exista; no mezclar archivos con un directorio existente durante alpha.
- [x] Crear rutas relativas desde el cwd y normalizarlas antes de escribir.
- [x] No preguntar por package manager, git, tema, idioma, autenticación, base de datos ni plantilla.

## Paquete del creador

- [x] Crear `packages/create-framekit/src/cli.ts` y compilarlo a ESM con `tsdown`.
- [x] Declarar `name: "@mauriciodmo/create-framekit"`, `type: "module"`, `bin.create-framekit: "./dist/cli.js"` y `publishConfig.access: public`.
- [x] Incluir en `files` únicamente `dist`, `template`, README y LICENSE para que el tarball pueda crear proyectos.
- [x] Copiar `template/` desde la ubicación del paquete instalado, no desde `process.cwd()`, para que funcione con `pnpm dlx`.
- [x] Distribuir el ignore de la plantilla como `_gitignore` y renombrarlo a `.gitignore` al copiar, porque npm normaliza o excluye `.gitignore` durante el empaquetado.

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
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json
└── README.md
```

- [x] La página raíz enlaza o redirige a `/editor`.
- [x] La ruta de editor es un Client Component mínimo que entrega `templates` desde `.framekit/generated/templates.ts` a `FrameKitStudio`.
- [x] `globals.css` importa `@mauriciodmo/framekit/styles.css`.
- [x] La plantilla ejemplo importa `defineTemplate`, `fields` y `Markdown` solo desde `@mauriciodmo/framekit`.
- [x] La plantilla ejemplo contiene al menos un campo de texto y un idioma, para que el proyecto sea utilizable inmediatamente.
- [x] Mantener la plantilla inicial en el patrón inline para reducir archivos, pero enlazar desde su README al patrón documentado con `defineTemplateBase` para diseños complejos.
- [x] `package.json` declara Next 16, React 19 y `@mauriciodmo/framekit` con la misma versión alpha publicada por el creador.
- [x] `.gitignore` incluye `node_modules`, `.next` y `.framekit/`.
- [x] No copiar `.framekit`; debe crearlo el CLI después de instalar dependencias.

## Ejecución

- [x] Copiar la plantilla sin archivos de desarrollo ni dependencias instaladas.
- [x] Ejecutar `pnpm install` dentro del proyecto nuevo.
- [x] Ejecutar `pnpm framekit generate` después de instalar para crear el manifiesto inicial.
- [x] Si falla instalación o generación, devolver error, preservar el directorio para diagnóstico e indicar el comando que falló.
- [x] Mostrar como salida final los comandos `cd <proyecto>` y `pnpm dev`.

## Cierre

- [x] Un proyecto recién creado contiene una plantilla visible en `/editor`.
- [x] `pnpm build` funciona sin cambios manuales.
