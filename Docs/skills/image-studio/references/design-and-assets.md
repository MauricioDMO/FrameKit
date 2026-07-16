# Diseño y recursos

[Volver al skill](../SKILL.md)

## Contrato del componente

```tsx
import type { TemplateProps } from '@/lib/templates/types'

export default function Template({ data, width, height }: TemplateProps) {
  return (
    <article style={{ width, height }}>
      {data.title}
    </article>
  )
}
```

La raíz debe respetar exactamente `width` y `height`. El editor se encarga de escalar la vista previa.

## Dirección visual

Antes de escribir JSX, decide:

- Objetivo de la pieza.
- Audiencia.
- Jerarquía principal.
- Paleta y contraste.
- Densidad de información.
- Ubicación de marca y llamada a la acción.

Evita layouts intercambiables. Una cotización necesita legibilidad documental; una historia promocional necesita impacto vertical; un banner web necesita lectura inmediata a distancia.

## Dimensiones frecuentes

| Formato | Dimensiones |
| --- | --- |
| Publicación cuadrada | `1080 × 1080` |
| Historia o reel | `1080 × 1920` |
| Publicación vertical | `1080 × 1350` |
| Banner 16:9 | `1600 × 900` |
| Documento A4 aproximado | `1240 × 1754` |

Usa las dimensiones pedidas por el usuario cuando existan.

## Datos dinámicos

Usa clases estáticas para estructura y estilos inline para valores configurables:

```tsx
<h1 style={{ color: data.accentColor }}>{data.title}</h1>
```

No construyas clases como `bg-[${data.color}]`; Tailwind no puede descubrirlas al compilar.

## Imágenes

Para exportación DOM, usa una etiqueta `img` normal:

```tsx
// eslint-disable-next-line @next/next/no-img-element
<img
  src={data.backgroundImage}
  alt=""
  className="absolute inset-0 h-full w-full object-cover"
/>
```

Guarda recursos locales en `public/` y referencia `/images/...` o `/logos/...`. Las imágenes decorativas usan `alt=""`.

Evita depender de recursos remotos. Si son imprescindibles, su servidor debe permitir CORS para que `modern-screenshot` pueda incluirlos en el PNG.

## Tipografía y exportación

La exportación espera `document.fonts.ready`, pero una fuente inaccesible aún puede producir una sustitución. Prefiere fuentes locales o pilas del sistema y prueba el PNG, no solo la vista previa.

## Restricciones

- No uses estado, efectos ni APIs del navegador dentro de una plantilla salvo necesidad real.
- No incluyas botones del editor dentro del lienzo.
- Evita contenido que dependa de una petición asíncrona durante la captura.
- Mantén texto y elementos importantes dentro de márgenes seguros.

Consulta [Flujo y verificación](workflow-and-verification.md) antes de terminar.
