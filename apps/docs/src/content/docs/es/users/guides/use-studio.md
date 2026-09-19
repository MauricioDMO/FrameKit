---
title: Usar Studio
description: Inicia Studio de FrameKit, edita una plantilla o inspecciona un componente de marca y exporta un PNG.
sidebar:
  order: 4
---

Usa esta guía después de [crear un proyecto](/es/users/getting-started/create-project) o [integrar un proyecto existente](/es/users/getting-started/existing-project). Cubre el flujo normal de Studio; la [página de conceptos de Studio](/es/users/concepts/studio) explica el modelo detrás de cada paso.

## 1. Iniciar Studio

Desde la raíz del proyecto, valida el código fuente actual y el registro generado:

```bash
pnpm framekit check
```

Para una base de datos vacía, define `FRAMEKIT_ADMIN_PASSWORD` antes del primer inicio de sesión. `FRAMEKIT_ADMIN_USERNAME` es opcional y su valor predeterminado es `admin`. Mantén estos valores en el entorno de ejecución y no en el control de versiones.

Inicia el servidor de desarrollo según la configuración de tu proyecto. Los proyectos generados configuran `pnpm dev` para ejecutar `framekit dev`:

```bash
pnpm dev
```

En un proyecto integrado, usa el comando de desarrollo de FrameKit, a menos que el script `dev` del proyecto esté configurado explícitamente para ejecutarlo:

```bash
pnpm framekit dev
```

Abre `http://localhost:3000/login`. La URL raíz redirige a `/editor`. El formulario de inicio de sesión crea la sesión que protege las secciones de Studio.

## 2. Elegir una sección de Studio

Después de iniciar sesión, usa la barra lateral para elegir:

- **Plantillas** (`/editor`) para explorar las carpetas de plantillas generadas;
- **Marca** (`/brand`) para inspeccionar vistas previas reutilizables de marca; o
- **Ajustes** (`/settings`) desde el menú de apariencia.

Selecciona una entrada de plantilla o de marca para abrir su ruta con slug. Las plantillas abren el editor. Las entradas de marca abren una vista previa y una descripción, no controles de plantilla editables.

Si falta una entrada después de cambiar archivos de código fuente, ejecuta:

```bash
pnpm framekit generate
```

El comando actualiza los manifiestos descartables de plantillas y marcas. No edites archivos dentro de `src/generated/framekit/` o `public/framekit/`; corrige el código fuente y vuelve a generar.

## 3. Editar una plantilla

En una ruta de plantilla:

1. Elige un valor en el selector de variantes.
2. Edita los controles del panel de contenido.
3. Observa cómo se actualiza el lienzo cuando cambian los valores.
4. Corrige cualquier mensaje de campo antes de exportar.

Los controles disponibles provienen de la definición de la plantilla. Los campos de texto, número, booleano, opción, color e imagen usan sus controles de edición correspondientes. Consulta [campos de plantilla](/es/users/concepts/templates/fields) para conocer las reglas de los campos, en lugar de tratar el editor como un esquema separado.

El selector de variantes cambia el contenido de la plantilla. El selector de idioma de la interfaz en el menú de apariencia actualiza los mensajes y las etiquetas de Studio, `document.documentElement.lang` y la cookie `locale`; no selecciona una variante. Las claves de plantilla como `en` y `es` no se tratan automáticamente como idiomas.

## 4. Inspeccionar la vista previa

Al principio, el lienzo se ajusta al área disponible. Usa los controles de vista previa según sea necesario:

- Elige `100%` para inspeccionar el tamaño real del lienzo.
- Elige `Ajustar` para volver a un ajuste responsive centrado.
- Mantén presionada `Ctrl` mientras te desplazas sobre el lienzo para ampliar alrededor del puntero.
- Arrastra el lienzo para desplazarte después de ampliar.

La vista previa del editor es local y sirve como ayuda de edición. La salida PNG usa el servidor mediante `POST /api/framekit/images/render` en lugar de generarse desde la vista previa.

## 5. Restablecer una variante

Studio conserva la variante seleccionada y las ediciones de cada plantilla en el almacenamiento local del navegador. Al volver a cargar la página, se restauran las ediciones de esa plantilla y variante. Los registros almacenados con formato incorrecto y los valores que ya no coinciden con los campos o variantes actuales se descartan; la validación normal de campos se sigue aplicando a los datos restaurados.

Haz clic en el icono de restablecimiento junto al selector de variantes para eliminar las ediciones de la variante activa. Restablecer no cambia la variante seleccionada ni elimina las ediciones de otras variantes. Tampoco modifica `template.tsx`.

## 6. Subir una imagen durante el desarrollo

Inicia el servidor de desarrollo de FrameKit y abre una plantilla con un campo de imagen:

```bash
pnpm framekit dev
```

En un proyecto generado, `pnpm dev` es equivalente porque su script `dev` ejecuta `framekit dev`. El servidor de desarrollo de FrameKit gestiona las cargas mediante `POST /framekit/assets`; ese endpoint solo está disponible mientras se ejecuta `pnpm framekit dev` o su equivalente en un proyecto generado. No supongas que un comando `pnpm dev` arbitrario o un `next dev` simple lo proporciona. El control de carga se muestra solo para los campos de imagen durante el desarrollo. Selecciona un PNG, JPEG, WebP o GIF de hasta 8 MB.

El scope del campo controla dónde se escribe el asset:

- `variant` reemplaza el asset de la variante seleccionada;
- `common` reemplaza el asset compartido en `assets/common`.

Studio escribe el asset de origen, regenera el manifiesto y vuelve a cargar la página. La carga requiere la sesión iniciada en el mismo origen. Studio en producción no expone este control de carga. Consulta [usar recursos de imagen](/es/users/guides/use-image-assets) antes de cambiar el layout de assets o el scope del campo.

## 7. Descargar o copiar un PNG

Usa la acción de exportación en la cabecera del editor después de validar los datos actuales:

1. Selecciona **Descargar PNG** para guardar la imagen generada.
2. Abre la opción secundaria de la misma acción y selecciona **Copiar PNG** para colocar la imagen generada en el portapapeles.

Ambas acciones usan el renderizador del servidor mediante `POST /api/framekit/images/render` y la plantilla, variante, ediciones y assets descubiertos actuales. La vista previa del navegador permanece local. Mientras se genera la imagen, la acción se desactiva y muestra su estado de generación. Los errores de validación del servidor regresan al campo correspondiente en lugar de producir una imagen no válida.

Copiar requiere compatibilidad del navegador con la escritura de datos `image/png` en el portapapeles. Si esa compatibilidad no está disponible, Studio informa del fallo de copia en lugar de indicar éxito silenciosamente.

Para conocer los contratos del lado del código fuente relacionados con campos, variantes y assets, consulta [contenido y variantes](/es/users/concepts/templates/content-and-variants), [usar recursos de imagen](/es/users/guides/use-image-assets) y la [referencia de plantillas](/es/users/reference/template).
