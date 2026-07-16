---
name: image-studio
description: Crea y modifica plantillas visuales completas para Image Studio, incluyendo categorías, config.ts tipado, componentes React/Tailwind, recursos locales, rutas del editor y verificación de exportación. Usa este skill siempre que el usuario pida crear una imagen, publicación social, historia, banner, anuncio, documento, cotización o cualquier formato visual dentro de este proyecto, aunque no mencione explícitamente la palabra plantilla.
compatibility: Requiere acceso al proyecto Image Studio, Node.js y pnpm.
---

# Image Studio

Crea plantillas que el editor pueda descubrir, editar y exportar sin modificar su infraestructura compartida.

## Antes de editar

1. Localiza la raíz que contiene `package.json` y `src/templates`.
2. Revisa una plantilla existente para conservar convenciones del proyecto.
3. Obtén del pedido el formato, dimensiones, contenido editable y recursos visuales.
4. Pregunta solo por información que impida producir una primera versión útil. Si el formato tiene dimensiones estándar conocidas, úsalas y declara la elección.

## Referencias

Lee únicamente las referencias necesarias:

- [Estructura del proyecto](references/project-layout.md): rutas, categorías y archivos generados.
- [Configuración tipada](references/template-config.md): campos de `config.ts` y controles disponibles.
- [Diseño y recursos](references/design-and-assets.md): calidad visual, dimensiones, imágenes y exportación.
- [Flujo y verificación](references/workflow-and-verification.md): secuencia completa y comprobaciones finales.

Para una plantilla nueva, lee las cuatro. Para ajustar solamente el aspecto visual, basta con Diseño y recursos más la plantilla existente.

## Flujo obligatorio

1. Elige una ruta semántica bajo `src/templates` con segmentos en minúsculas y guiones.
2. Crea `_folder.json` únicamente cuando una categoría nueva necesite título u orden explícitos.
3. Crea `config.ts` y usa `satisfies TemplateConfig`.
4. Define en `fields` solo valores que el usuario deba editar.
5. Incluye un valor string en `defaults` para cada `field.key`.
6. Crea `template.tsx` con una exportación por defecto que acepte `TemplateProps`.
7. Mantén formularios, navegación y descarga fuera de la plantilla.
8. Guarda recursos propios bajo `public/` y referencia sus rutas desde `/`.
9. Ejecuta `pnpm templates:generate`, `pnpm lint` y `pnpm build`.
10. Si es posible, abre la ruta generada, cambia un campo y comprueba la descarga PNG.

## Reglas de implementación

- Reutiliza componentes y patrones existentes antes de introducir utilidades nuevas.
- No edites archivos dentro de `src/generated`; el script los reemplaza.
- No añadas una API, estado global, dependencia o esquema runtime para una plantilla local.
- Usa estilos inline para colores, imágenes u otros valores que provengan de `data`.
- Evita diseños genéricos: el formato debe tener jerarquía, composición y una dirección visual coherente con su propósito.
- Conserva accesibilidad básica en el editor y usa `alt=""` para imágenes puramente decorativas.
- Evita imágenes remotas cuando exista una alternativa local; CORS puede romper la exportación.

## Resultado esperado

Entrega una plantilla funcional y comunica:

- Ruta del editor.
- Dimensiones finales.
- Campos editables.
- Recursos creados o reutilizados.
- Resultado de generación, lint, build y prueba de exportación.

Si una comprobación no pudo ejecutarse, indícalo de forma explícita.
