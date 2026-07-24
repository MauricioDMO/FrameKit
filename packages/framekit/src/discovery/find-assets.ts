import { readdir } from 'node:fs/promises'
import path from 'node:path'

import type { TemplateAssetManifest } from '../types'

const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'])
const assetNamePattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const variantNamePattern = /^[A-Za-z0-9][A-Za-z0-9_-]*$/

export interface DiscoveredAsset {
  sourcePath: string
  relativePath: string
  publicPath: string
}

export interface DiscoveredTemplateAssets {
  manifest: TemplateAssetManifest
  files: DiscoveredAsset[]
}

function emptyAssets(): DiscoveredTemplateAssets {
  return { manifest: { common: {}, variants: {} }, files: [] }
}

function publicPathFor(slug: string, relativePath: string): string {
  const encodedSlug = slug.split('/').map(encodeURIComponent).join('/')
  const encodedPath = relativePath.split(path.sep).map(encodeURIComponent).join('/')
  return `/__framekit/templates/${encodedSlug}/${encodedPath}`
}

async function readAssetDirectory(
  directory: string,
  relativeDirectory: string,
  slug: string,
): Promise<{ values: Record<string, string>; files: DiscoveredAsset[] }> {
  const values: Record<string, string> = {}
  const files: DiscoveredAsset[] = []
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.name.startsWith('.')) continue
    if (!entry.isFile()) {
      throw new Error(`Los assets no pueden tener subcarpetas: ${path.join(directory, entry.name)}`)
    }
    if (!assetNamePattern.test(entry.name)) {
      throw new Error(`Nombre de asset inválido '${entry.name}' en: ${path.join(directory, entry.name)}`)
    }

    const extension = path.extname(entry.name).toLowerCase()
    if (!imageExtensions.has(extension)) continue

    const key = entry.name.slice(0, -extension.length)
    if (!key || values[key]) {
      throw new Error(`Assets duplicados para '${key}' en: ${directory}`)
    }

    const relativePath = path.join(relativeDirectory, entry.name)
    values[key] = publicPathFor(slug, relativePath)
    files.push({
      sourcePath: path.join(directory, entry.name),
      relativePath,
      publicPath: values[key],
    })
  }

  return { values, files }
}

export async function findTemplateAssets(
  templateDirectory: string,
  slug: string,
): Promise<DiscoveredTemplateAssets> {
  const assetsDirectory = path.join(templateDirectory, 'assets')
  let entries

  try {
    entries = await readdir(assetsDirectory, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyAssets()
    throw error
  }

  const result = emptyAssets()

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.name.startsWith('.')) continue
    if (!entry.isDirectory()) {
      throw new Error(`Los assets deben estar dentro de common o una variante: ${path.join(assetsDirectory, entry.name)}`)
    }
    if (entry.name !== 'common' && !variantNamePattern.test(entry.name)) {
      throw new Error(`Nombre de variante inválido '${entry.name}' en: ${path.join(assetsDirectory, entry.name)}`)
    }

    const directory = path.join(assetsDirectory, entry.name)
    const discovered = await readAssetDirectory(directory, entry.name, slug)

    if (entry.name === 'common') {
      result.manifest.common = discovered.values
    } else {
      result.manifest.variants[entry.name] = discovered.values
    }
    result.files.push(...discovered.files)
  }

  return result
}
