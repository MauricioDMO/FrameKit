# Migrar de FrameKit v0.7.0 a v0.8.0

Esta guía cubre la ruta de lanzamiento entre las etiquetas `v0.7.0` y
`v0.8.0`. La etiqueta `create-framekit-v0.7.1` fue una versión intermedia de
la CLI dentro de esa ruta; no sustituye la actualización obligatoria del
runtime a `@mauriciodmo/framekit@0.8.0`.

Está dirigida a proyectos FrameKit existentes, proyectos generados por
`create-framekit`, autores de plantillas y consumidores de la API pública.

> **Registro histórico:** este archivo documenta únicamente la ruta publicada de
> 0.7.0 a 0.8.0. Sus versiones fijadas de paquetes y ejemplos de CLI son
> históricos y no constituyen la guía rolling actual. Para el contrato
> implementado sin versión, usa la [Guía de Migración Rolling](./migration-next.md).

## Lista rápida de migración

### Obligatorio

- [ ] Actualiza `@mauriciodmo/framekit` exactamente a `0.8.0`.
- [ ] Reinstala las dependencias y actualiza el lockfile.
- [ ] Ejecuta `framekit generate`, `framekit check` y `framekit build`.
- [ ] Revisa los cambios generados antes de confirmarlos.

### Opcional

- [ ] Agrega un catálogo `src/brand` y una ruta `/brand`.
- [ ] Usa la convención `src/profile.ts` de los proyectos generados.
- [ ] Actualiza las skills oficiales con `create-framekit@0.8.0`.
- [ ] Adopta el nuevo comportamiento visual de Studio y la copia al
  portapapeles.

## Migración obligatoria

### 1. Actualiza el paquete runtime

Actualiza el runtime en cada proyecto existente. Con pnpm:

```bash
pnpm add @mauriciodmo/framekit@0.8.0
pnpm install
```

Con npm:

```bash
npm install @mauriciodmo/framekit@0.8.0
npm install
```

La actualización del paquete es obligatoria para 0.8.0. Conserva el Next.js,
el layout raíz, la hoja de estilos y la ruta del editor existentes, salvo que
adoptes una de las funciones opcionales siguientes. Consulta [Integrar en un
proyecto Next.js existente](./existing-project.md) para la forma de integración
compatible.

### 2. Regenera, valida y compila

Ejecuta estos comandos desde la raíz del proyecto:

```bash
pnpm framekit generate
pnpm framekit check
pnpm framekit build
```

`generate` actualiza los registros de plantillas y de marca. `check` valida
las definiciones de plantillas y sus locales resueltos. `build` vuelve a
ejecutar `check` antes de la compilación de producción de Next.js. Los archivos
generados dentro de `src/generated/framekit/` son descartables; no los edites
a mano.

Con npm, usa los comandos equivalentes:

```bash
npm exec -- framekit generate
npm exec -- framekit check
npm exec -- framekit build
```

## Integración existente con Studio

Las integraciones existentes siguen siendo compatibles. Una ruta que ya
renderiza `<FrameKitStudio templates={templates} />` puede permanecer sin
cambios. La entrada nueva `brands` es opcional; si se omite, Studio usa un
catálogo de marcas vacío. No es necesario agregar una ruta de marca ni un
directorio `src/brand`.

Consulta la [referencia de la API pública](../reference/public-api.md) para los
puntos de entrada y tipos públicos.

## Opcional: catálogo de marcas

### Agrega el contrato de `src/brand`

Crea un árbol `src/brand` solo si el proyecto necesita un catálogo navegable de
componentes de marca reutilizables. FrameKit lo descubre recursivamente. Una
hoja de componente tiene esta forma:

```text
src/brand/<dominio>/<componente>/
├── README.md
├── component.tsx
└── preview.tsx
```

El contrato de descubrimiento es:

