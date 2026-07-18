# 03. Editor y validación

> Revisión posterior: los errores como texto fijo, la mutación durante reset, la
> adaptación incompleta de campos y el foco del primer error se corrigen en
> [04.5. Endurecimiento del contrato](04.5-hardening.md). Sus reglas sustituyen
> los puntos históricos correspondientes de esta fase.

## Carga de una definición

- [x] Mantener la página de ruta como Server Component solo para validar que el slug exista en `templateManifest`.
- [x] Crear un componente de ruta cliente dentro de Studio que reciba el slug, consulte `templateRegistry[slug]` y cargue `module.default`.
- [x] Mostrar un estado de carga mientras se importa la plantilla y un error claro si el loader falla.
- [x] Pasar a `FrameKitEditor` únicamente `slug` y la `TemplateDefinition` ya cargada; el paquete no conocerá el registro generado del consumidor.
- [x] Ejecutar `validateTemplateDefinition` al cargar; no renderizar ni exportar una definición inválida.

## Estado y resolución

El estado persistido contendrá solo cambios del usuario. Los defaults y `content` siempre se vuelven a resolver desde la definición actual.

```ts
type EditorState = {
  selectedLocale: string
  dataByLocale: Record<string, Record<string, string>>
}
```

- [x] Inicializar `selectedLocale` con la primera clave de `content`.
- [x] Inicializar `dataByLocale` vacío; un locale sin entrada representa cero ediciones.
- [x] Para pintar o exportar, llamar a `resolveTemplateData(definition, selectedLocale, dataByLocale[selectedLocale])`.
- [x] Al editar un campo, modificar solo `dataByLocale[selectedLocale][fieldKey]`.
- [x] Al cambiar idioma, cambiar solo `selectedLocale`; no sobrescribir `dataByLocale`.
- [x] Al restablecer, eliminar la entrada de `dataByLocale[selectedLocale]` y conservar las ediciones de los otros idiomas.
- [x] Persistir con la clave `framekit:<slug>:v1` después de hidratar el cliente.
- [x] Al restaurar, aceptar solo locales y claves de campo declaradas; ignorar datos corruptos, desconocidos o no string.

## Validación de exportación

- [x] Validar los datos ya resueltos, no solo las ediciones guardadas.
- [x] Para `required: true` o ausencia de `required`, rechazar cadenas vacías tras `trim()`.
- [x] Para `number`, permitir vacío solo si el campo no es requerido; en otro caso exigir un número finito.
- [x] Para `number`, aplicar `min` y `max` solo cuando exista un valor numérico válido.
- [x] Para `url`, permitir vacío solo si no es requerido; aceptar rutas que comiencen por `/` y URLs absolutas `http:` o `https:`; rechazar los demás valores.
- [x] No validar formato de color adicionalmente durante alpha: el control nativo y el valor string son suficientes.
- [x] Regla histórica: devolver mensajes fijos en español. La fase 04.5 la sustituye por códigos estructurados traducidos por la interfaz.
- [x] Ejecutar la validación al pulsar Descargar, enfocar el primer campo inválido y abortar la exportación si hay errores.
- [x] Limpiar el error de un campo al modificarlo; no bloquear la vista previa por errores.

## PNG y presentación

- [x] Mantener la espera de `document.fonts.ready` y `modern-screenshot`.
- [x] Pasar a `render` los datos resueltos, el locale seleccionado, `width` y `height` de la definición.
- [x] Descargar como `${slug.replaceAll('/', '-')}.png`.
- [x] Conservar zoom, arrastre, escala y tema actual; no rehacer la vista previa durante esta migración.

## Cierre

- [x] Al editar español, cambiar a inglés y volver a español, se restaura exactamente el texto editado.
- [x] Restablecer inglés no altera español.
- [x] Requerido vacío, número fuera de rango y URL inválida bloquean la descarga.
- [x] Un PNG válido conserva las dimensiones declaradas aunque la vista previa tenga otra escala.
