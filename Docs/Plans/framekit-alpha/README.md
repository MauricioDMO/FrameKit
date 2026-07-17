# Plan B: FrameKit alpha

Este directorio reemplaza el plan y la documentación del contrato anterior. Las fases se ejecutan estrictamente en orden: una fase no empieza hasta que la anterior tenga todos sus checkboxes marcados y sus verificaciones ejecutadas con éxito.

1. [Contrato y base de pruebas](00-contract.md) ✅
2. [Núcleo dentro de Studio](01-core.md) ✅
3. [Generación estática](02-codegen.md)
4. [Editor y validación](03-editor.md)
5. [Navegación y migración](04-migration.md)
6. [Pruebas de la aplicación](05-application-tests.md)
7. [Workspace](06-workspace.md)
8. [Paquete framekit](07-framekit-package.md)
9. [CLI](08-cli.md)
10. [Creador de proyectos](09-create-framekit.md)
11. [Distribución](10-distribution.md)
12. [Publicación alpha](11-release.md)

## Cómo marcar el plan

- Marcar un checkbox solo cuando el cambio esté integrado y verificado, no cuando el código esté iniciado.
- Si una fase descubre trabajo adicional, añadirlo al archivo de esa fase antes de continuar.
- No crear capas de compatibilidad para `config.ts`, `_folder.json` o la API antigua: el proyecto no ha sido publicado.
- No adelantar extracción a paquetes, CLI ni creador antes de que Studio funcione con el contrato nuevo.
- Ejecutar los comandos de cierre de una fase desde una instalación limpia cuando esa fase modifique dependencias o estructura del repositorio.

## Dependencias entre fases

| Fase | Requiere | Produce |
| --- | --- | --- |
| 00 | Ninguna | Contrato tipado cerrado. |
| 01 | 00 | API nueva y plantilla piloto. |
| 02 | 01 | Manifiesto y registro estáticos. |
| 03 | 01, 02 | Editor de una definición y validación. |
| 04 | 02, 03 | Studio sin contrato anterior. |
| 05 | 04 | Cobertura de la aplicación estable. |
| 06 | 05 | Workspace funcional. |
| 07 | 06 | Paquete principal consumido por Studio. |
| 08 | 07 | CLI publicable. |
| 09 | 08 | Creador de proyectos. |
| 10 | 09 | Pruebas con tarballs. |
| 11 | 10 | Alpha publicada. |

## Resultado

```bash
pnpm dlx @mauriciodmo/create-framekit mi-proyecto
cd mi-proyecto
pnpm dev
```

Una carpeta con `template.tsx` será una plantilla; una carpeta sin ese archivo será una categoría. No habrá `config.ts`, `_folder.json`, registros manuales ni `framekit.config.ts`.
