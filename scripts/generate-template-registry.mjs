import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
const TEMPLATES_ROOT = path.join(PROJECT_ROOT, 'src', 'templates')
const OUTPUT_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'generated',
  'template-registry.ts',
)
const CONFIG_OUTPUT_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'generated',
  'template-config-registry.ts',
)

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function findTemplates(absoluteDirectory, segments = []) {
  const entries = await readdir(absoluteDirectory, { withFileTypes: true })
  const templates = []

  for (const entry of entries) {
    if (
      !entry.isDirectory() ||
      entry.name.startsWith('.') ||
      entry.name.startsWith('_')
    ) {
      continue
    }

    const nextSegments = [...segments, entry.name]
    const directoryPath = path.join(absoluteDirectory, entry.name)
    const configPath = path.join(directoryPath, 'config.ts')

    if (await exists(configPath)) {
      const templatePath = path.join(directoryPath, 'template.tsx')

      if (!(await exists(templatePath))) {
        throw new Error(`Falta template.tsx en: ${directoryPath}`)
      }

      templates.push({
        slug: nextSegments.join('/'),
        baseImportPath: `@/templates/${nextSegments.join('/')}`,
      })
      continue
    }

    templates.push(...(await findTemplates(directoryPath, nextSegments)))
  }

  return templates
}

async function generateRegistry() {
  const templates = await findTemplates(TEMPLATES_ROOT)
  templates.sort((a, b) => a.slug.localeCompare(b.slug))

  const registryEntries = templates
    .map(
      ({ slug, baseImportPath }) => `  ${JSON.stringify(slug)}: dynamic<TemplateProps>(
    () => import(${JSON.stringify(`${baseImportPath}/template`)}).then((module) => module.default),
  ),`,
    )
    .join('\n\n')

  const output = `/* Archivo generado automáticamente. No modificar. */
'use client'

import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'

import type { TemplateProps } from '@/lib/templates/types'

export const templateRegistry: Record<
  string,
  ComponentType<TemplateProps>
> = {
${registryEntries}
}
`

  const configImports = templates
    .map(
      ({ baseImportPath }, index) =>
        `import config${index} from ${JSON.stringify(`${baseImportPath}/config`)}`,
    )
    .join('\n')

  const configEntries = templates
    .map(({ slug }, index) => `  ${JSON.stringify(slug)}: config${index},`)
    .join('\n')

  const configOutput = `/* Archivo generado automáticamente. No modificar. */
import 'server-only'

import type { TemplateConfig } from '@/lib/templates/types'
${configImports ? `\n${configImports}` : ''}

export const templateConfigRegistry: Record<string, TemplateConfig> = {
${configEntries}
}
`

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await Promise.all([
    writeIfChanged(OUTPUT_PATH, output),
    writeIfChanged(CONFIG_OUTPUT_PATH, configOutput),
  ])

  console.log(`Registro generado: ${templates.length} plantilla(s)`)
}

async function writeIfChanged(filePath, content) {
  const current = (await exists(filePath))
    ? await readFile(filePath, 'utf8')
    : ''

  if (current !== content) await writeFile(filePath, content, 'utf8')
}

generateRegistry().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
