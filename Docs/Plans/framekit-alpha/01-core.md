# 01. Núcleo dentro de Studio

## Objetivo

Implementar y probar el contrato nuevo dentro de la aplicación actual antes de moverla a un workspace. La única plantilla existente será la prueba piloto; su `config.ts` se eliminará al cerrar esta fase.

## Archivos nuevos

```text
src/lib/framekit/
├── define-template.ts
├── resolve-template.ts
├── validate-template.ts
├── types.ts
├── markdown.tsx
├── fields/
│   ├── text.ts
│   ├── textarea.ts
│   ├── number.ts
│   ├── color.ts
│   ├── url.ts
│   └── index.ts
└── index.ts
```

No se crearán adaptadores entre `src/lib/templates` y `src/lib/framekit`. Las rutas antiguas se eliminan cuando sus consumidores se migren en las fases 2 a 4.

## Implementación

- [x] Implementar `fields.text`, `fields.textarea`, `fields.color` y `fields.url` como factories que devuelven un descriptor inmutable con su `kind`.
- [x] Implementar `fields.number` con `min?` y `max?` numéricos, conservando el valor editado como `string`.
- [x] Implementar `defineTemplate` como función de identidad tipada; no debe introducir registro global, I/O ni estado.
- [x] Implementar `getDefaultValues(definition.fields)` para producir un registro completo: cada campo obtiene `defaultValue ?? ''`.
- [x] Implementar `getLocales(definition)` con las claves de `content`, preservando el orden de declaración.
- [x] Implementar `resolveTemplateData(definition, locale, edits)` con este orden: defaults, contenido del locale sin `language`, y finalmente ediciones del usuario.
- [x] Implementar `validateTemplateDefinition` para comprobar dimensiones, campos reservados, al menos un idioma y estructura de contenidos cuando la definición se carga en runtime.
- [x] Mover `Markdown` y su parser a `src/lib/framekit`; su API sigue siendo `Markdown({ value, lists?, className?, style? })`.
- [x] Exportar desde `src/lib/framekit/index.ts` únicamente `defineTemplate`, `fields`, `Markdown` y los tipos públicos.
- [x] No exportar helpers internos de resolución ni validación hasta que el editor los necesite como API pública.

## Plantilla piloto

- [x] Reescribir `src/templates/redes-sociales/instagram/promocion-cuadrada/template.tsx` para que su default export sea `defineTemplate({...})`.
- [x] Mover `width`, `height`, campos y contenidos de `config.ts` dentro de esa definición.
- [x] Sustituir etiquetas localizadas de los campos por etiquetas fijas en español.
- [x] Añadir `language` a `content.es` y `content.en`.
- [x] Convertir la función de componente actual en la propiedad `render` de la definición.
- [x] Importar `Markdown` y `defineTemplate` desde `@/lib/framekit` durante esta etapa interna.
- [x] Eliminar `src/templates/redes-sociales/instagram/promocion-cuadrada/config.ts`.

## Cierre

- [x] La plantilla piloto no importa tipos, config ni componentes desde `src/lib/templates` o `src/components/templates`.
- [x] La definición carga, resuelve `es` y `en`, y entrega los mismos datos visuales que antes de la migración.
- [x] No se añade compatibilidad con `defineTemplateConfig`.
