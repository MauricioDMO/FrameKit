import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

import type { DiscoveredBrandComponent } from './types'

const segmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

function validateSegment(segment: string, physicalPath: string): void {
  if (!segmentPattern.test(segment)) {
    throw new Error(`Segmento inválido '${segment}' en ruta física: ${physicalPath}`)
  }
}

function humanizeSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function stripMarkdown(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim()
}

function readDescription(readme: string, readmePath: string): string {
  const paragraph: string[] = []

  for (const rawLine of readme.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line) {
      if (paragraph.length > 0) return stripMarkdown(paragraph.join(' '))
      continue
    }

    if (line.startsWith('#') || line.startsWith('```') || /^[-*]\s/.test(line) || /^\d+[.)]\s/.test(line)) {
      if (paragraph.length > 0) return stripMarkdown(paragraph.join(' '))
      continue
    }

    paragraph.push(line)
  }

  const description = stripMarkdown(paragraph.join(' '))
  if (!description) throw new Error(`README sin descripción en: ${readmePath}`)
  return description
}

export async function findBrandComponents(
  brandDirectory: string,
  segments: readonly string[] = [],
): Promise<DiscoveredBrandComponent[]> {
  if (!(await exists(brandDirectory))) return []

  const entries = await readdir(brandDirectory, { withFileTypes: true })
  const components: DiscoveredBrandComponent[] = []

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name.startsWith('_')) continue

    const nextSegments = [...segments, entry.name]
    const directoryPath = path.join(brandDirectory, entry.name)
    validateSegment(entry.name, directoryPath)

    if (await exists(path.join(directoryPath, 'component.tsx'))) {
      const previewPath = path.join(directoryPath, 'preview.tsx')
      const readmePath = path.join(directoryPath, 'README.md')
      if (!(await exists(previewPath))) throw new Error(`Falta preview.tsx en: ${directoryPath}`)
      if (!(await exists(readmePath))) throw new Error(`Falta README.md en: ${directoryPath}`)

      components.push({
        slug: nextSegments.join('/'),
        title: humanizeSegment(entry.name),
        segments: nextSegments,
        absolutePath: directoryPath,
        description: readDescription(await readFile(readmePath, 'utf8'), readmePath),
      })
      continue
    }

    components.push(...(await findBrandComponents(directoryPath, nextSegments)))
  }

  return components.sort((a, b) => a.slug.localeCompare(b.slug))
}
