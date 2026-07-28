# Componentes de marca

Los componentes de marca son bloques visuales reutilizables que expresan el lenguaje y la comunicación de un proyecto. Viven en `src/brand/`; una plantilla los compone con sus propios datos, dimensiones y layout. Esta guía describe el árbol actual y el contrato que usa Studio.

## Árbol actual

El árbol existente es pequeño y está organizado por propósito semántico, no por canal de distribución:

```text
src/brand/
├── README.md
└── communication/
    ├── README.md
    └── hero/
        ├── README.md
        ├── component.tsx
        └── preview.tsx
```

`communication/` contiene bloques independientes del canal para presentar un mensaje de marca. `communication/hero/` contiene actualmente un único componente: `BrandHero`.

## Convenciones y requisitos reales

No todo lo recomendado para authoring es una validación del runtime. La diferencia importa:

### Lo que exige el descubrimiento

FrameKit recorre recursivamente el directorio de marca. Para que un directorio se registre como componente:

- Debe contener `component.tsx`. Al encontrarlo, ese directorio es una hoja y no se exploran sus subdirectorios.
- También debe contener `preview.tsx` y `README.md`; si falta cualquiera de los dos, el descubrimiento falla.
- Cada segmento de la ruta que no se haya ignorado debe usar solo minúsculas, números y guiones simples: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Los directorios cuyo nombre empieza por `.` o `_` se ignoran.
- El slug es la ruta desde `src/brand/`, unida con `/`. El título visible se obtiene humanizando solo el nombre del directorio hoja: `hero` se convierte en `Hero`.
- Para obtener `description`, el descubridor recorre el README en orden: omite las líneas que empiezan por `#`, por tres backticks, `- `, `* ` o una lista ordenada (`n. ` o `n) `). Una línea vacía o una de esas líneas termina el párrafo que ya se hubiera iniciado; se usa el primer párrafo resultante. Los bloques cercados no se interpretan como bloques: solo se omiten sus delimitadores. Después se eliminan los enlaces Markdown (conservando su texto) y los caracteres `` ` ``, `*`, `_` y `~`. Si no queda descripción, el descubrimiento falla.

El resultado se ordena por slug. Si `src/brand/` no existe, el descubrimiento devuelve una lista vacía.

El descubridor no comprueba la implementación de `component.tsx`, sus props, ni el contenido de `preview.tsx`. Tampoco exige un README en los directorios padre: esos README son una convención de clasificación y documentación.

### Convenciones de authoring

La estructura recomendada es añadir un README en cada nivel de clasificación y, en cada hoja, mantener estos tres archivos:

- `component.tsx`: el componente reutilizable con props semánticas.
- `preview.tsx`: una muestra representativa que reutiliza el componente.
- `README.md`: propósito, inputs, restricciones, cuándo usarlo y cuándo elegir otro hermano.

Estas convenciones hacen comprensible el catálogo y ayudan a decidir qué pertenece a la marca. No crean por sí solas una API de props ni validaciones adicionales.

## Contrato entre README, componente y preview

El README de la hoja proporciona la descripción que Studio muestra en el catálogo. El archivo `component.tsx` contiene la pieza reutilizable; el preview debe exportar por defecto un componente que la renderice:

```tsx
// preview.tsx
import { BrandHero } from './component'

export default function Preview() {
  return (
    <div className="w-[720px] bg-[#10271f] p-14 text-[#f5f7ee]">
      <BrandHero
        eyebrow="NUEVO / FRAMEKIT"
        title="Diseña imágenes desde **React**"
        description="Contenido visual consistente y reutilizable."
      />
    </div>
  )
}
```

El generador registra los metadatos del componente y crea un loader dinámico para `preview.tsx`, no para `component.tsx`. Por eso el preview es la entrada que el catálogo puede cargar. El descubrimiento solo verifica que los archivos existan; la forma ejecutable del export por defecto es necesaria para que la vista pueda renderizarse.

## `BrandHero` en detalle

La implementación actual exporta `BrandHero` y `BrandHeroProps` desde `component.tsx`:

| Prop | Tipo | Valor predeterminado | Uso |
| --- | --- | --- | --- |
| `eyebrow` | `string` | — | Etiqueta breve; se muestra con Markdown y estilo de etiqueta en mayúsculas. |
| `title` | `string` | — | Titular principal; se pasa a `Markdown` con `lists`. |
| `description` | `string` | — | Texto de apoyo; se pasa a `Markdown` con `lists`. |
| `accentColor` | `string` opcional | `#c8f7d9` | Color del `eyebrow` y de la regla horizontal. |

