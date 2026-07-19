# 02. Generación estática

> Revisión posterior: la regla histórica que prohibía subdirectorios dentro de
> una plantilla queda sustituida por
> [04.5. Endurecimiento del contrato](04.5-hardening.md). El contrato vigente
> detiene el recorrido al encontrar `template.tsx` y permite implementación
> auxiliar dentro de esa carpeta.

## Objetivo

Convertir la estructura de `src/templates` en datos e imports estáticos antes de que Next arranque. El runtime de la aplicación nunca escaneará el disco.

## Reglas del escáner

- [x] Usar `src/templates` como única raíz.
- [x] Considerar plantilla a cualquier directorio que contenga exactamente un archivo `template.tsx`; no buscar `config.ts`.
- [x] Considerar categoría a cualquier directorio descendiente sin `template.tsx` que tenga plantillas por debajo.
- [x] Ignorar entradas que comiencen con `.` o `_`.
- [x] Exigir que cada segmento coincida con `^[a-z0-9]+(?:-[a-z0-9]+)*$`; el error debe incluir la ruta física y el segmento inválido.
- [x] Regla histórica: fallar ante subdirectorios dentro de una plantilla. Esta regla queda sustituida por la fase 04.5 y no forma parte del contrato publicable.
- [x] Ordenar por `slug` usando comparación alfabética estable, sin propiedad `order`.
- [x] Omitir categorías que terminen sin plantillas descendientes.

## Archivos generados

- [x] Crear `.framekit/generated/templates.ts` con un encabezado que indique que es generado y no debe editarse.
- [x] Exportar `templates` con metadatos y loaders estáticos; derivar `templateManifest` como arreglo serializable.
- [x] Calcular `title` humanizando el último segmento: separar por guiones y capitalizar cada palabra.
- [x] Derivar `templateRegistry` del arreglo generado sin duplicar un archivo separado.
- [x] Tipar cada loader como `() => Promise<{ default: TemplateDefinition }>`.
- [x] Generar imports dinámicos con rutas relativas de `.framekit/generated` hacia `../../src/templates/<ruta>/template`; no usar `@/`.
- [x] Escribir el módulo solo cuando su contenido cambie, para evitar reinicios de desarrollo innecesarios.
- [x] Añadir `**/.framekit/` a `.gitignore`.

## Sustituciones en la aplicación

- [x] Reutilizar el generador TypeScript desde Studio mientras la CLI no existe.
- [x] Conservar el watcher, observando altas, bajas y cambios de directorio bajo `src/templates`.
- [x] Eliminar `src/generated/` y ambos registros antiguos después de migrar sus importadores.
- [x] Eliminar `src/lib/templates/read-template-catalog.ts` y `get-template-config.ts` cuando la navegación use el manifiesto.
- [x] Eliminar `outputFileTracingIncludes` de `next.config.ts`; `output: 'standalone'` se conserva si sigue siendo necesario para Studio.

## Cierre

- [x] El módulo generado contiene manifiesto y loaders para la plantilla piloto.
- [x] Modificar el contenido de una plantilla no requiere regenerar; crear, borrar o mover su `template.tsx` sí.
- [x] `pnpm build` no ejecuta `node:fs` desde código de aplicación ni requiere incluir configuraciones en el tracing de Next.
