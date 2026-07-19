# Crear un proyecto

## Versión alfa

FrameKit se encuentra actualmente en estado alfa/prerelease. Los paquetes aún no están publicados en npm. Esta documentación se actualizará una vez confirmada la publicación.

## Requisitos previos

- Node.js 20.9.0 o posterior.
- pnpm 11.14.0 o posterior, **o** npm 10.x o posterior.

## Crear el proyecto

Una vez que `@mauriciodmo/create-framekit` esté publicado en npm, ejecuta:

```bash
pnpm dlx @mauriciodmo/create-framekit mi-proyecto
```

El creador es interactivo. Si no proporcionas el nombre del proyecto como argumento, te lo pide. Detecta qué gestor de paquetes estás usando (`pnpm` o `npm`) desde tu entorno; si no puede detectarlo, te pregunta cuál elegir. Luego pregunta:

- Si instalar las dependencias (por defecto: sí).
- Si estás usando **pnpm** y elegiste instalar dependencias: si deseas ejecutar `pnpm approve-builds` para aprobar scripts de compilación de forma interactiva (por defecto: sí).
- Si inicializar un repositorio Git con un commit inicial (por defecto: sí).

Después de copiar la plantilla, si elegiste instalar dependencias el creador ejecuta `pnpm install` (o `npm install`) y luego `pnpm framekit generate` (o `npm exec -- framekit generate`). Si alguno de estos pasos falla, el directorio del proyecto parcialmente creado se conserva para que puedas diagnosticar el problema.

## Iniciar el desarrollo

Navega al directorio del proyecto e inicia el servidor de desarrollo:

```bash
cd mi-proyecto
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