Las tres props de texto son obligatorias. El componente renderiza una `<section>` con ancho máximo de `720px`, el eyebrow, el titular y una descripción junto a una regla de acento. `title` y `description` habilitan listas mediante la prop `lists` de `Markdown`; el README del componente documenta Markdown para el título y listas Markdown para la descripción.

Ejemplo de consumo desde una plantilla:

```tsx
<BrandHero
  eyebrow={data.eyebrow}
  title={data.title}
  description={data.description}
  accentColor={accentColor}
/>
```

`accentColor` no se resuelve desde un token global: es una prop de texto que recibe cada consumidor. Si no se proporciona, `BrandHero` usa `#c8f7d9`.

## Qué pertenece a la marca y qué pertenece a la plantilla

Extrae a `src/brand/` una decisión visual o un patrón de comunicación que tenga un caso claro de reutilización. Mantén en `src/templates/<plantilla>/` lo que dependa de una composición, formato o mensaje concretos.

Las dos plantillas actuales importan `BrandHero` desde `@/brand/communication/hero/component` y lo rodean con composiciones diferentes:

- `framekit/que-es-framekit/template.tsx` define una salida de `1440 × 1440`, el fondo verde, las formas decorativas, el encabezado, las tarjetas de ejemplo, el pie y los campos `eyebrow`, `title`, `description`, `website` y `accentColor`.
- `redes-sociales/instagram/promocion-cuadrada/template.tsx` también define `1440 × 1440`, pero añade `backgroundImage`, overlay, una cabecera de Silver Wolf, una composición específica de esa plantilla y una CTA localizada (`Hablemos`/`Let's talk`).

En ambas, la plantilla resuelve `data`, decide el fallback del color (`#c8f7d9` en la primera y `#b9f8d2` en la segunda) y pasa los valores a `BrandHero`. El componente compartido no conoce locales, campos, Instagram, dimensiones de exportación, fondos, logos, etiquetas de plataforma ni CTA. La documentación de authoring de plantillas explica la resolución de datos y locales en [Creación de plantillas](./template-authoring.md).

## Catálogo de Studio y límites actuales

El manifiesto generado conserva `slug`, `title`, `segments`, `description` y un loader para el preview. Studio recibe ese registro como `brands`, construye la navegación bajo `/brand` y carga el preview seleccionado. La vista de catálogo muestra el título, la descripción y el preview dentro de `FrameKitBrandCatalog`.

Este catálogo es de consulta y composición visual: no existe un contrato para editar props de un componente de marca desde Studio, ni una validación de props equivalente a la validación de definiciones de plantilla.

En el árbol actual de `src/brand` tampoco hay un componente de logo, un sistema de layout, una paleta o un registro de tokens de branding, ni un componente de CTA. No los importes como si fueran APIs existentes: los valores de color, tipografía, fondos y acciones que aparecen en los ejemplos son decisiones locales del componente o de cada plantilla.

## Para añadir un componente

1. Elige una ruta semántica en `src/brand/` y usa nombres de directorio válidos.
2. Añade el README de cada nivel nuevo y el README de la hoja con un primer párrafo descriptivo.
3. Implementa `component.tsx` con props semánticas y crea `preview.tsx` como exportación por defecto que lo reutilice.
4. Deja en la plantilla consumidora el layout, las dimensiones, los campos, los locales, los assets y las restricciones del canal.
5. Comprueba el preview en Studio bajo `/brand/<slug>` y revisa la guía de [Studio](./studio.md) para el comportamiento general de navegación y previews.

---

[English](../../en/guides/brand-components.md)
