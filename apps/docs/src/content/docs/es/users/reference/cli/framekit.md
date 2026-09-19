---
title: CLI de framekit
description: Ejecuta comandos de generación, validación, desarrollo, producción e instalación del navegador para un proyecto de FrameKit.
sidebar:
  order: 12
---

Ejecuta `framekit` desde la raíz del proyecto consumidor. Cada comando usa `process.cwd()` como raíz del proyecto. El ejecutable acepta estos comandos:

```text
framekit generate
framekit check
framekit dev
framekit build
framekit start
framekit browser install [--with-deps]
```

Los comandos estándar rechazan argumentos adicionales. El comando del navegador solo acepta la opción opcional `--with-deps`. La CLI no tiene comandos `--help` ni `--version`.

## `framekit generate`

Busca en `src/templates` y escribe los módulos generados locales del proyecto en `src/generated/framekit/`:

- `templates.ts`
- `brands.ts`
- `studio-client.tsx`
- `render-client.tsx`

También sincroniza los recursos descubiertos de las plantillas en `public/framekit/templates/`. El comando requiere al menos una plantilla descubierta.

```bash
pnpm framekit generate
```

## `framekit check`

Ejecuta `generate` primero y después valida cada definición de plantilla descubierta y cada variante de contenido declarada. Usa un verificador temporal en `.framekit/`, elimina ese directorio temporal después de la comprobación e informa de errores de validación estructurados. No es una comprobación de tipos de TypeScript ni genera archivos PNG.

```bash
pnpm framekit check
```

## `framekit dev`

Ejecuta `generate` antes de iniciar el servidor de desarrollo de Next.js con Turbopack. Observa las rutas dentro de `src/templates` y `src/brand` y vuelve a generar los módulos generados cuando cambian. No requiere una build de producción.

```bash
pnpm framekit dev
```

El servidor de desarrollo usa `FRAMEKIT_HOST`, luego `HOST` y después `localhost` para su nombre de host, y `PORT` con un valor predeterminado de `3000`.

## `framekit build`

Ejecuta `check` primero. Cuando la validación tiene éxito, ejecuta `next build` y prepara el resultado standalone en `.framekit/next/`, incluidos los recursos estáticos públicos y de Next necesarios para ese servidor. No es necesaria una build separada antes de este comando.

```bash
pnpm framekit build
```

## `framekit start`

Inicia el servidor standalone de producción existente. No ejecuta `generate`, `check` ni `next build`; ejecuta correctamente `framekit build` primero.

```bash
pnpm framekit start
```

El servidor standalone iniciado hereda su entorno. Next.js lee `HOSTNAME` y `PORT` en producción; `start` no asigna `FRAMEKIT_HOST` ni `HOST` a `HOSTNAME`.

## `framekit browser install`

Instala el shell headless de Chromium utilizado para el renderizado en el servidor. `--with-deps` también solicita a Playwright que instale las dependencias del sistema, lo que puede requerir root o privilegios equivalentes para instalar paquetes en Linux.

```bash
pnpm framekit browser install
pnpm framekit browser install --with-deps
```

El comando respeta `PLAYWRIGHT_BROWSERS_PATH`. Los demás comandos de `framekit` no descargan binarios del navegador.

Consulta [crear una plantilla](/es/users/guides/create-template), [Usar Studio](/es/users/guides/use-studio), el [runtime de producción](/es/users/deployment/runtime) y la [API del paquete server](/es/users/reference/package-api/server).
