<div align="center">
  <img src="https://framekit.mauriciodmo.com/favicon.svg" alt="Logo de FrameKit" width="72" />
  <h1>FrameKit</h1>
  <p><strong>Crea imágenes de marca como componentes de React.</strong></p>
  <p>Convierte tu sistema visual en código reutilizable, edita el contenido en Studio y renderiza cada variante bajo demanda.</p>
  <p>
    <a href="https://framekit.mauriciodmo.com/es/users/getting-started/create-project">Crear un proyecto</a>
    ·
    <a href="https://framekit.mauriciodmo.com/es/">Leer la documentación</a>
    ·
    <a href="https://github.com/MauricioDMO/FrameKit">Ver en GitHub</a>
  </p>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/@mauriciodmo/framekit"><img src="https://img.shields.io/npm/v/%40mauriciodmo%2Fframekit?logo=npm&label=framekit" alt="framekit en npm" /></a>
  <a href="https://www.npmjs.com/package/@mauriciodmo/create-framekit"><img src="https://img.shields.io/npm/v/%40mauriciodmo%2Fcreate-framekit?logo=npm&label=create-framekit" alt="create-framekit en npm" /></a>
  <a href="https://github.com/MauricioDMO/FrameKit/blob/main/LICENSE"><img src="https://img.shields.io/github/license/MauricioDMO/FrameKit" alt="Licencia Apache 2.0" /></a>
  <img src="https://img.shields.io/badge/status-beta-f2c94c" alt="Estado beta" />
</p>

FrameKit está pensado para desarrolladores que necesitan crear muchas
imágenes que sigan pareciendo parte de la misma marca. En lugar de pedirle a
un modelo de difusión que reinterprete tu estilo en cada prompt, define el
lenguaje visual una vez con componentes React y cambia solo el contenido que
debe variar.

## Por qué FrameKit

- **Componentes, no prompts.** Mantén en código el layout, la tipografía, los colores, los assets y las dimensiones de exportación.
- **Edición enfocada.** Expón campos y variantes editables en FrameKit Studio mientras el código conserva las restricciones de marca.
- **Listo para automatizaciones.** Exporta PNG desde Studio o renderízalos mediante la API para campañas, catálogos, previews y otros flujos.

## Crea un proyecto

```bash
pnpm dlx @mauriciodmo/create-framekit mi-proyecto
cd mi-proyecto
pnpm dev
```

Abre `http://localhost:3000`, inicia sesión y empieza a editar la plantilla
incluida. La [guía para crear un proyecto](https://framekit.mauriciodmo.com/es/users/getting-started/create-project)
explica el primer inicio de sesión y las opciones disponibles de la CLI.

## Una plantilla es solo React

Define una vez el contrato editable. FrameKit descubre el archivo, valida sus
datos y renderiza el mismo componente en Studio y mediante la API de imágenes.

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Tarjeta de lanzamiento' },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({ label: 'Título', required: true }),
  },
  content: {
    default: { title: 'Diseña una vez. Publica siempre.' },
  },
  variants: { default: 'default' },
  render({ data, width, height }) {
    return (
      <article className="flex items-center justify-center bg-[#10271f] p-16 text-center text-6xl text-white" style={{ width, height }}>
        {data.title}
      </article>
    )
  },
})
```

Consulta [Crea tu primera plantilla](https://framekit.mauriciodmo.com/es/users/getting-started/first-template)
para ver el flujo completo.

## Studio

Explora plantillas, edita campos, cambia variantes, revisa la composición final
y exporta un PNG sin rehacer el diseño manualmente.

![FrameKit Studio](Docs/img/studio.webp)

## Explora el flujo

- [Usa Studio](https://framekit.mauriciodmo.com/es/users/guides/use-studio) para editar y exportar plantillas.
- [Crea plantillas](https://framekit.mauriciodmo.com/es/users/guides/create-template) con campos, variantes y assets.
- [Renderiza imágenes con la API](https://framekit.mauriciodmo.com/es/users/guides/render-images-with-the-api) para automatizar flujos.
- [Despliega un proyecto](https://framekit.mauriciodmo.com/es/users/deployment) con la configuración de runtime y persistencia necesaria.
- [Lee la guía para contribuidores](https://framekit.mauriciodmo.com/es/contributors) si quieres trabajar en FrameKit.

## Compatibilidad

FrameKit requiere Node.js `>=22.13.0`, React `>=19 <20` y Next.js `>=16 <17`.
Consulta la [referencia completa de compatibilidad y la CLI](https://framekit.mauriciodmo.com/es/users/reference/cli/)
para conocer los comandos y versiones compatibles.

## Paquetes

- [`@mauriciodmo/framekit`](packages/framekit/README.md): contrato de plantillas, componentes de Studio, CLI y APIs de renderizado.
- [`@mauriciodmo/create-framekit`](packages/create-framekit/README.md): scaffolding de proyectos con una plantilla Next.js lista para ejecutar.

## Más información

- [Documentación en inglés](https://framekit.mauriciodmo.com/en/)
- [Documentación en español](https://framekit.mauriciodmo.com/es/)
- [Licencia](LICENSE)

Para desarrollar el repositorio, consulta la [guía de desarrollo local](https://framekit.mauriciodmo.com/es/contributors/getting-started/local-development).
