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

La CLI muestra un encabezado y un mensaje de finalización con colores cuando se ejecuta en una terminal. Usa `NO_COLOR=1` para desactivar los colores.

### Opciones interactivas

- El nombre del proyecto puede pasarse como el argumento opcional `[directorio-del-proyecto]`. Si se omite, la CLI lo solicita.
- El gestor de paquetes se detecta desde el entorno. Si no puede detectarse, elige interactivamente entre `pnpm` y `npm`.
- La instalación de dependencias está activada por defecto.
- `pnpm approve-builds` solo se ofrece cuando se selecciona pnpm y se instalan dependencias. Está activado por defecto.
- La inicialización de un repositorio Git con un commit inicial está activada por defecto.
- El directorio destino no debe existir, ni siquiera si está vacío.

### Probar localmente sin publicar

Desde la raíz del repositorio de FrameKit, compila y ejecuta directamente la CLI local:

```bash
pnpm --filter @mauriciodmo/create-framekit build && node packages/create-framekit/dist/cli.js ./my-local-framekit
```

El comando usa la compilación local de `create-framekit` y no requiere publicar el paquete. El proyecto generado seguirá instalando la versión de FrameKit declarada por su plantilla.

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
