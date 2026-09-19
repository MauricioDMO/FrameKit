---
title: Solución de problemas del registro generado
description: Diagnostica módulos de FrameKit generados faltantes, obsoletos o no válidos.
sidebar:
  order: 4
---

## Faltan módulos generados

**Síntoma:** No se pueden resolver importaciones como `@framekit/generated/templates` o el cliente de Studio generado.

**Causa probable:** El proyecto no ha completado la generación o se eliminó el directorio generado.

**Comprobación:** Confirma que `src/generated/framekit/` no exista o que le falte alguno de estos archivos: `templates.ts`, `brands.ts`, `studio-client.tsx` y `render-client.tsx`.

**Solución:** Desde la raíz del proyecto, ejecuta:

```bash
pnpm framekit generate
```

Si la generación falla, corrige primero el error del código fuente. Consulta [Estructura del proyecto](/es/users/getting-started/project-structure) para ver las rutas generadas.

## Studio sigue mostrando una lista desactualizada de plantillas o marcas

**Síntoma:** Una plantilla o marca modificada, añadida o eliminada no se refleja en Studio.

**Causa probable:** No se volvió a generar el registro o falló una generación durante el desarrollo.

**Comprobación:** Inspecciona la salida del servidor de desarrollo en busca de un error de generación y compara los directorios de origen con el registro generado.

**Solución:** Corrige el código fuente, ejecuta `pnpm framekit generate` y vuelve a cargar Studio. Durante el desarrollo, reinicia `pnpm framekit dev` si Studio no detecta el registro actualizado.

## Los cambios en archivos generados no se conservan

**Síntoma:** Un cambio manual en `src/generated/framekit/` o `public/framekit/templates/` desaparece o no tiene efecto.

**Causa probable:** Esos directorios contienen salida generada; los comandos de FrameKit vuelven a escribir los archivos administrados.

**Comprobación:** Busca la plantilla o el componente de marca correspondiente en `src/templates/` o `src/brand/`. Para los recursos de plantilla copiados, inspecciona el origen en `src/templates/<template>/assets/`.

**Solución:** Edita el código fuente mantenido y luego ejecuta `pnpm framekit check` o `pnpm framekit generate`, según corresponda. Nunca uses la salida generada como fuente de verdad.

## La generación falla al cargar una plantilla

**Síntoma:** `generate` informa de un error de importación o de carga de plantilla en lugar de escribir el registro.

**Causa probable:** No se puede cargar un módulo de plantilla o una de sus importaciones, o no se puede validar su definición.

**Comprobación:** Ejecuta `pnpm framekit generate` desde la raíz del proyecto y usa la ruta de origen indicada para probar la importación o definición que falla.

**Solución:** Corrige el módulo o la definición y vuelve a ejecutar `pnpm framekit check` y `pnpm framekit generate`.

## Los recursos copiados están obsoletos o faltan

**Síntoma:** Existe una entrada de plantilla generada, pero su recurso no está disponible en `public/framekit/templates/`.

**Causa probable:** Falló el descubrimiento de recursos o el registro se generó antes de añadir o modificar el recurso de origen.

**Comprobación:** Verifica la estructura de recursos y las reglas de nomenclatura en [Solución de problemas de plantillas y recursos](/es/users/troubleshooting/templates-and-assets) y luego inspecciona la salida de generación.

**Solución:** Corrige el recurso de origen y ejecuta `pnpm framekit generate`. El comando actualiza los recursos de plantilla copiados junto con el registro.
