# 04. Navegación y migración

## Navegación derivada del manifiesto

- [ ] Crear una función pura que reciba `templateManifest` y devuelva nodos `{ type: 'category' | 'template', slug, title, children? }`.
- [ ] Crear una categoría por cada segmento intermedio de un slug; reutilizar el mismo nodo cuando varios slugs compartan prefijo.
- [ ] Usar el nombre humanizado de la carpeta para categorías y el `title` del manifiesto para plantillas.
- [ ] Ordenar en cada nivel por título usando orden alfabético español; no mezclar categorías y plantillas por una prioridad artificial.
- [ ] No representar categorías vacías, porque el generador ya las excluye del manifiesto.
- [ ] Generar enlaces como `/editor/<slug>` sin locale de interfaz.
- [ ] Sustituir la barra lateral actual para que reciba este árbol serializable y no dependa de `TemplateNavigationNode` antiguo.

## Rutas y UI

- [ ] Mover `src/app/[locale]/editor/[[...slug]]/page.tsx` a `src/app/editor/[[...slug]]/page.tsx`.
- [ ] Mover la composición de barra lateral y contenido desde `src/app/[locale]/editor/layout.tsx` a `src/app/editor/layout.tsx`.
- [ ] Crear un `src/app/layout.tsx` único que cargue `globals.css`, fije `lang="es"` y conserve la inicialización de tema oscuro.
- [ ] Cambiar la página raíz para redirigir a `/editor` o presentar un enlace directo a esa ruta; no detectar `Accept-Language`.
- [ ] Reemplazar todos los mensajes del editor por textos fijos en español en el componente de editor durante alpha.
- [ ] Eliminar `LanguageSelect` de la barra lateral; conservar solo el selector de idioma de contenido dentro del editor.
- [ ] Mantener las rutas de plantilla compartibles: `/editor/redes-sociales/instagram/promocion-cuadrada`.

## Retirada del contrato anterior

- [ ] Eliminar `src/i18n/`, `src/proxy.ts`, `src/app/[locale]/` y los componentes exclusivamente usados por idioma de interfaz.
- [ ] Eliminar `src/lib/templates/types.ts`, `get-template-config.ts`, `read-template-catalog.ts` y el directorio cuando no tenga importadores.
- [ ] Eliminar `src/components/templates/markdown.tsx` cuando `Markdown` viva en `src/lib/framekit`.
- [ ] Eliminar `src/generated/` y sustituir sus importaciones por `src/.framekit/`.
- [ ] Eliminar cada `config.ts` y `_folder.json` de `src/templates` tras trasladar sus datos a `template.tsx` o a la estructura de carpetas.
- [ ] Eliminar referencias a los comandos y archivos antiguos en README, documentación y scripts.
- [ ] Actualizar la documentación de uso solo después de que el flujo descrito funcione realmente; no documentar opciones futuras del CLI.

## Inventario de la plantilla actual

- [ ] Convertir `redes-sociales/instagram/promocion-cuadrada` primero y comprobar la ruta nueva.
- [ ] Verificar que `redes-sociales` e `instagram` se muestren como categorías por su nombre de carpeta, sin sus `_folder.json`.
- [ ] Borrar los dos `_folder.json` existentes después de comprobar el título derivado.

## Cierre

- [ ] Una búsqueda del repositorio no devuelve importaciones activas de `config.ts`, `_folder.json`, `defineTemplateConfig`, `template-config-registry`, `readTemplateCatalog` ni `getTemplateConfig`.
- [ ] El build standalone no necesita archivos de plantilla fuera de los imports ya incluidos por `registry.ts`.
- [ ] La aplicación funciona en `/editor` y la selección de idioma controla solo contenido de plantilla.
