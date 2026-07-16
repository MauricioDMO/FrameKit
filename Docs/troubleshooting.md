# Solución de problemas

[Volver al índice](README.md)

## La plantilla no aparece

Comprueba que la carpeta contiene exactamente:

```text
config.ts
template.tsx
```

Después ejecuta:

```bash
pnpm templates:generate
```

Revisa también que `config.ts` exporte por defecto la configuración.

## Falta el componente de la plantilla

El registro cliente está desactualizado. Ejecuta `pnpm templates:generate` y reinicia el servidor si estaba usando un build anterior.

No edites `src/generated/template-registry.ts` manualmente.

## La ruta devuelve 404

Los segmentos solo aceptan minúsculas, números y guiones. Evita espacios, guiones bajos, mayúsculas y caracteres acentuados en nombres de carpeta.

Ejemplo válido:

```text
redes-sociales/instagram/historia-promocional
```

## La exportación PNG falla

Revisa la consola del navegador. Las causas habituales son:

- Una imagen remota sin permisos CORS.
- Una URL de recurso inexistente.
- Una fuente externa que no pudo cargarse.
- Contenido que depende de una API no disponible.

Prefiere recursos locales bajo `public/`. Si necesitas recursos remotos, configura CORS en el servidor de origen.

## El PNG no tiene el tamaño esperado

El tamaño final proviene de `width` y `height` en `config.ts`. La escala de la vista previa solo afecta la presentación dentro del editor.

## El diseño no cambia de idioma

Cada clave de `languages` debe existir en `metadata`, `label`, `placeholder` cuando exista y `content`. Cada entrada de `content` debe incluir todos los `field.key`. Comprueba que el texto fijo de `template.tsx` use `locale` de `TemplateProps`, no un literal en un único idioma.

## Los cambios estructurales no se detectan

El watcher observa altas y eliminaciones. Si moviste varias carpetas o el registro quedó inconsistente, ejecuta de nuevo:

```bash
pnpm templates:generate
```

## El build falla por una configuración

TypeScript valida los archivos `config.ts`. Corrige la propiedad indicada y conserva:

```ts
export default defineTemplateConfig({
  // configuración
})
```

Consulta la [referencia de configuración para agentes](skills/image-studio/references/template-config.md) para ver todos los campos.
