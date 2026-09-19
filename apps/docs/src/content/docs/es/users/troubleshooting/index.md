---
title: Solución de problemas
description: Encuentra diagnósticos prácticos para instalar, generar, usar y desplegar proyectos de FrameKit.
sidebar:
  order: 1
---

Empieza con la página que corresponda a la parte de tu proyecto que falla:

- [Instalación](/es/users/troubleshooting/installation) cubre la creación del proyecto, las dependencias y el inicio del desarrollo.
- [Plantillas y recursos](/es/users/troubleshooting/templates-and-assets) cubre el descubrimiento del código fuente y de los archivos de imagen.
- [Registro generado](/es/users/troubleshooting/generated-registry) cubre los módulos generados y la salida obsoleta.
- [Studio](/es/users/troubleshooting/studio) cubre el editor, el catálogo de marca, las cargas y la exportación a PNG.
- [Acceso](/es/users/troubleshooting/access) cubre el inicio de sesión, las sesiones, los usuarios y los tokens de API.
- [Renderizado](/es/users/troubleshooting/rendering) cubre la API de imágenes del lado del servidor.
- [Despliegue](/es/users/troubleshooting/deployment) cubre el entorno de ejecución, la persistencia, los proxies y el inicio en producción.

## Primeras comprobaciones

Desde la raíz del proyecto, ejecuta el comando que corresponda al síntoma:

```bash
pnpm framekit check
pnpm framekit generate
```

`check` ejecuta primero `generate` y después valida las definiciones de plantillas y el contenido resuelto. `generate` actualiza el registro y los clientes generados en `src/generated/framekit/` y copia los recursos de plantilla descubiertos en `public/framekit/templates/`. Corrige los archivos bajo `src/templates/` o `src/brand/` y vuelve a ejecutar el comando; no edites la salida generada.

Para obtener instrucciones de configuración, consulta [Crear un proyecto](/es/users/getting-started/create-project), [Estructura del proyecto](/es/users/getting-started/project-structure) y [Usar Studio](/es/users/guides/use-studio).
