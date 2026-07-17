import 'server-only'

import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import type { FolderConfig, TemplateNavigationNode } from '@/lib/templates/types'
import { templateConfigRegistry } from '@/generated/template-config-registry'
import type { Locale } from '@/i18n/locales'

const TEMPLATES_ROOT = path.join(process.cwd(), 'src', 'templates')

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf8')

  try {
    return JSON.parse(content) as T
  } catch {
    throw new Error(`El archivo JSON no es válido: ${filePath}`)
  }
}

async function readOptionalJson<T>(filePath: string): Promise<T | null> {
  return (await fileExists(filePath)) ? readJsonFile<T>(filePath) : null
}

function humanizeFolderName(name: string): string {
  return name
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function sortNodes(
  first: TemplateNavigationNode,
  second: TemplateNavigationNode,
  locale: Locale,
): number {
  const titleCompare = first.title.localeCompare(second.title, locale)
  if (titleCompare !== 0) return titleCompare
  return first.slug.localeCompare(second.slug)
}

async function scanDirectory(
  absoluteDirectory: string,
  parentSegments: string[],
  locale: Locale,
): Promise<TemplateNavigationNode[]> {
  const entries = await readdir(absoluteDirectory, { withFileTypes: true })
  const directories = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      !entry.name.startsWith('.') &&
      !entry.name.startsWith('_'),
  )

  const nodes: TemplateNavigationNode[] = []

  for (const directory of directories) {
    const segments = [...parentSegments, directory.name]
    const slug = segments.join('/')
    const absolutePath = path.join(absoluteDirectory, directory.name)
    const config = templateConfigRegistry[slug]

    if (config) {
      nodes.push({
        type: 'template',
        id: slug,
        slug,
        title: humanizeFolderName(slug.split('/').pop()!),
        order: 1000,
        href: `/${locale}/editor/${slug}`,
      })
      continue
    }

    const children = await scanDirectory(absolutePath, segments, locale)

    if (children.length === 0) continue

    const folderConfig = await readOptionalJson<FolderConfig>(
      path.join(absolutePath, '_folder.json'),
    )

    nodes.push({
      type: 'folder',
      id: slug,
      slug,
      title:
        folderConfig?.translations[locale].title ??
        humanizeFolderName(directory.name),
      order: folderConfig?.order ?? 1000,
      children: children.sort((first, second) => sortNodes(first, second, locale)),
    })
  }

  return nodes.sort((first, second) => sortNodes(first, second, locale))
}

export async function readTemplateCatalog(locale: Locale): Promise<
  TemplateNavigationNode[]
> {
  return scanDirectory(TEMPLATES_ROOT, [], locale)
}
