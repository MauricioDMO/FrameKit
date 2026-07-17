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
    const templatePath = path.join(directoryPath, 'template.tsx')

    if (await exists(templatePath)) {
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
      ({ slug, baseImportPath }) => `  ${JSON.stringify(slug)}: dynamic(
    () => import(${JSON.stringify(`${baseImportPath}/template`)}).then((module) => {
      const def = module.default
      return function TemplateComponent(props: TemplateRenderProps) {
        return def.render(props)
      }
    }),
  ) as (props: TemplateRenderProps) => ReactElement,`,
    )
    .join('\n\n')

  const output = `/* Archivo generado automáticamente. No modificar. */
'use client'

import dynamic from 'next/dynamic'
import type { ReactElement } from 'react'

import type { TemplateRenderProps } from '@/lib/framekit'

export const templateRegistry: Record<string, (props: TemplateRenderProps) => ReactElement> = {
${registryEntries}
}
`

  const configImports = templates
    .map(
      ({ baseImportPath }, index) =>
        `import def${index} from ${JSON.stringify(`${baseImportPath}/template`)}`,
    )
    .join('\n')

  const configEntries = templates
    .map(({ slug }, index) => `  ${JSON.stringify(slug)}: def${index},`)
    .join('\n')

  const configOutput = `/* Archivo generado automáticamente. No modificar. */
import 'server-only'

import type { TemplateDefinition } from '@/lib/framekit'
${configImports ? `\n${configImports}` : ''}

export const templateConfigRegistry: Record<string, TemplateDefinition> = {
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
