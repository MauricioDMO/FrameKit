---
title: Escritura y estructura
description: Añade páginas de documentación de FrameKit centradas en un tema a partir de las fuentes actuales y mantén alineadas sus rutas y entradas de la barra lateral.
---

# Escritura y estructura

Esta página está dirigida a quienes añaden o revisan documentación publicada. Su
responsabilidad principal es mantener la estructura de las páginas, la evidencia
de las fuentes, los enlaces y la navegación de forma mantenible.

## Comienza por la audiencia

Decide a quién sirve la página antes de elegir su formato:

- `users/` explica cómo construir y operar una aplicación de FrameKit;
- `contributors/` explica cómo cambiar y verificar el repositorio de FrameKit.

Asigna a la página una única responsabilidad principal. Una página de referencia,
de flujo de trabajo o de conceptos, con un enfoque claro, es más fácil de verificar y
enlazar que un segundo índice que repite varios procedimientos. Enlaza con la
página propietaria cuando la información ya tenga una página.

## Usa primero las fuentes actuales

Verifica las afirmaciones publicadas contra el repositorio actual en este orden:

1. los manifiestos de los paquetes y sus exportaciones o binarios públicos;
2. la implementación y las pruebas del workspace responsable;
3. la plantilla canónica del consumidor generado; y
4. la integración actual de primera parte cuando demuestre el comportamiento.

Las páginas heredadas de `Docs/en/` y `Docs/es/` pueden revelar temas de migración,
pero no tienen autoridad sobre el código actual. `Docs/Plans/` registra la
coordinación del trabajo, no el comportamiento del producto. No copies comandos
históricos ni describas superficies no compatibles solo porque una página antigua
las mencione.

## Añade una página

Crea la página Markdown mantenida dentro del directorio de la audiencia, por
ejemplo:

```text
apps/docs/src/content/docs/en/contributors/<area>/<slug>.md
```

Usa el frontmatter de Starlight con un título y una descripción concisos, y
mantén un encabezado de página coincidente y secciones centradas:

```md
---
title: Título de una página centrada
description: Indica la audiencia y la responsabilidad principal de la página.
---

# Título de una página centrada
```

Usa las rutas del repositorio, los nombres de paquetes, los comandos, las rutas y
las importaciones exactamente como aparecen en las fuentes actuales. Enlaza entre
páginas publicadas en español con rutas `/es/` relativas a la raíz, por ejemplo:

```md
Consulta el [flujo de trabajo para contribuidores](/es/contributors/development/workflow)
antes de ejecutar las comprobaciones del repositorio.
```

No enlaces a la salida generada como si fuera código fuente mantenido. En
particular, cambia el Markdown bajo `apps/docs/src/content/docs/`, no bajo
`apps/docs/dist/` ni `apps/docs/.astro/`.

## Añade la ruta a la barra lateral

Un archivo Markdown tiene una ruta, pero no necesariamente es visible en la barra
lateral de Starlight. Cuando una página esté lista para navegarse, actualiza el
`sidebar` que se pasa a Starlight en `apps/docs/astro.config.mjs`. Usa un slug
explícito para una sola página o una entrada de directorio `autogenerate` para un
grupo:

```js
{
  label: 'Documentation',
  items: [{ autogenerate: { directory: 'contributors/documentation' } }]
}
```

Mantén la etiqueta y la agrupación de la barra lateral alineadas con la audiencia
de la página. No edites la navegación generada ni la salida de compilación. Un
cambio de navegación es un cambio en la configuración fuente y debe comprobarse
con la compilación de documentación.

## Mantén las skills desde su fuente

Las skills son independientes de la documentación publicada. Edita una skill solo
en `Docs/skills/` y después sincroniza las copias mantenidas:

```bash
pnpm sync:skills
```

La sincronización copia las skills internas a `.agents/skills/` y las skills
públicas a `packages/create-framekit/template/.agents/skills/`. Nunca edites
directamente ninguna de las copias sincronizadas; cambia la fuente y ejecuta la
sincronización en su lugar.

## Conserva la paridad de rutas

El inglés se estabiliza antes de la localización. Por cada ruta en inglés añadida
bajo `en/`, la fase 9 debe añadir una página equivalente en español bajo `es/`
con el mismo slug, responsabilidad y ejemplos técnicos. Durante la fase 8, añade
solo la página en inglés: no crees páginas en español ni afirmes que los locales ya
tienen paridad de rutas o contenido.

Cuando una página esté localizada, los enlaces en inglés deben conservar `/en/` y
los enlaces en español deben usar `/es/`; nunca uses una ruta desnuda como
`/users` ni un enlace relativo que pueda cruzar locales. Compara ambos árboles de
rutas después de la localización y ejecuta la compilación de documentación antes
de considerar completa la pareja.

## Verifica la página

Ejecuta la compilación de documentación desde la raíz del repositorio:

```bash
pnpm --filter docs build
```

Después, comprueba la ruta renderizada, su ubicación en la barra lateral, cada
enlace interno y las afirmaciones de las fuentes frente a los manifiestos actuales,
la implementación, las pruebas y la plantilla canónica. La compilación demuestra
que el sitio puede compilarse; no demuestra que una afirmación histórica siga
siendo compatible.
