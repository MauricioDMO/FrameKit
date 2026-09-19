---
title: Crear un proyecto
description: Crea un nuevo proyecto de FrameKit con el creador oficial de proyectos.
sidebar:
  order: 2
---

Usa `@mauriciodmo/create-framekit` para copiar la plantilla canónica para consumidores en un directorio nuevo.

## Requisitos previos

- Node.js `>=22.13.0`.
- pnpm `>=11.14.0` cuando uses pnpm.
- Un directorio de destino que no exista ya. Un directorio vacío también cuenta como existente.

## Ejecuta el creador

El comando interactivo solicita un nombre de proyecto cuando no se proporciona:

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
```

El creador detecta pnpm o npm a partir del entorno. Si no puede detectar un gestor de paquetes, te pide que elijas uno y usa pnpm de forma predeterminada. Luego hace estas preguntas:

| Pregunta | Valor predeterminado | Cuándo se aplica |
| --- | --- | --- |
| Instalar dependencias | Sí | Cada proyecto nuevo |
| Ejecutar `pnpm approve-builds` | Sí | Solo con pnpm cuando se instalan dependencias |
| Inicializar Git | Sí | Cada proyecto nuevo |

La opción de Git ejecuta `git init`, prepara el proyecto y crea el commit inicial. Desactívala si el destino ya está gestionado por otro flujo de trabajo de repositorio.

## Usa flags no interactivos

`-y` acepta todas las preguntas y `-n` rechaza todas las preguntas:

```bash
pnpm dlx @mauriciodmo/create-framekit -y
pnpm dlx @mauriciodmo/create-framekit my-project -n
```

Cuando se usa cualquiera de los dos flags sin un nombre de proyecto, el destino es `./framekit`.

El creador también proporciona `update-skills [project-directory]` para actualizar las skills públicas de FrameKit en un proyecto generado existente. Sin un directorio, actualiza el directorio actual.

## Si se omite la instalación

El creador sigue copiando el proyecto completo cuando respondes que no a la instalación de dependencias. Entra en el directorio del proyecto y completa la instalación con el gestor de paquetes seleccionado para el proyecto:

```bash
cd my-project
pnpm install
pnpm framekit generate
```

Con npm, usa los comandos correspondientes:

```bash
cd my-project
npm install
npm exec -- framekit generate
```

`generate` descubre las plantillas y escribe el registro y los clientes generados. Si pnpm informa de scripts de compilación que necesitan aprobación, ejecuta `pnpm approve-builds` en el proyecto y repite el comando de instalación o generación según sea necesario.

Cuando la instalación está habilitada, el creador ejecuta el comando de instalación equivalente y luego genera el registro. Si la instalación o la generación falla, el directorio creado parcialmente se conserva para que se pueda diagnosticar el fallo y ejecutar manualmente los pasos anteriores.

## Inicia Studio

Después de instalar las dependencias y de que exista el registro, inicia el servidor de desarrollo:

```bash
pnpm dev
```

El proyecto generado expone Studio en `http://localhost:3000`. La URL raíz redirige a `/editor`. El primer inicio de sesión contra una base de datos vacía necesita `FRAMEKIT_ADMIN_PASSWORD`; `FRAMEKIT_ADMIN_USERNAME` es opcional y usa `admin` de forma predeterminada. Define estas variables mediante el entorno de ejecución, no en el control de código fuente. Consulta la [referencia de acceso](/es/users/reference/http-api/access) y la [guía de despliegue](/es/users/deployment) para conocer el contrato completo.

Si la exportación PNG informa de que Chromium no está disponible, instala el navegador que usa el renderizador del lado del servidor:

```bash
pnpm framekit browser install
```

En una máquina Linux donde las dependencias del sistema aún no estén disponibles, usa `pnpm framekit browser install --with-deps`.

## Valida y compila

El proyecto generado proporciona estos comandos:

| Comando | Comportamiento |
| --- | --- |
| `pnpm dev` | Genera el registro, observa `src/templates/` y `src/brand/`, e inicia Studio. |
| `pnpm check` | Genera el registro y valida la definición y todas las variantes de contenido de cada plantilla. |
| `pnpm build` | Ejecuta la comprobación y luego crea la compilación de producción standalone de Next.js. |
| `pnpm start` | Inicia la compilación de producción existente sin volver a generar el registro. |

Usa [la guía de estructura del proyecto](/es/users/getting-started/project-structure) para distinguir los archivos fuente mantenidos de la salida generada y luego sigue [el recorrido de la primera plantilla](/es/users/getting-started/first-template).
