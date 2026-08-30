import path from 'node:path'

import type { DiscoveredTemplate } from '../discovery/types'
import type { TemplateAssetManifest } from '../types'
import type { TemplateSummary } from './collect-template-summaries'

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
    assetsBySlug: Readonly<Record<string, TemplateAssetManifest>>
    summariesBySlug: Readonly<Record<string, TemplateSummary>>
  },
): string {
  const entries = templates
    .map((template) => {
      const summary = options.summariesBySlug[template.slug]
      if (!summary) throw new Error(`Falta el resumen de la plantilla: ${template.absolutePath}`)

      return `  {
    slug: ${JSON.stringify(template.slug)},
    segments: ${JSON.stringify(template.segments)},
    meta: ${JSON.stringify(summary.meta)},
    width: ${JSON.stringify(summary.width)},
    height: ${JSON.stringify(summary.height)},
    variants: ${JSON.stringify(summary.variants)},
    variantKeys: ${JSON.stringify(summary.variantKeys)},
    assets: ${JSON.stringify(options.assetsBySlug[template.slug] ?? emptyAssets)},
    load: () => import(${JSON.stringify(importPathForTemplate(template, options.outputDirectory))}),
  }`
    })
    .join(',\n')

  return `/* Archivo generado automáticamente. No modificar. */

import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

export const templates: TemplateRegistryEntry[] = [
${entries}
]
`
}
