import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { findTemplates } from '../discovery/find-templates'
import type { DiscoveredTemplate } from '../discovery/types'
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

export async function writeTemplateModule(options: {
  projectRoot: string
}): Promise<DiscoveredTemplate[]> {
  const templatesDirectory = path.join(options.projectRoot, 'src', 'templates')
  const outputDirectory = path.join(options.projectRoot, '.framekit', 'generated')
  const outputFile = path.join(outputDirectory, 'templates.ts')
  const templates = await findTemplates(templatesDirectory)

  if (templates.length === 0) {
    throw new Error(`No se encontraron plantillas en: ${templatesDirectory}`)
  }

  const source = createTemplateModule(templates, { outputDirectory })

  await mkdir(outputDirectory, { recursive: true })
  await writeIfChanged(outputFile, source)

  return templates
}
