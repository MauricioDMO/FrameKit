# Flujo y verificación

[Volver al skill](../SKILL.md)

## Secuencia recomendada

1. Revisa [Estructura del proyecto](project-layout.md).
2. Elige categoría, slug y dimensiones.
3. Crea categorías faltantes y sus `_folder.json` solo si aportan metadatos.
4. Crea `config.ts` siguiendo [Configuración tipada](template-config.md).
5. Crea `template.tsx` siguiendo [Diseño y recursos](design-and-assets.md).
6. Añade recursos bajo `public/`.
7. Genera los registros.
8. Ejecuta comprobaciones estáticas.
9. Prueba interacción y exportación.

## Comprobaciones automáticas

Ejecuta desde la raíz:

```bash
pnpm templates:generate
pnpm lint
pnpm build
```

El generador debe informar el nuevo número de plantillas. Lint y build deben terminar sin errores.

## Comprobación en navegador

Con `pnpm dev` activo:

1. Abre `/es/editor/<slug>` y `/en/editor/<slug>`.
2. Confirma que la plantilla aparece en la categoría correcta con títulos y etiquetas localizados.
3. Modifica al menos un campo de texto y un campo visual si existe.
4. Cambia el primer control del formulario, **Idioma del diseño**, y confirma valores iniciales, título, etiquetas, texto fijo del PNG y nombre de descarga para cada clave de `languages`.
5. Cambia **Idioma de la interfaz** y confirma que traduce controles sin perder el lienzo editado durante la sesión.
6. Descarga el PNG y verifica nombre, dimensiones, imágenes y tipografía del archivo.
7. Revisa una vista móvil del editor cuando se modificó infraestructura compartida.

## Diagnóstico rápido

| Síntoma | Acción |
| --- | --- |
| La plantilla no aparece | Ejecuta `pnpm templates:generate` y revisa que existan `config.ts` y `template.tsx`. |
| La ruta devuelve 404 | Revisa que todos los segmentos cumplan `/^[a-z0-9-]+$/`. |
| El componente no carga | Comprueba la exportación por defecto y regenera el registro. |
| El fondo falta en el PNG | Usa un recurso local o corrige CORS. |
| El tamaño es incorrecto | Revisa `width` y `height` en `config.ts`. |
| TypeScript rechaza el config | Corrige la clave o campo indicado dentro de `defineTemplateConfig`. |

## Informe final

Resume la ruta creada, dimensiones, campos, recursos y comandos ejecutados. No afirmes que la exportación funciona si solo se verificó el build.
