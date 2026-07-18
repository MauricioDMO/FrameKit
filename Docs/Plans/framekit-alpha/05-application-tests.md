# 05. Pruebas de la aplicación

## Infraestructura

- [ ] Conservar Vitest y los scripts `test` y `typecheck` incorporados en la fase 04.5 como única infraestructura de pruebas TypeScript.
- [ ] Ejecutar scanner, manifest, resolver y validadores en entorno Node; reservar `jsdom` para las pruebas del editor que necesiten DOM o `localStorage`.
- [ ] Ampliar el `tsconfig` de fixtures creado en 04.5; los casos negativos siguen usando `@ts-expect-error`.
- [ ] No añadir pruebas visuales ni navegador end-to-end durante alpha; el build de Next y la prueba de paquete cubren la integración inicial.

## Límite interno del editor

- [x] Reubicar el editor reutilizable en `src/lib/framekit/editor/` como preparación para `packages/framekit/src/editor/`.
- [x] Mantener carga de registry, rutas, estados de carga e i18n de Studio fuera del editor reutilizable.
- [x] Separar restauración y transiciones del estado del hook de React para probarlas sin DOM.
- [x] Mantener los mensajes como props del editor; el núcleo y el editor no importan el proveedor i18n de Studio.

## Casos unitarios obligatorios

- [ ] `humanizeSegment('promocion-cuadrada')` produce `Promocion Cuadrada`.
- [ ] El scanner encuentra `template.tsx` a cualquier profundidad y no requiere `config.ts`.
- [ ] El scanner detiene el recorrido al encontrar una plantilla y permite dentro de ella archivos, componentes, helpers y assets auxiliares.
- [ ] El scanner ignora directorios que empiecen con `.` o `_`.
- [ ] El scanner rechaza un segmento con mayúsculas, guion bajo, espacios o acentos.
- [ ] El manifiesto ordena slugs alfabéticamente y excluye categorías vacías.
- [ ] El árbol de navegación comparte categorías anidadas y produce los enlaces `/editor/<slug>`.
- [ ] `resolveTemplateData` aplica defaults, luego contenido del locale y después edición del usuario.
- [ ] `resolveTemplateData` nunca copia `language` a `data`.
- [ ] Cambiar `selectedLocale` no modifica los overrides de otro idioma.
- [ ] Restablecer un locale elimina solo sus overrides.
- [ ] Restablecer no muta el estado anterior y cambiar o restablecer el locale limpia los errores visibles.
- [ ] La restauración de sesión descarta locale, campo o valor malformado.
- [ ] Un requerido vacío falla; uno opcional vacío pasa.
- [ ] Un número válido, menor que `min`, mayor que `max` y no numérico producen el resultado esperado.
- [ ] Una URL absoluta HTTP(S) y una ruta que inicia con `/` pasan; una URL con protocolo no permitido falla.
- [ ] La validación del núcleo devuelve códigos estructurados y la interfaz los traduce al idioma activo.
- [ ] Una definición runtime rechaza descriptores inválidos, límites incoherentes, dimensiones decimales y `render` ausente.

## Casos de integración de aplicación

- [ ] Crear un directorio temporal con al menos dos plantillas anidadas y ejecutar el generador contra él.
- [ ] Comparar el manifiesto y registry generados con el contenido esperado, incluidos imports relativos.
- [ ] Cargar la plantilla piloto mediante su loader y comprobar que el default export es una definición válida.
- [ ] Cargar una fixture con `defineTemplateBase` y un componente extraído conservando los tipos inferidos.
- [ ] Ejecutar `pnpm templates:generate` desde una copia limpia sin archivos `.framekit` previos.
- [ ] Ejecutar `pnpm build` después de la generación.

## Comandos de cierre

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

- [ ] Los cuatro comandos terminan correctamente desde una instalación limpia.
- [ ] Las fixtures de tipos positivas y negativas se ejecutan dentro de `pnpm typecheck`.
