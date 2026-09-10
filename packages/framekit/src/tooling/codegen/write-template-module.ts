import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { findTemplateAssets } from '../discovery/find-assets'
import { findBrandComponents } from '../discovery/find-brand-components'
import { findTemplates } from '../discovery/find-templates'
import type { DiscoveredTemplate } from '../discovery/types'
import type { TemplateAssetManifest } from '../../types'
import { collectTemplateSummaries } from './collect-template-summaries'
import { createBrandModule } from './create-brand-module'
import { createTemplateModule } from './create-template-module'

const generatedFileHeader = '/* Archivo generado automáticamente. No modificar. */'

function createStudioClientModule (): string {
  const templatesImport = ['.', 'templates'].join('/')
  const brandsImport = ['.', 'brands'].join('/')

  return `${generatedFileHeader}

'use client'

import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import { templates } from '${templatesImport}'
import { brands } from '${brandsImport}'

export function StudioClient () {
  return <FrameKitStudio templates={templates} brands={brands} />
}
`
}

function createRenderClientModule (): string {
  const templatesImport = ['.', 'templates'].join('/')

  return `${generatedFileHeader}

'use client'

import { createRenderClient } from '@mauriciodmo/framekit/client'
import { templates } from '${templatesImport}'

export const RenderClient = createRenderClient(templates)
`
}

async function writeIfChanged (filePath: string, content: string): Promise<void> {
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

async function syncTemplateAssets (
  projectRoot: string,
  templates: readonly DiscoveredTemplate[]
): Promise<Record<string, TemplateAssetManifest>> {
  const discovered = await Promise.all(
    templates.map(async (template) => ({
      template,
      assets: await findTemplateAssets(template.absolutePath, template.slug)
    }))
  )
  const assetsBySlug = Object.fromEntries(
    discovered.map(({ template, assets }) => [template.slug, assets.manifest])
  )
  const outputRoot = path.join(projectRoot, 'public', 'framekit', 'templates')

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

export async function writeTemplateModule (options: {
  projectRoot: string
}): Promise<DiscoveredTemplate[]> {
  const templatesDirectory = path.join(options.projectRoot, 'src', 'templates')
  const outputDirectory = path.join(options.projectRoot, 'src', 'generated', 'framekit')
  const outputFile = path.join(outputDirectory, 'templates.ts')
  const brandOutputFile = path.join(outputDirectory, 'brands.ts')
  const studioClientOutputFile = path.join(outputDirectory, 'studio-client.tsx')
  const renderClientOutputFile = path.join(outputDirectory, 'render-client.tsx')
  const templates = await findTemplates(templatesDirectory)

  if (templates.length === 0) {
    throw new Error(`No se encontraron plantillas en: ${templatesDirectory}`)
  }

  const summariesBySlug = await collectTemplateSummaries(options.projectRoot, templates)
  const brands = await findBrandComponents(path.join(options.projectRoot, 'src', 'brand'))
  const brandSource = createBrandModule(brands, { outputDirectory })
  const assetsBySlug = await syncTemplateAssets(options.projectRoot, templates)
  const source = createTemplateModule(templates, { outputDirectory, assetsBySlug, summariesBySlug })
  const studioClientSource = createStudioClientModule()
  const renderClientSource = createRenderClientModule()

  await mkdir(outputDirectory, { recursive: true })
  await writeIfChanged(outputFile, source)
  await writeIfChanged(brandOutputFile, brandSource)
  await writeIfChanged(studioClientOutputFile, studioClientSource)
  await writeIfChanged(renderClientOutputFile, renderClientSource)

  return templates
}
