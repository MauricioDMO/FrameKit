import path from 'node:path'

import type { DiscoveredTemplate } from '../discovery/types'
import type { TemplateAssetManifest } from '../types'

const emptyAssets: TemplateAssetManifest = { common: {}, variants: {} }

function importPathForTemplate(
  template: DiscoveredTemplate,
  outputDirectory: string,
): string {
  const templatePath = path.join(template.absolutePath, 'template')
  const relativePath = path.relative(outputDirectory, templatePath).split(path.sep).join('/')
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
}

export function createTemplateModule(
  templates: readonly DiscoveredTemplate[],
  options: {
    outputDirectory: string
    assetsBySlug?: Readonly<Record<string, TemplateAssetManifest>>
  },
): string {
  const entries = templates
    .map(
      (template) => `  {
    slug: ${JSON.stringify(template.slug)},
    title: ${JSON.stringify(template.title)},
    segments: ${JSON.stringify(template.segments)},
    assets: ${JSON.stringify(options.assetsBySlug?.[template.slug] ?? emptyAssets)},
    load: () => import(${JSON.stringify(importPathForTemplate(template, options.outputDirectory))}),
  }`,
    )
    .join(',\n')

  return `/* Archivo generado automáticamente. No modificar. */

import type { TemplateAssetManifest, TemplateDefinition } from '@mauriciodmo/framekit'

type TemplateLoader = () => Promise<{
  default: TemplateDefinition
}>

export const templates: Array<{
  slug: string
  title: string
  segments: string[]
  assets: TemplateAssetManifest
  load: TemplateLoader
}> = [
${entries}
]

export const templateManifest = templates.map(
  ({ load: _, assets: __, ...metadata }) => metadata,
)

export const templateRegistry: Record<string, TemplateLoader> =
  Object.fromEntries(templates.map(({ slug, load }) => [slug, load]))
`
}
