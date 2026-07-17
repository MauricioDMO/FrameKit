# Plan: alinear documentación, skill y comportamiento

## Contexto

La revisión del 17 de julio de 2026 encontró afirmaciones de la documentación y del skill `image-studio` que no coinciden completamente con el comportamiento actual. Este documento conserva los hechos observados y las decisiones pendientes. No cambia el contrato de FrameKit por sí mismo.

## Decisiones pendientes

### 1. Restricciones de campos

**Estado actual**

- `required`, `min` y `max` se propagan a controles HTML en `src/components/editor/fields/components/`.
- `TemplateEditor` no usa un `<form>` ni consulta `validity`, por lo que se puede guardar, previsualizar y exportar un valor vacío o numérico fuera de `min`/`max`.
- La interfaz guarda el valor directamente en `sessionStorage` y lo entrega a la plantilla.

**Documentación afectada**

- `Docs/architecture.md`: presenta `required: false` como permiso para dejar un campo vacío.
- `Docs/creating-templates.md`: describe los campos como obligatorios por defecto.
- `Docs/using-the-editor.md`: presenta `number` como un campo con límites opcionales.
- `Docs/skills/image-studio/SKILL.md` y `references/template-config.md`: dan a entender que `required`, `min` y `max` son restricciones efectivas.

**Elegir una corrección**

1. Actualizar documentación y skill: describir estas propiedades como atributos o sugerencias de UI sin validación de edición ni de exportación.
2. Actualizar código: validar los campos antes de exportar y decidir el comportamiento para valores inválidos, incluidos los campos opcionales vacíos. Si se mantiene la edición libre, el error debe aparecer al exportar.

**Criterio de aceptación**

- La documentación no debe llamar obligatorio o limitado a un campo si el editor permite exportarlo en ese estado.
- Si se implementa validación, añadir pruebas para vacío requerido, número menor que `min`, número mayor que `max` y valor opcional vacío.

### 2. Claves localizadas adicionales

**Estado actual**

- `defineTemplateConfig` aplica `ExactKeys` a `metadata` y al nivel de idiomas de `content` en `src/lib/templates/types.ts`.
- `fields[].label` y `fields[].placeholder` solo se restringen mediante `LocalizedValue<Languages>`: exigen las claves declaradas, pero aceptan claves adicionales.
- Las entradas internas de `content` exigen los `field.key` declarados, pero tampoco rechazan claves de campo adicionales.

**Documentación afectada**

- `Docs/skills/image-studio/references/template-config.md` afirma que TypeScript falla al declarar cualquier clave localizada ausente de `languages`.

**Elegir una corrección**

1. Actualizar la referencia: aclarar que se exigen las claves de `languages`, pero que actualmente `label`, `placeholder` y las entradas de `content` pueden contener claves adicionales.
2. Actualizar código: extender la comprobación de claves exactas a etiquetas, placeholders y cada contenido localizado, para que la afirmación del skill sea cierta.

**Criterio de aceptación**

- La referencia debe reflejar exactamente las garantías de TypeScript.
- Si se endurecen los tipos, añadir comprobaciones de tipo que fallen ante claves de idioma o campo adicionales en esas tres ubicaciones.

### 3. Ejemplo de Markdown contradictorio

**Estado actual**

- El parser solo se ejecuta mediante `Markdown` en `src/components/templates/markdown.tsx`.
- `Docs/skills/image-studio/SKILL.md` indica usar `Markdown` para campos `text` y `textarea` que admiten formato.
- `Docs/skills/image-studio/references/design-and-assets.md` muestra `{data.title}` directamente, por lo que un agente que copie el ejemplo no renderizará Markdown.

**Corrección requerida**

- Actualizar el ejemplo del skill para importar y usar `Markdown` cuando `title` sea un campo de texto con formato.
- Si el ejemplo pretende mostrar un campo sin formato, debe declarar explícitamente que no admite Markdown y conservar la interpolación directa.

**Criterio de aceptación**

- Los ejemplos del skill no deben contradecir su regla de renderizado ni la implementación del parser.

### 4. Nombre de archivo de exportación

**Estado actual**

- La exportación usa `metadata[language].fileName` cuando existe.
- Si no existe, `TemplateEditor` usa el slug con `/` reemplazado por `-` en `src/components/editor/template-editor.tsx`.

**Documentación afectada**

- `Docs/using-the-editor.md` solo describe el nombre definido por `fileName`.

**Corrección requerida**

- Actualizar la documentación para indicar el fallback `<slug-con-guiones>.png` y conservar que `fileName` es opcional.

**Criterio de aceptación**

- Una plantilla sin `fileName` tiene un nombre de descarga documentado y predecible.

### 5. Traducciones de `_folder.json`

**Estado actual**

- `_folder.json` se analiza como JSON sin validación runtime.
- El catálogo accede a `folderConfig.translations[locale].title` en `src/lib/templates/read-template-catalog.ts`.
- Una configuración de carpeta existente sin una traducción para `es` o `en` puede provocar un error al cargar ese catálogo.

**Documentación afectada**

- `Docs/creating-templates.md` y `Docs/skills/image-studio/references/project-layout.md` muestran un ejemplo completo, pero no declaran que todas las locales de interfaz sean obligatorias cuando existe `_folder.json`.

**Elegir una corrección**

1. Actualizar documentación y skill: exigir títulos para todas las locales definidas en `src/i18n/locales.ts`.
2. Actualizar código: validar el JSON y devolver un error claro, o aplicar el nombre humanizado cuando falte una traducción.

**Criterio de aceptación**

- Un `_folder.json` incompleto no debe causar un fallo no explicado en la carga del editor.
- La documentación debe expresar la política elegida para traducciones ausentes.

## Orden sugerido

1. Corregir el ejemplo de Markdown y documentar el fallback de `fileName`; son cambios de documentación sin decisión de producto.
2. Decidir la semántica de `required`, `min` y `max` antes de cambiar los textos que la describen.
3. Decidir si el contrato de `defineTemplateConfig` debe ser estricto o permisivo y alinear tipos y referencia.
4. Definir el comportamiento de `_folder.json` incompleto y protegerlo con una prueba.

## Verificación al cerrar

```bash
pnpm lint
pnpm build
```

Si se modifica código de validación o de catálogo, añadir pruebas específicas antes de considerar cerrado este plan.
