# 04. Navegación y migración

Este plan refleja el estado actual del repositorio. La migración no implica
eliminar el i18n de la interfaz ni fijar el idioma de la aplicación en
español.

## Ya implementado y verificado

- [x] `scripts/generate-template-registry.mjs` busca `template.tsx` a cualquier profundidad y genera `src/.framekit/manifest.ts` y `src/.framekit/registry.ts`.
- [x] `manifestToNavigation()` deriva categorías de los segmentos intermedios, reutiliza prefijos compartidos, humaniza los nombres de carpeta y usa el título del manifiesto para la plantilla.
- [x] La navegación genera enlaces con el formato `/editor/<slug>` y ordena cada nivel únicamente por título usando locale español; no depende de órdenes artificiales.
- [x] La barra lateral de `src/app/editor/layout.tsx` recibe la navegación derivada del manifiesto.
- [x] Los tipos de navegación (`TemplateNavigationNode` y sus variantes) viven junto a `manifestToNavigation()` y ya no dependen de `src/lib/templates/types.ts`.
- [x] La ruta `src/app/editor/[[...slug]]/page.tsx` valida el slug contra el manifiesto y carga la plantilla mediante `templateRegistry`.
- [x] La raíz (`src/app/page.tsx`) redirige a `/editor`.
- [x] La plantilla piloto está migrada a `src/templates/redes-sociales/instagram/promocion-cuadrada/template.tsx`; su `config.ts` ya no existe.
- [x] `src/generated/`, `read-template-catalog.ts`, `get-template-config.ts` y `src/lib/templates/types.ts` ya no existen; el registro usa `src/.framekit/`.
- [x] `pnpm templates:generate` termina correctamente y registra una plantilla.
- [x] `pnpm build` termina correctamente y expone `/editor/[[...slug]]`.
- [x] `pnpm lint` termina sin errores; mantiene cinco avisos existentes de variables `error` sin usar en los componentes de campos.

## Trabajo restante: navegación y contrato legado

- [x] Dejar de depender de `src/lib/templates/types.ts` desde la navegación; los tipos de navegación están en `manifest-to-navigation.ts`.
- [x] Retirar `defineTemplateConfig`, `FolderConfig`, `TemplateConfig` y los tipos auxiliares antiguos junto con sus importadores.
- [x] Comprobar en ejecución que `/editor/redes-sociales/instagram/promocion-cuadrada` carga la plantilla y que un slug inexistente responde como no encontrado.
- [x] No se añaden rutas con locale: las rutas compartibles siguen siendo `/editor/redes-sociales/instagram/promocion-cuadrada`.

## Decisiones de i18n de interfaz que se conservan

- [x] Se conserva `src/i18n/`, que actualmente define `es` y `en`, carga mensajes para la interfaz y expone `LocaleProvider`.
- [x] Se conserva `LanguageSelect` en los ajustes de la barra lateral; cambia el idioma de la interfaz y persiste la cookie `locale`.
- [x] El idioma inicial de la interfaz usa la cookie y, si no existe, `Accept-Language`, con `es` como fallback. No se fija `lang="es"`.
- [x] `src/proxy.ts` no existe actualmente; no se debe pedir su eliminación ni introducir una dependencia de ese archivo.

## Idioma de contenido que se conserva

- [x] El idioma del contenido se selecciona dentro del editor a partir de las claves de `definition.content`.
- [x] La plantilla piloto conserva contenido `es` y `en`, incluido el campo visible `language` y el renderizado dependiente del locale seleccionado.
- [x] El locale de contenido (`selectedLocale`) es independiente del locale de la interfaz (`LocaleProvider`); cambiar uno no elimina ni fija el otro.
- [x] Verificar manualmente en el navegador que ambos selectores pueden cambiarse por separado y que la exportación usa el contenido seleccionado.

## Retirada de `_folder.json`

Los dos archivos heredados ya no existen: `redes-sociales/_folder.json` e
`redes-sociales/instagram/_folder.json`.

- [x] El scanner ignora los archivos cuyo nombre empieza por `_`, por lo que `_folder.json` no participa en el manifiesto.
- [x] La navegación actual deriva `Redes Sociales` e `Instagram` de los segmentos de carpeta, no de las traducciones de `_folder.json`.
- [x] Los dos `_folder.json` fueron eliminados; sus traducciones no se trasladan al i18n de interfaz ni al contrato de contenido.
- [x] Después de eliminarlos, `pnpm templates:generate` sigue produciendo el manifiesto de la plantilla piloto.

## Criterios de cierre

- [x] `rg --files src/templates | rg '(^|/)_folder\.json$'` no devuelve resultados.
- [x] `rg -n 'defineTemplateConfig|template-config-registry|readTemplateCatalog|getTemplateConfig|FolderConfig|TemplateConfig' src` no devuelve referencias al contrato legado.
- [x] `pnpm templates:generate` termina correctamente y `src/.framekit/manifest.ts` contiene `redes-sociales/instagram/promocion-cuadrada`.
- [x] `pnpm lint` termina sin errores y `pnpm build` termina correctamente; lint mantiene cinco avisos existentes.
- [x] Con la aplicación ejecutándose, `/` redirige a `/editor`, `/editor` carga la navegación y `/editor/redes-sociales/instagram/promocion-cuadrada` carga la plantilla.
- [x] La navegación no contiene rutas `/es/...` ni `/en/...`; el selector de interfaz conserva `es` y `en`, y el selector de contenido sigue funcionando de forma independiente.
