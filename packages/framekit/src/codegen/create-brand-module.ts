import path from 'node:path'

import type { DiscoveredBrandComponent } from '../discovery/types'

function importPathForPreview(component: DiscoveredBrandComponent, outputDirectory: string): string {
  const previewPath = path.join(component.absolutePath, 'preview')
  const relativePath = path.relative(outputDirectory, previewPath).split(path.sep).join('/')
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
}

export function createBrandModule(
  components: readonly DiscoveredBrandComponent[],
  options: { outputDirectory: string },
): string {
  const entries = components
    .map((component) => `  {
    slug: ${JSON.stringify(component.slug)},
    title: ${JSON.stringify(component.title)},
    segments: ${JSON.stringify(component.segments)},
    description: ${JSON.stringify(component.description)},
    load: () => import(${JSON.stringify(importPathForPreview(component, options.outputDirectory))}),
  }`)
    .join(',\n')

  return `/* Archivo generado automáticamente. No modificar. */

type BrandLoader = () => Promise<{
  default: unknown
}>

export const brands: Array<{
  slug: string
  title: string
  segments: string[]
  description: string
  load: BrandLoader
}> = [
${entries}
]

export const brandManifest = brands.map(
  ({ load: _, ...metadata }) => metadata,
)

export const brandRegistry: Record<string, BrandLoader> =
  Object.fromEntries(brands.map(({ slug, load }) => [slug, load]))
`
}
