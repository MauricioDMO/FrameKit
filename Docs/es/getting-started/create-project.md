# Crear un proyecto

## Versión alfa

FrameKit se encuentra actualmente en estado alfa/prerelease. Los paquetes aún no están publicados en npm. Esta documentación se actualizará una vez confirmada la publicación.

## Requisitos previos

- Node.js 20 o posterior.
- pnpm 11 o posterior.

`create-framekit` solo funciona con pnpm. No es compatible con npm, yarn ni bun.

## Crear el proyecto

Una vez que `@mauriciodmo/create-framekit` esté publicado en npm, ejecuta:

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
```

El creador requiere exactamente un argumento: la ruta a un directorio que aún no exista. Si el directorio ya existe, el comando falla con un error y no se crea nada.

Después de copiar la plantilla, el creador ejecuta `pnpm install` y `pnpm framekit generate` de forma automática. Si alguno de estos pasos falla, el directorio del proyecto parcialmente creado se conserva para que puedas diagnosticar el problema.

## Iniciar el desarrollo

Navega al directorio del proyecto e inicia el servidor de desarrollo:

```bash
cd my-project
pnpm dev
```

Studio se abre en [http://localhost:3000](http://localhost:3000). La ruta raíz `/` redirige a `/editor`.

El proyecto generado incluye una plantilla de ejemplo bilingüe visible inmediatamente en el editor.

## Validar y construir

Usa los siguientes comandos para trabajar con el proyecto:

- `pnpm check` — regenera el catálogo de plantillas y valida todas las definiciones y locales.
- `pnpm build` — crea una compilación optimizada para producción.
- `pnpm start` — inicia el servidor de producción.

El proyecto generado no incluye scripts de `test`, `lint` ni `typecheck`.

## Advertencias

- `pnpm dlx` solo funciona después de que `@mauriciodmo/create-framekit` y `@mauriciodmo/framekit` estén publicados en npm.

---

[English](./../../en/getting-started/create-project.md)
