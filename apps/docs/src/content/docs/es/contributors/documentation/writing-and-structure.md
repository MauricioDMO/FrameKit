---
title: Escritura y estructura
description: Mantén la documentación de FrameKit centrada, orientada a tareas y coherente entre inglés y español.
---

# Escritura y estructura

Esta página está dirigida a quienes añaden o revisan documentación publicada. Mantén cada página centrada en una sola responsabilidad y prefiere el recurso más simple de Starlight que haga el contenido más fácil de recorrer.

## Empieza por la audiencia y el tipo de página

- `users/` explica cómo construir y operar una aplicación de FrameKit.
- `contributors/` explica cómo cambiar y verificar el repositorio de FrameKit.

Elige un tipo principal de página:

- **Tutorial o guía:** lleva al lector hasta un resultado con solo los detalles necesarios para completar la tarea.
- **Concepto:** explica cómo funciona una parte de FrameKit y por qué existe.
- **Referencia:** conserva los contratos completos de comandos, configuración, API y archivos.
- **Solución de problemas:** diagnostica un síntoma y apunta al flujo o referencia responsable.

No conviertas las páginas índice en copias de la barra lateral. Úsalas para mostrar un conjunto pequeño de puntos de entrada de alto valor.

## Prefiere los componentes incluidos en Starlight

Markdown simple sigue siendo la opción predeterminada. Usa MDX cuando un componente incluido haga un flujo claramente más fácil de leer:

- `Steps` para procedimientos con un orden significativo.
- `Tabs` para alternativas equivalentes como pnpm y npm. Usa el mismo `syncKey="package-manager"` para conservar la elección del lector.
- `FileTree` para estructuras de repositorio y proyecto en lugar de árboles ASCII.
- `LinkCard` y `CardGrid` para páginas de entrada cortas y orientadas a tareas.
- Los asides de Starlight (`:::note`, `:::tip`, `:::caution`) para información que debe separarse del flujo principal.
- Metadatos `title="src/file.ts"` de Expressive Code cuando un bloque representa un archivo real.

No añadas un componente personalizado cuando un componente incluido de Starlight ya represente la misma estructura.

## Mantén las guías cortas

Una guía debe contener la ruta compatible más corta hasta el resultado. Mueve flags exhaustivos, contratos de variables de entorno, detalles de archivos generados y comportamiento completo de comandos a **Referencia**, y enlaza la página responsable.

Así se evita mantener el mismo contrato técnico en varios lugares y se conservan legibles las páginas de primeros pasos.

## Usa primero las fuentes actuales

Verifica las afirmaciones publicadas contra el repositorio actual en este orden:

1. manifiestos de paquetes y exportaciones o binarios públicos;
2. implementación y pruebas del workspace responsable;
3. plantilla canónica del consumidor generado; y
4. integración actual de primera parte cuando demuestre el comportamiento.

Las páginas heredadas de `Docs/en/` y `Docs/es/` pueden revelar temas de migración, pero no tienen autoridad sobre el código actual. `Docs/Plans/` registra coordinación del trabajo, no comportamiento del producto.

## Añade o revisa una página

Usa `.md` para Markdown simple y `.mdx` cuando importes componentes de Starlight:

```text
apps/docs/src/content/docs/es/<audiencia>/<area>/<slug>.md
apps/docs/src/content/docs/es/<audiencia>/<area>/<slug>.mdx
```

Usa frontmatter conciso y evita repetir el título de la página como un encabezado `#` manual salvo que el layout lo necesite de forma específica.

Conserva las rutas del repositorio, nombres de paquetes, comandos, rutas e importaciones exactamente como aparecen en las fuentes actuales. Los enlaces ingleses usan `/en/`; los españoles usan `/es/`.

No edites salida generada como `apps/docs/dist/` o `apps/docs/.astro/`.

## Barra lateral y localización

Un archivo de contenido tiene una ruta, pero puede no ser visible en la barra lateral. Actualiza `apps/docs/astro.config.mjs` cuando cambie la navegación. Prefiere grupos de directorios autogenerados cuando la jerarquía de contenido ya expresa la estructura y colapsa por defecto los grupos de referencia que no necesitan permanecer abiertos.

Las rutas publicadas en inglés y español deben conservar la paridad. Cuando cambie un locale, actualiza su página equivalente en el mismo cambio salvo que exista un plan explícito de localización que indique lo contrario.

## Mantén las skills desde su fuente

Edita las skills únicamente bajo `Docs/skills/` y luego sincronízalas:

```bash
pnpm sync:skills
```

Nunca edites directamente `.agents/skills/` ni `packages/create-framekit/template/.agents/skills/`.

## Verifica los cambios de documentación

Ejecuta:

```bash
pnpm --filter docs build
```

Después comprueba las rutas renderizadas, la ubicación en la barra lateral, los enlaces internos, las pestañas sincronizadas de gestor de paquetes y las afirmaciones técnicas contra el código fuente actual. Una compilación exitosa demuestra que el sitio compila; no demuestra que una afirmación obsoleta sea correcta.
