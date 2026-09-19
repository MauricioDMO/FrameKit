---
title: Solucionar problemas de instalación
description: Diagnostica problemas de creación de proyectos, instalación de dependencias, generación e inicio del servidor de desarrollo.
sidebar:
  order: 2
---

## El creador rechaza el destino

**Síntoma:** `create-framekit` informa de que el directorio de destino ya existe.

**Causa probable:** El destino existe, incluso cuando está vacío. El creador no lo sobrescribe.

**Comprobación:** Verifica la ruta exacta del destino antes de ejecutar el creador.

**Corrección:** Elige un nombre de directorio nuevo, o elimina o cambia el nombre del directorio existente solo después de confirmar que no contiene nada que necesites. Consulta [Crear un proyecto](/es/users/getting-started/create-project).

## Faltan las dependencias o el comando `framekit`

**Síntoma:** `pnpm dev`, `pnpm framekit generate` u otro comando del proyecto no puede encontrar las dependencias instaladas o la CLI de FrameKit.

**Causa probable:** La instalación se omitió o no terminó.

**Comprobación:** Desde la raíz del proyecto generado, verifica que `node_modules` esté presente y revisa el error de instalación anterior.

**Corrección:** Instala las dependencias y luego genera los archivos del proyecto:

```bash
pnpm install
pnpm framekit generate
```

Si pnpm solicita aprobar scripts de compilación, ejecuta `pnpm approve-builds` y repite el comando de instalación o generación necesario. No uses `--ignore-scripts` como reparación general.

## La generación falla durante la configuración

**Síntoma:** `pnpm framekit generate` se detiene con un error al crear el registro.

**Causa probable:** Un archivo de origen de plantilla o marca no es válido, falla una importación o una ruta descubierta no cumple el contrato de origen.

**Comprobación:** Ejecuta el comando desde la raíz del proyecto y lee la primera ruta de origen informada. Después, ejecuta:

```bash
pnpm framekit check
```

**Corrección:** Corrige el archivo indicado en `src/templates/` o `src/brand/` y vuelve a ejecutar `pnpm framekit generate`. Consulta [Solución de problemas de plantillas y recursos](/es/users/troubleshooting/templates-and-assets) para conocer las reglas de descubrimiento.

## El servidor de desarrollo no puede iniciarse en su puerto

**Síntoma:** `pnpm dev` termina porque el puerto solicitado no está disponible.

**Causa probable:** Otro proceso está usando el puerto seleccionado, o `PORT` está fuera del rango de `1` a `65535`.

**Comprobación:** Comprueba qué proceso está usando el puerto y revisa el valor de `PORT`.

**Corrección:** Detén el proceso en conflicto o elige un puerto válido disponible, por ejemplo:

```bash
PORT=3001 pnpm dev
```

En Windows, establece `PORT` con la sintaxis de tu shell antes de ejecutar `pnpm dev`.

## La exportación PNG no encuentra Chromium después de la instalación

**Síntoma:** El proyecto se inicia, pero la exportación de Studio indica que el navegador no está disponible.

**Causa probable:** El navegador Chromium de Playwright no se ha instalado para el entorno del proyecto.

**Comprobación:** Ejecuta el comando de instalación del navegador desde la raíz del proyecto.

**Corrección:** Instala Chromium y añade `--with-deps` en Linux cuando falten dependencias del sistema:

```bash
pnpm framekit browser install
pnpm framekit browser install --with-deps
```

Usa el segundo comando en lugar del primero en un entorno Linux que necesite las dependencias del sistema del navegador. Consulta [Solución de problemas de renderizado](/es/users/troubleshooting/rendering).
