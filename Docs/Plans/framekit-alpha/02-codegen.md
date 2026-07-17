# 02. Generación estática

## Objetivo

Convertir la estructura de `src/templates` en datos e imports estáticos antes de que Next arranque. El runtime de la aplicación nunca escaneará el disco.

## Reglas del escáner

- [ ] Usar `src/templates` como única raíz.
- [ ] Considerar plantilla a cualquier directorio que contenga exactamente un archivo `template.tsx`; no buscar `config.ts`.
- [ ] Considerar categoría a cualquier directorio descendiente sin `template.tsx` que tenga plantillas por debajo.
- [ ] Ignorar entradas que comiencen con `.` o `_`.
- [ ] Exigir que cada segmento coincida con `^[a-z0-9]+(?:-[a-z0-9]+)*$`; el error debe incluir la ruta física y el segmento inválido.
- [ ] Fallar si existe `template.tsx` dentro de otro directorio que ya es una plantilla; las plantillas no pueden contener plantillas hijas.
- [ ] Ordenar por `slug` usando comparación alfabética estable, sin propiedad `order`.
- [ ] Omitir categorías que terminen sin plantillas descendientes.

## Archivos generados

- [ ] Crear `src/.framekit/manifest.ts` con un encabezado que indique que es generado y no debe editarse.
- [ ] Exportar `templateManifest` como un arreglo serializable de `{ slug, title, segments }`.
- [ ] Calcular `title` humanizando el último segmento: separar por guiones y capitalizar cada palabra.
- [ ] Crear `src/.framekit/registry.ts` con `'use client'` y `templateRegistry`.
- [ ] Tipar cada loader como `() => Promise<{ default: TemplateDefinition }>`.
- [ ] Generar imports dinámicos con rutas relativas de `.framekit` hacia `../templates/<ruta>/template`; no usar `@/`.
- [ ] Escribir ambos archivos solo cuando su contenido cambie, para evitar reinicios de desarrollo innecesarios.
- [ ] Añadir `/src/.framekit/` a `.gitignore`.

## Sustituciones en la aplicación

- [ ] Cambiar el script `templates:generate` para ejecutar el nuevo generador.
- [ ] Conservar temporalmente `templates:watch`, pero observar altas, bajas y cambios de directorio bajo `src/templates`.
- [ ] Eliminar `src/generated/` y ambos registros antiguos después de migrar sus importadores.
- [ ] Eliminar `src/lib/templates/read-template-catalog.ts` y `get-template-config.ts` cuando la navegación use el manifiesto.
- [ ] Eliminar `outputFileTracingIncludes` de `next.config.ts`; `output: 'standalone'` se conserva si sigue siendo necesario para Studio.

## Cierre

- [ ] `pnpm templates:generate` crea manifiesto y registro para la plantilla piloto.
- [ ] Modificar el contenido de una plantilla no requiere regenerar; crear, borrar o mover su `template.tsx` sí.
- [ ] `pnpm build` no ejecuta `node:fs` desde código de aplicación ni requiere incluir configuraciones en el tracing de Next.
