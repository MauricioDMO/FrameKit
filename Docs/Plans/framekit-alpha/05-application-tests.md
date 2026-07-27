# 05. Pruebas de la aplicación

## Infraestructura

- [x] Conservar Vitest y los scripts `test` y `typecheck` incorporados en la fase 04.5 como única infraestructura de pruebas TypeScript.
- [x] Ejecutar scanner, manifest, resolver y validadores en entorno Node; reservar `jsdom` para las pruebas del editor que necesiten DOM o `localStorage`.
- [x] Ampliar el `tsconfig` de fixtures creado en 04.5; los casos negativos siguen usando `@ts-expect-error`.
- [x] No añadir pruebas visuales ni navegador end-to-end durante alpha; el build de Next y la prueba de paquete cubren la integración inicial.

## Propiedad de las pruebas

Las pruebas se ubican según el código que deben acompañar después de la migración a workspace:

- Las pruebas de `core`, `editor`, `navigation` y los fixtures de tipos acompañan a `packages/framekit`.
- `tests/application/generation.integration.test.ts` acompaña a `apps/studio` porque verifica el layout `src/templates`, el registry generado y la plantilla piloto; su destino es `apps/studio/src/test/framekit/generation.integration.test.ts`.
- `scripts/generate-template-registry.test.ts` es una ubicación transitoria del codegen; en la fase 06 sus pruebas deben moverse junto al scanner y generador a `packages/framekit/src/codegen/`.
- No importar la plantilla piloto ni el registry de Studio desde pruebas del núcleo del paquete.
- Los fixtures de tipos deben terminar en `packages/framekit/tests/types/` y no compartirse con `examples/basic` ni con el creador de proyectos.

## Límite interno del editor

- [x] Reubicar el editor reutilizable en `src/lib/framekit/editor/` como preparación para `packages/framekit/src/editor/`.
- [x] Mantener carga de registry, rutas, estados de carga e i18n de Studio fuera del editor reutilizable.
- [x] Separar restauración y transiciones del estado del hook de React para probarlas sin DOM.
- [x] Mantener los mensajes como props del editor; el núcleo y el editor no importan el proveedor i18n de Studio.

## Casos unitarios obligatorios

- [x] `humanizeSegment('promocion-cuadrada')` produce `Promocion Cuadrada`.
- [x] El scanner encuentra `template.tsx` a cualquier profundidad y no requiere `config.ts`.
- [x] El scanner detiene el recorrido al encontrar una plantilla y permite dentro de ella archivos, componentes, helpers y assets auxiliares.
- [x] El scanner ignora directorios que empiecen con `.` o `_`.
- [x] El scanner rechaza un segmento con mayúsculas, guion bajo, espacios o acentos.
- [x] El manifiesto ordena slugs alfabéticamente y excluye categorías vacías.
- [x] El árbol de navegación comparte categorías anidadas y produce los enlaces `/editor/<slug>`.
- [x] `resolveTemplateData` aplica defaults, luego contenido del locale y después edición del usuario.
- [x] `resolveTemplateData` nunca copia `language` a `data`.
- [x] Cambiar `selectedLocale` no modifica los overrides de otro idioma.
- [x] Restablecer un locale elimina solo sus overrides.
- [x] Restablecer no muta el estado anterior y cambiar o restablecer el locale limpia los errores visibles.
- [x] La restauración de sesión descarta locale, campo o valor malformado.
- [x] Un requerido vacío falla; uno opcional vacío pasa.
- [x] Un número válido, menor que `min`, mayor que `max` y no numérico producen el resultado esperado.
- [x] Un campo de imagen conserva una ruta pública desde la raíz como `/assets/images/hero.webp`.
- [x] La validación del núcleo devuelve códigos estructurados y la interfaz los traduce al idioma activo.
- [x] Una definición runtime rechaza descriptores inválidos, límites incoherentes, dimensiones decimales y `render` ausente.

## Casos de integración de aplicación

- [x] Crear un directorio temporal con al menos dos plantillas anidadas y ejecutar el generador contra él.
- [x] Comparar el manifiesto y registry generados con el contenido esperado, incluidos imports relativos.
- [x] Cargar la plantilla piloto mediante su loader y comprobar que el default export es una definición válida.
- [x] Cargar una fixture con `defineTemplateBase` y un componente extraído conservando los tipos inferidos.
- [x] Ejecutar la generación temporal de Studio desde una copia limpia sin archivos `.framekit` previos.
- [x] Ejecutar `pnpm build` después de la generación.

## Comandos de cierre

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

- [x] Los cuatro comandos terminan correctamente desde una instalación limpia.
- [x] Las fixtures de tipos positivas y negativas se ejecutan dentro de `pnpm typecheck`.
