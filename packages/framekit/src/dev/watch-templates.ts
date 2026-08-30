import path from 'node:path'

import chokidar, { type FSWatcher } from 'chokidar'

export interface TemplateWatcher {
  close(): Promise<void>
}

export function watchTemplates(options: {
  projectRoot: string
  onStructureChange: () => void
  onError: (error: Error) => void
}): TemplateWatcher {
  const sourceDirectory = path.join(options.projectRoot, 'src')
  const templatesDirectory = path.join(sourceDirectory, 'templates')
  const brandDirectory = path.join(sourceDirectory, 'brand')
  const watcher: FSWatcher = chokidar.watch(sourceDirectory, { ignoreInitial: true })
  const isWithin = (root: string, filePath: string) => {
    const relativePath = path.relative(root, filePath)
    return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
  }
  const isBrandPath = (filePath: string) => isWithin(brandDirectory, filePath)
  const isTemplatePath = (filePath: string) => isWithin(templatesDirectory, filePath)

  function shouldRegenerate(filePath: string): boolean {
    if (isBrandPath(filePath)) return true
    return isTemplatePath(filePath)
  }

  watcher.on('add', (filePath) => { if (shouldRegenerate(filePath)) void options.onStructureChange() })
  watcher.on('unlink', (filePath) => { if (shouldRegenerate(filePath)) void options.onStructureChange() })
  watcher.on('change', (filePath) => { if (shouldRegenerate(filePath)) void options.onStructureChange() })
  watcher.on('addDir', (filePath) => { if (isTemplatePath(filePath) || isBrandPath(filePath)) void options.onStructureChange() })
  watcher.on('unlinkDir', (filePath) => { if (isTemplatePath(filePath) || isBrandPath(filePath)) void options.onStructureChange() })
  watcher.on('error', (error) => {
    options.onError(error instanceof Error ? error : new Error(String(error)))
  })

  return {
    close: () => watcher.close(),
  }
}
