---
title: CLI de create-framekit
description: Crea un proyecto de FrameKit de forma interactiva o no interactiva y actualiza sus skills oficiales.
sidebar:
  order: 13
---

`create-framekit` se distribuye como `@mauriciodmo/create-framekit` y copia la plantilla inicial oficial en un directorio de proyecto nuevo.

## Crear un proyecto

```text
create-framekit [project-directory] [-y|-n]
```

Sin `-y` ni `-n`, el creador solicita un nombre de proyecto si falta y un gestor de paquetes cuando no puede detectar uno. También pregunta si se deben instalar las dependencias; cuando se usa pnpm y se instalarán dependencias, pregunta si debe ejecutar `pnpm approve-builds`; por último, pregunta si se debe inicializar Git. Los gestores de paquetes compatibles son pnpm y npm.

Cuando se selecciona la instalación de dependencias, el creador ejecuta el comando de instalación del gestor de paquetes seleccionado y después genera el catálogo. Con pnpm, puede ejecutar `pnpm approve-builds` antes de la generación. Cuando se selecciona Git, ejecuta `git init`, añade todos los archivos al área de preparación y crea el commit `Initial FrameKit project`.

El destino no debe existir ya, ni siquiera como un directorio vacío.

### Flags no interactivos

`-y` acepta las solicitudes y `-n` las rechaza. Con cualquiera de los dos flags, el gestor de paquetes predeterminado es pnpm si no se detecta ninguno. Si además no se proporciona un directorio, el destino predeterminado es `./framekit`.

```bash
pnpm dlx @mauriciodmo/create-framekit -y
pnpm dlx @mauriciodmo/create-framekit my-project -n
```

Con npm, la invocación publicada equivalente es:

```bash
npm exec --yes @mauriciodmo/create-framekit -- my-project
```

Cuando se selecciona npm, el creador elimina el `pnpm-workspace.yaml` del proyecto generado antes de instalar.

## `update-skills`

Copia las skills oficiales incluidas con el creador instalado en un proyecto existente:

```text
create-framekit update-skills [project-directory]
```

El directorio predeterminado es `.` y debe existir previamente. El comando reemplaza los directorios de skills oficiales coincidentes dentro de `.agents/skills/`; las demás carpetas no se seleccionan para esta actualización.

```bash
pnpm dlx @mauriciodmo/create-framekit update-skills
npm exec --yes @mauriciodmo/create-framekit -- update-skills ./my-framekit
```

Consulta [crear un proyecto](/es/users/getting-started/create-project), [estructura del proyecto](/es/users/getting-started/project-structure) y la [CLI de FrameKit](/es/users/reference/cli/framekit).
