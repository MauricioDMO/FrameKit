import { templateManifest } from '@/.framekit/manifest'

export interface TemplateManifestEntry {
  slug: string
  title: string
  segments: string[]
}

export interface TemplateNavigationFolder {
  type: 'folder'
  id: string
  slug: string
  title: string
  children: TemplateNavigationNode[]
}

export interface TemplateNavigationItem {
  type: 'template'
  id: string
  slug: string
  title: string
  description?: string
  href: string
}

export type TemplateNavigationNode =
  | TemplateNavigationFolder
  | TemplateNavigationItem

export function humanizeSegment(name: string): string {
  return name
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function manifestToNavigation(manifest: TemplateManifestEntry[] = templateManifest): TemplateNavigationNode[] {
  const folderMap = new Map<string, TemplateNavigationNode>()
  const root: TemplateNavigationNode[] = []

  for (const entry of manifest) {
    const { slug, title, segments } = entry

    for (let i = 1; i <= segments.length; i++) {
      const folderSlug = segments.slice(0, i).join('/')
      if (!folderMap.has(folderSlug)) {
        const isLast = i === segments.length
        const isTemplate = isLast
        const folderTitle = isTemplate
          ? title
          : humanizeSegment(segments[i - 1])

        if (i === segments.length) {
          const item: TemplateNavigationNode = {
            type: 'template',
            id: slug,
            slug,
            title: folderTitle,
            href: `/editor/${slug}`,
          }
          folderMap.set(folderSlug, item)
        } else {
          const folder: TemplateNavigationNode = {
            type: 'folder',
            id: folderSlug,
            slug: folderSlug,
            title: folderTitle,
            children: [],
          }
          folderMap.set(folderSlug, folder)
        }
      }
    }
  }

  for (const [folderSlug, node] of folderMap) {
    const segments = folderSlug.split('/')
    if (segments.length === 1) {
      root.push(node)
    } else {
      const parentSlug = segments.slice(0, -1).join('/')
      const parent = folderMap.get(parentSlug)
      if (parent && parent.type === 'folder') {
        const exists = parent.children.some((c) => c.id === node.id)
        if (!exists) {
          parent.children.push(node)
        }
      }
    }
  }

  function sortNodes(nodes: TemplateNavigationNode[]): TemplateNavigationNode[] {
    return nodes
      .sort((a, b) => {
        return a.title.localeCompare(b.title)
      })
      .map((node) => {
        if (node.type === 'folder') {
          return { ...node, children: sortNodes(node.children) }
        }
        return node
      })
  }

  return sortNodes(root)
}
