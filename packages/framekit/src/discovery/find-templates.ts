import { access, readdir } from 'node:fs/promises'
import path from 'node:path'

import type { DiscoveredTemplate } from './types'

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

export async function findTemplates(
  templatesDirectory: string,
  segments: readonly string[] = [],
): Promise<DiscoveredTemplate[]> {
  const entries = await readdir(templatesDirectory, { withFileTypes: true })
  const templates: DiscoveredTemplate[] = []

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name.startsWith('_')) {
      continue
    }

    const nextSegments = [...segments, entry.name]
    const directoryPath = path.join(templatesDirectory, entry.name)
    validateSegment(entry.name, directoryPath)

    if (await exists(path.join(directoryPath, 'template.tsx'))) {
      templates.push({
        slug: nextSegments.join('/'),
        title: humanizeSegment(entry.name),
        segments: nextSegments,
        absolutePath: directoryPath,
      })
      continue
    }

    templates.push(...(await findTemplates(directoryPath, nextSegments)))
  }

  return templates.sort((a, b) => a.slug.localeCompare(b.slug))
}
