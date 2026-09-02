import { access } from 'node:fs/promises'

const segmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

export function validateSegment(segment: string, physicalPath: string): void {
  if (!segmentPattern.test(segment)) {
    throw new Error(`Segmento inválido '${segment}' en ruta física: ${physicalPath}`)
  }
}
