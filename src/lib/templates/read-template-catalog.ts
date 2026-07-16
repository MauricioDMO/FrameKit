import 'server-only'

import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import {
  localizeTemplateConfig,
  type FolderConfig,
  type TemplateNavigationNode,
} from '@/lib/templates/types'
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
  return first.order !== second.order
    ? first.order - second.order
    : first.title.localeCompare(second.title, locale)
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

  const nodes = await Promise.all(
    directories.map(async (directory) => {
      const segments = [...parentSegments, directory.name]
      const slug = segments.join('/')
      const absolutePath = path.join(absoluteDirectory, directory.name)
      const config = templateConfigRegistry[slug]

      if (config) {
        const translation = localizeTemplateConfig(config, locale)

        return {
          type: 'template',
          id: slug,
          slug,
          title: translation.title,
          description: translation.description,
          order: config.order ?? 1000,
          href: `/${locale}/editor/${slug}`,
        } satisfies TemplateNavigationNode
      }

      const children = await scanDirectory(absolutePath, segments, locale)

      if (children.length === 0) return null

      const folderConfig = await readOptionalJson<FolderConfig>(
        path.join(absolutePath, '_folder.json'),
      )

      return {
        type: 'folder',
        id: slug,
        slug,
        title:
          folderConfig?.translations[locale].title ??
          humanizeFolderName(directory.name),
        order: folderConfig?.order ?? 1000,
        children: children.sort((first, second) => sortNodes(first, second, locale)),
      } satisfies TemplateNavigationNode
    }),
  )

  return nodes
    .filter((node): node is TemplateNavigationNode => node !== null)
    .sort((first, second) => sortNodes(first, second, locale))
}

export async function readTemplateCatalog(locale: Locale): Promise<
  TemplateNavigationNode[]
> {
  return scanDirectory(TEMPLATES_ROOT, [], locale)
}
