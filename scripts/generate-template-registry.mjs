import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_ROOT = process.cwd()
const TEMPLATES_ROOT = path.join(PROJECT_ROOT, 'src', 'templates')
const FRAMEKIT_DIR = path.join(PROJECT_ROOT, 'src', '.framekit')

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

function validateSegment(segment, physicalPath) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment)) {
    throw new Error(`Segmento inválido '${segment}' en ruta física: ${physicalPath}`)
  }
}

export async function findTemplates(absoluteDirectory, segments = []) {
  const entries = await readdir(absoluteDirectory, { withFileTypes: true })
  const templates = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) {
      continue
    }

    if (!entry.isDirectory()) {
      continue
    }

    const nextSegments = [...segments, entry.name]
    const directoryPath = path.join(absoluteDirectory, entry.name)

    for (const seg of nextSegments) {
      validateSegment(seg, directoryPath)
    }

    const templatePath = path.join(directoryPath, 'template.tsx')

    if (await exists(templatePath)) {
      templates.push({
        slug: nextSegments.join('/'),
        segments: nextSegments,
      })
      continue
    }

    templates.push(...(await findTemplates(directoryPath, nextSegments)))
  }

  return templates
}

export async function generateRegistry({
  templatesRoot = TEMPLATES_ROOT,
  framekitDir = FRAMEKIT_DIR,
} = {}) {
  const templates = await findTemplates(templatesRoot)
  templates.sort((a, b) => a.slug.localeCompare(b.slug))

  const manifestEntries = templates
    .map(({ slug, segments }) => {
      const lastSegment = slug.split('/').pop()
      const title = lastSegment
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      return `  {
    slug: ${JSON.stringify(slug)},
    title: ${JSON.stringify(title)},
    segments: ${JSON.stringify(segments)},
  }`
    })
    .join(',\n')

  const manifestOutput = `/* Archivo generado automáticamente. No modificar. */

export const templateManifest: Array<{
  slug: string
  title: string
  segments: string[]
}> = [
${manifestEntries}
]
`

  const registryEntries = templates
    .map(({ slug, segments }) => {
      const templatePath = path.join(templatesRoot, ...segments, 'template')
      const relativePath = path.relative(framekitDir, templatePath).split(path.sep).join('/')
      const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`
      return `  ${JSON.stringify(slug)}: () => import(${JSON.stringify(importPath)}),`
    })
    .join('\n')

  const registryOutput = `/* Archivo generado automáticamente. No modificar. */
'use client'

import type { TemplateDefinition } from '@/lib/framekit'

export const templateRegistry: Record<string, () => Promise<{ default: TemplateDefinition }>> = {
${registryEntries}
}
`

  await mkdir(framekitDir, { recursive: true })
  await Promise.all([
    writeIfChanged(path.join(framekitDir, 'manifest.ts'), manifestOutput),
    writeIfChanged(path.join(framekitDir, 'registry.ts'), registryOutput),
  ])

  console.log(`Registro generado: ${templates.length} plantilla(s)`)
  return templates
}

async function writeIfChanged(filePath, content) {
  const current = (await exists(filePath)) ? await readFile(filePath, 'utf8') : ''
  if (current !== content) await writeFile(filePath, content, 'utf8')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateRegistry().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
