# FrameKit

**Crea contenido visual consistente a partir de plantillas React, sin repetir ediciones manuales.**

FrameKit es un editor de imágenes basado en plantillas para React y Next.js. Define la pieza una vez en código, expón solo el contenido que debe cambiar y usa Studio para previsualizar, validar y exportar el resultado con sus dimensiones declaradas.

[English](README.md)

**Estado: beta**

## Qué problema resuelve

Las publicaciones sociales, tarjetas de campaña y otros gráficos recurrentes suelen convertirse en una cadena de diseños duplicados, archivos copiados y correcciones manuales. FrameKit ofrece una única fuente de verdad tipada para el diseño y una superficie de edición enfocada en las variantes de contenido.

El flujo es repetible: el equipo de desarrollo define la plantilla y sus restricciones; quienes editan contenido cambian textos, colores, URLs e idiomas en Studio; el navegador exporta el PNG final sin rehacer el diseño.

## Studio

Studio es el espacio visual para explorar plantillas, editar sus campos, cambiar variantes de contenido y revisar la composición antes de exportarla.

![FrameKit Studio](Docs/img/studio.webp)

## Instalación y ejecución

Crea un proyecto con la CLI:

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
cd my-project
pnpm dev
```

El creador copia un proyecto Next.js funcional, pregunta si debe instalar las dependencias, genera el registro de plantillas y puede inicializar Git. El servidor de desarrollo abre FrameKit Studio con `pnpm dev`.

## Ejemplo de una plantilla renderizada

Una plantilla define sus dimensiones, campos editables, variantes de contenido y renderizador React. Este ejemplo renderiza una tarjeta social con contenido localizado y texto Markdown:

```tsx
import { defineTemplate, fields, Markdown } from '@mauriciodmo/framekit'

export default defineTemplate({
  width: 1200,
  height: 630,
  fields: {
    title: fields.textarea({ label: 'Título', required: true }),
    accent: fields.color({ label: 'Acento', defaultValue: '#b9f8d2' }),
  },
  content: {
    en: { language: 'English', title: 'Build once. **Publish often.**' },
    es: { language: 'Español', title: 'Diseña una vez. **Publica siempre.**' },
  },
  render({ data, width, height }) {
    return (
      <article style={{ width, height, background: '#10271f', color: data.accent }}>
        <Markdown value={data.title} />
      </article>
    )
  },
})
```

Studio renderiza este nodo React en la vista previa y exporta un PNG nombrado según el slug de la plantilla, usando las dimensiones declaradas de `1200×630`.

## Funciones actuales

- Plantillas tipadas con `defineTemplate` o definiciones reutilizables mediante `defineTemplateBase`.
- Campos editables `text`, `textarea`, `number`, `color` y `url`, con valores predeterminados y validación.
- Variantes de contenido arbitrarias como `en`, `es` o variantes propias del producto.
- Renderizado Markdown para formato de texto en línea y listas básicas.
- Descubrimiento de plantillas en `src/templates/**/template.tsx` y registros generados.
- Navegación en Studio, cambio de idioma, tema claro/oscuro, persistencia local en el navegador, zoom y desplazamiento de la vista previa.
- Comandos CLI para `generate`, `check`, `dev`, `build` y `start`.
- Exportación de PNG en el navegador con el ancho y alto declarados por la plantilla.

## Limitaciones conocidas

- Es software beta: las APIs y los detalles del proyecto generado pueden cambiar entre versiones.
- La exportación actual solo admite PNG. No hay renderizado del lado del servidor, exportación a GIF/video, otros formatos, control de escala ni DPI.
- Studio guarda los cambios en el `localStorage` del navegador; no hay cuentas, sincronización con servidor ni colaboración.
- Las plantillas deben vivir en `src/templates` y usar un archivo de entrada `template.tsx`. La CLI todavía no ofrece otra carpeta de plantillas ni archivo de configuración.
- La interfaz de Studio está disponible en inglés y español. El contenido de cada plantilla puede definir sus propias claves de idioma.
- El paquete solo publica módulos ESM; no ofrece exports CommonJS.

## Compatibilidad

| Dependencia | Versiones compatibles |
| ----------- | --------------------- |
| Node.js     | `>=22.13.0`           |
| React       | `>=19 <20`            |
| React DOM   | `>=19 <20`            |
| Next.js     | `>=16 <17`            |
| pnpm        | `>=11.14.0`           |

## Enlaces

- [Documentación en inglés](Docs/en/README.md)
- [Documentación](Docs/es/README.md)
- [README del paquete @mauriciodmo/framekit](packages/framekit/README.md)
- [Licencia](LICENSE)

Para desarrollo del repositorio: `pnpm install --frozen-lockfile && pnpm dev`
