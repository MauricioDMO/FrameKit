# 03. Editor y validación

## Carga de una definición

- [ ] Mantener la página de ruta como Server Component solo para validar que el slug exista en `templateManifest`.
- [ ] Crear un componente de ruta cliente dentro de Studio que reciba el slug, consulte `templateRegistry[slug]` y cargue `module.default`.
- [ ] Mostrar un estado de carga mientras se importa la plantilla y un error claro si el loader falla.
- [ ] Pasar a `FrameKitEditor` únicamente `slug` y la `TemplateDefinition` ya cargada; el paquete no conocerá el registro generado del consumidor.
- [ ] Ejecutar `validateTemplateDefinition` al cargar; no renderizar ni exportar una definición inválida.

## Estado y resolución

El estado persistido contendrá solo cambios del usuario. Los defaults y `content` siempre se vuelven a resolver desde la definición actual.

```ts
type EditorState = {
  selectedLocale: string
  dataByLocale: Record<string, Record<string, string>>
}
```

- [ ] Inicializar `selectedLocale` con la primera clave de `content`.
- [ ] Inicializar `dataByLocale` vacío; un locale sin entrada representa cero ediciones.
- [ ] Para pintar o exportar, llamar a `resolveTemplateData(definition, selectedLocale, dataByLocale[selectedLocale])`.
- [ ] Al editar un campo, modificar solo `dataByLocale[selectedLocale][fieldKey]`.
- [ ] Al cambiar idioma, cambiar solo `selectedLocale`; no sobrescribir `dataByLocale`.
- [ ] Al restablecer, eliminar la entrada de `dataByLocale[selectedLocale]` y conservar las ediciones de los otros idiomas.
- [ ] Persistir con la clave `framekit:<slug>:v1` después de hidratar el cliente.
- [ ] Al restaurar, aceptar solo locales y claves de campo declaradas; ignorar datos corruptos, desconocidos o no string.

## Validación de exportación

- [ ] Validar los datos ya resueltos, no solo las ediciones guardadas.
- [ ] Para `required: true` o ausencia de `required`, rechazar cadenas vacías tras `trim()`.
- [ ] Para `number`, permitir vacío solo si el campo no es requerido; en otro caso exigir un número finito.
- [ ] Para `number`, aplicar `min` y `max` solo cuando exista un valor numérico válido.
- [ ] Para `url`, permitir vacío solo si no es requerido; aceptar rutas que comiencen por `/` y URLs absolutas `http:` o `https:`; rechazar los demás valores.
- [ ] No validar formato de color adicionalmente durante alpha: el control nativo y el valor string son suficientes.
- [ ] Devolver errores como `Record<fieldKey, message>` con mensajes fijos en español.
- [ ] Ejecutar la validación al pulsar Descargar, enfocar el primer campo inválido y abortar la exportación si hay errores.
- [ ] Limpiar el error de un campo al modificarlo; no bloquear la vista previa por errores.

## PNG y presentación

- [ ] Mantener la espera de `document.fonts.ready` y `modern-screenshot`.
- [ ] Pasar a `render` los datos resueltos, el locale seleccionado, `width` y `height` de la definición.
- [ ] Descargar como `${slug.replaceAll('/', '-')}.png`.
- [ ] Conservar zoom, arrastre, escala y tema actual; no rehacer la vista previa durante esta migración.

## Cierre

- [ ] Al editar español, cambiar a inglés y volver a español, se restaura exactamente el texto editado.
- [ ] Restablecer inglés no altera español.
- [ ] Requerido vacío, número fuera de rango y URL inválida bloquean la descarga.
- [ ] Un PNG válido conserva las dimensiones declaradas aunque la vista previa tenga otra escala.
