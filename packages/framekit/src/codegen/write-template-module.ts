import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { findTemplateAssets } from '../discovery/find-assets'
import { findTemplates } from '../discovery/find-templates'
import type { DiscoveredTemplate } from '../discovery/types'
import type { TemplateAssetManifest } from '../types'
import { createTemplateModule } from './create-template-module'

async function writeIfChanged(filePath: string, content: string): Promise<void> {
  let current = ''

  try {
    current = await readFile(filePath, 'utf8')
  } catch {
    // The output is created below when this is the first generation.
  }

  if (current !== content) {
    await writeFile(filePath, content, 'utf8')
  }
}

async function syncTemplateAssets(
  projectRoot: string,
  templates: readonly DiscoveredTemplate[],
): Promise<Record<string, TemplateAssetManifest>> {
  const discovered = await Promise.all(
    templates.map(async (template) => ({
      template,
      assets: await findTemplateAssets(template.absolutePath, template.slug),
    })),
  )
  const assetsBySlug = Object.fromEntries(
    discovered.map(({ template, assets }) => [template.slug, assets.manifest]),
  )
  const outputRoot = path.join(projectRoot, 'public', '__framekit', 'templates')

  await rm(outputRoot, { recursive: true, force: true })

  for (const { template, assets } of discovered) {
    for (const file of assets.files) {
      const destination = path.join(outputRoot, ...template.segments, file.relativePath)
      await mkdir(path.dirname(destination), { recursive: true })
      await cp(file.sourcePath, destination)
    }
  }

  return assetsBySlug
}

export async function writeTemplateModule(options: {
  projectRoot: string
}): Promise<DiscoveredTemplate[]> {
  const templatesDirectory = path.join(options.projectRoot, 'src', 'templates')
  const outputDirectory = path.join(options.projectRoot, 'src', 'generated', 'framekit')
  const outputFile = path.join(outputDirectory, 'templates.ts')
  const templates = await findTemplates(templatesDirectory)

  if (templates.length === 0) {
    throw new Error(`No se encontraron plantillas en: ${templatesDirectory}`)
  }

  const assetsBySlug = await syncTemplateAssets(options.projectRoot, templates)
  const source = createTemplateModule(templates, { outputDirectory, assetsBySlug })

  await mkdir(outputDirectory, { recursive: true })
  await writeIfChanged(outputFile, source)

  return templates
}
