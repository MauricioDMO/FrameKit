# 05. Pruebas de la aplicación

## Infraestructura

- [ ] Añadir Vitest como único runner de pruebas TypeScript y exponerlo mediante un script raíz `test`.
- [ ] Ejecutar scanner, manifest, resolver y validadores en entorno Node; reservar `jsdom` solo para las pruebas de estado del editor que necesiten `sessionStorage`.
- [ ] Crear un `tsconfig` de fixtures de tipos que ejecute `tsc --noEmit` y acepte casos negativos con `@ts-expect-error`.
- [ ] No añadir pruebas visuales ni navegador end-to-end durante alpha; el build de Next y la prueba de paquete cubren la integración inicial.

## Casos unitarios obligatorios

- [ ] `humanizeSegment('promocion-cuadrada')` produce `Promocion Cuadrada`.
- [ ] El scanner encuentra `template.tsx` a cualquier profundidad y no requiere `config.ts`.
- [ ] El scanner ignora directorios que empiecen con `.` o `_`.
- [ ] El scanner rechaza un segmento con mayúsculas, guion bajo, espacios o acentos.
- [ ] El manifiesto ordena slugs alfabéticamente y excluye categorías vacías.
- [ ] El árbol de navegación comparte categorías anidadas y produce los enlaces `/editor/<slug>`.
- [ ] `resolveTemplateData` aplica defaults, luego contenido del locale y después edición del usuario.
- [ ] `resolveTemplateData` nunca copia `language` a `data`.
- [ ] Cambiar `selectedLocale` no modifica los overrides de otro idioma.
- [ ] Restablecer un locale elimina solo sus overrides.
- [ ] La restauración de sesión descarta locale, campo o valor malformado.
- [ ] Un requerido vacío falla; uno opcional vacío pasa.
- [ ] Un número válido, menor que `min`, mayor que `max` y no numérico producen el resultado esperado.
- [ ] Una URL absoluta HTTP(S) y una ruta que inicia con `/` pasan; una URL con protocolo no permitido falla.

## Casos de integración de aplicación

- [ ] Crear un directorio temporal con al menos dos plantillas anidadas y ejecutar el generador contra él.
- [ ] Comparar el manifiesto y registry generados con el contenido esperado, incluidos imports relativos.
- [ ] Cargar la plantilla piloto mediante su loader y comprobar que el default export es una definición válida.
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