- Cada segmento no oculto de la ruta usa minúsculas, números y guiones:
  `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Los directorios cuyo nombre empieza por `.` o `_` se ignoran.
- Un directorio que contiene `component.tsx` es una hoja y también debe
  contener `preview.tsx` y `README.md`.
- El primer párrafo de prosa no vacío del README de la hoja se convierte en la
  descripción del catálogo. Haz que sea útil sin depender de un título o una
  lista.
- `preview.tsx` debe exportar por defecto la vista previa representativa de
  React que carga Studio. El catálogo generado no edita las props del
  componente.

Consulta [Componentes de marca](../guides/brand-components.md) y la [referencia
del catálogo de marcas](../reference/brand-catalog.md) para el contrato
completo.

### Registro generado

Después de ejecutar `framekit generate`, FrameKit escribe:

```text
src/generated/framekit/brands.ts
```

Este módulo generado y local al proyecto proporciona `brands`,
`brandManifest` y `brandRegistry`. Se sobrescribe al generar y no es una
exportación del paquete; no lo edites manualmente. Si no existe `src/brand`, la
lista de marcas generada está vacía.

### Agrega la ruta `/brand`

En un proyecto App Router que tenga el alias `@framekit/generated/*`, agrega
una ruta catch-all de cliente como `src/app/brand/[[...slug]]/page.tsx`:

```tsx
'use client'

import { brands } from '@framekit/generated/brands'
import { FrameKitStudio } from '@mauriciodmo/framekit/studio'

export default function BrandPage() {
  return <FrameKitStudio brands={brands} />
}
```

El catálogo se puede navegar en `/brand/<slug>`. La ruta existente del editor
puede seguir pasando solo `templates`. Para la creación de plantillas y los
registros generados, consulta [Creación de plantillas](../guides/template-authoring.md).

## Opcional: `src/profile.ts` en proyectos generados

Los proyectos nuevos generados por `create-framekit` incluyen un punto de
partida opcional `src/profile.ts`:

```ts
export const profile = {
  companyName: 'Tu empresa',
} as const
```

Úsalo para información pública y reutilizable de la empresa que pueda aparecer
en imágenes. La forma del objeto es intencionalmente flexible: las plantillas
y las skills pueden consumir el objeto completo o exports seleccionados. Es
una convención del proyecto, no una API del paquete FrameKit, y los proyectos
existentes no necesitan agregarlo.

## API aditiva y notas de compatibilidad

Las adiciones a la API pública de 0.8.0 incluyen:

- `FrameKitStudioBrand`, exportado desde `@mauriciodmo/framekit/studio`.
- La entrada opcional `brands` en `FrameKitStudio`.
- `copyPng` opcional en `EditorMessages` para localizar el botón de copia.

Los valores generados `brands`, `brandManifest` y `brandRegistry` siguen siendo
salida generada local al proyecto, no exportaciones del paquete. No se han
confirmado cambios incompatibles en la API pública entre las etiquetas
relevantes. Aun así, los consumidores existentes deben ejecutar los comandos
obligatorios de generación, validación y compilación para detectar problemas
específicos del proyecto.

## Cambios opcionales de UI y CLI

No se requieren cambios en la aplicación para recibir estas mejoras después de
actualizar el paquete:

- Studio puede copiar el frame actual como PNG cuando el navegador admite
  escritura de imágenes en el portapapeles.
- La expansión de carpetas de navegación se conserva en el almacenamiento del
  navegador.
- La barra lateral de Studio se puede contraer y expandir.
- `framekit dev` reintenta con el puerto siguiente cuando el puerto solicitado
  ya está ocupado e informa el puerto al que realmente se vinculó.
- La salida de generación ahora está en inglés; por ejemplo, `FrameKit: 3
  templates`, en lugar del texto anterior `plantilla(s)`.

La copia depende del soporte de portapapeles del navegador; la descarga de PNG
continúa disponible de forma independiente.

## Skills en proyectos generados

Las skills oficiales cambiaron de nombres `framekit-*` a `fk-*`. Entre los
nombres públicos están `fk-setup`, `fk-studio` y `fk-templates` (el flujo de
marcas está disponible como `fk-brand`).

Desde la raíz del proyecto, actualiza las skills oficiales con la CLI 0.8.0:

```bash
pnpm dlx @mauriciodmo/create-framekit@0.8.0 update-skills
```

El equivalente con npm es:

```bash
npx @mauriciodmo/create-framekit@0.8.0 update-skills
```

Este comando reemplaza los directorios de skills oficiales, elimina los
nombres legacy conocidos `framekit-project-setup`, `framekit-studio-usage` y
`framekit-template-creation`, y conserva los directorios de skills
personalizados. **No** actualiza archivos de la aplicación, plantillas, rutas
ni manifests de paquetes. Haz esos cambios manualmente y después vuelve a
ejecutar los comandos obligatorios de FrameKit.

---

[English](../../en/getting-started/migration-v0.8.0.md)
