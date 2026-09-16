# Crear un proyecto

## Requisitos previos

- Node.js 22.13.0 o posterior.
- pnpm 11.14.0 o posterior cuando uses pnpm. El manifiesto del paquete no declara un rango de engine para npm; el creador admite npm para instalar proyectos generados.

El creador comprueba la versión de Node.js antes de crear el proyecto y la
versión de pnpm antes de instalar dependencias con pnpm.

## Crear el proyecto

Ejecuta:

```bash
pnpm dlx @mauriciodmo/create-framekit mi-proyecto
```

El creador es interactivo. Si no proporcionas el nombre del proyecto como argumento y no usas `-n` ni `-y`, te lo pide. Detecta qué gestor de paquetes estás usando (`pnpm` o `npm`) desde tu entorno; si no puede detectarlo, te pregunta cuál elegir. Luego pregunta:

- Si instalar las dependencias (por defecto: sí).
- Si estás usando **pnpm** y elegiste instalar dependencias: si deseas ejecutar `pnpm approve-builds` para aprobar scripts de compilación de forma interactiva (por defecto: sí).
- Si inicializar un repositorio Git con un commit inicial (por defecto: sí).

Para aceptar todas las preguntas, usa `-y`. Para rechazarlas todas, usa `-n`:

```bash
pnpm dlx @mauriciodmo/create-framekit -y
pnpm dlx @mauriciodmo/create-framekit mi-proyecto -n
```

Si usas cualquiera de estas banderas sin proporcionar un nombre, se crea la carpeta `framekit`. En ese modo, un gestor de paquetes no detectado usa `pnpm` sin preguntar.

Después de copiar la plantilla, si elegiste instalar dependencias el creador ejecuta `pnpm install` (o `npm install`) y luego `pnpm framekit generate` (o `npm exec -- framekit generate`). Si alguno de estos pasos falla, el directorio del proyecto parcialmente creado se conserva para que puedas diagnosticar el problema.

La CLI muestra un encabezado y un mensaje de finalización con colores cuando se ejecuta en una terminal. Usa `NO_COLOR=1` para desactivar los colores.

### Opciones interactivas

- El nombre del proyecto puede pasarse como el argumento opcional `[directorio-del-proyecto]`. Si se omite sin `-n` ni `-y`, la CLI lo solicita; con cualquiera de esas banderas, usa `framekit`.
- `-y` acepta todas las preguntas y `-n` las rechaza todas. Las formas `--y` y `--n` no son válidas.
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

## Configurar el runtime

Revisa el `.env.example` generado y proporciona estos valores mediante el
entorno de ejecución. La ruta de inicio de sesión llama a `bootstrapUsers()`
antes de autenticar. Si la base de datos configurada no tiene usuarios,
`FRAMEKIT_ADMIN_PASSWORD` es obligatoria (12-256 bytes UTF-8) y
`FRAMEKIT_ADMIN_USERNAME` es opcional (por defecto, `admin`); estas variables
crean el primer administrador activo:

| Variable | Propósito | Valor predeterminado o requisito |
| --- | --- | --- |
| `FRAMEKIT_ADMIN_USERNAME` | Nombre del primer administrador | Opcional durante el primer inicio de sesión en una base vacía; `admin` por defecto |
| `FRAMEKIT_ADMIN_PASSWORD` | Contraseña del primer administrador | Obligatoria solo durante el primer inicio de sesión en una base vacía; sin valor predeterminado; 12-256 bytes UTF-8 |
| `FRAMEKIT_DATABASE_PATH` | Usuarios, sesiones y tokens de API en SQLite | `.framekit-data/framekit.sqlite`, relativo al directorio de trabajo |
| `FRAMEKIT_INTERNAL_ORIGIN` | Origen privado para el renderizado PNG del servidor | Obligatoria para la ruta de imágenes; origen HTTP de loopback |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | Hostnames HTTPS exactos permitidos para imágenes raster remotas | Opcional; vacío desactiva las imágenes remotas |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | Límite de renders simultáneos del servidor | Opcional; `2` (máximo `32`) |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | Tiempo límite del render del servidor en milisegundos | Opcional; `30000` (máximo `120000`) |

Después de crear el primer usuario, cambiar las variables del administrador no
lo modifica. Persiste el directorio que contiene la ruta de la base de datos
cuando el proyecto se ejecuta en un contenedor. Consulta la [referencia de
configuración del runtime](../reference/public-api.md#variables-de-entorno-de-ejecución)
para conocer las reglas completas y la [referencia de CLI](../reference/cli.md)
para las reglas separadas del entorno de desarrollo y producción.

## Desplegar con Docker

El Dockerfile incluido establece estos valores predeterminados no secretos en
la imagen de runtime:

| Variable | Valor predeterminado |
| --- | --- |
| `NODE_ENV` | `production` |
| `HOSTNAME` | `0.0.0.0` |
| `PORT` | `3000` |
| `FRAMEKIT_INTERNAL_ORIGIN` | `http://127.0.0.1:3000` |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` |

Inyecta las credenciales del administrador y la lista de hosts de imágenes al
iniciar el contenedor. No pongas secretos en el Dockerfile ni los incluyas en
las capas de la imagen.

## Iniciar el desarrollo

Navega al directorio del proyecto e inicia el servidor de desarrollo:

```bash
cd mi-proyecto
pnpm dev
```

Studio se abre en [http://localhost:3000](http://localhost:3000). La ruta raíz `/` redirige a `/editor`.

El proyecto generado incluye una plantilla de ejemplo bilingüe. Después de
instalar las dependencias y generar el registro, estará visible en el editor.

## Validar y construir

Usa los siguientes comandos para trabajar con el proyecto:

- `pnpm dev` — regenera el registro de plantillas antes de iniciar Studio y observa todas las rutas bajo `src/templates` para detectar cambios.
- `pnpm check` — regenera el catálogo de plantillas y valida todas las definiciones y variantes de contenido.
- `pnpm build` — regenera y valida el registro mediante `framekit check`, y luego crea una compilación optimizada para producción.
- `pnpm start` — inicia el servidor de producción sin regenerar el registro.

El proyecto generado no incluye scripts de `test`, `lint` ni `typecheck`.

---

[English](./../../en/getting-started/create-project.md)
