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
  const templatesDirectory = path.join(options.projectRoot, 'src', 'templates')
  const watcher: FSWatcher = chokidar.watch(templatesDirectory, { ignoreInitial: true })
  const isAssetPath = (filePath: string) => path.relative(templatesDirectory, filePath).split(path.sep).includes('assets')

  watcher.on('add', (filePath) => {
    if (path.basename(filePath) === 'template.tsx' || isAssetPath(filePath)) {
      void options.onStructureChange()
    }
  })
  watcher.on('unlink', (filePath) => {
    if (path.basename(filePath) === 'template.tsx' || isAssetPath(filePath)) {
      void options.onStructureChange()
    }
  })
  watcher.on('change', (filePath) => {
    if (isAssetPath(filePath)) void options.onStructureChange()
  })
  watcher.on('addDir', options.onStructureChange)
  watcher.on('unlinkDir', options.onStructureChange)
  watcher.on('error', (error) => {
    options.onError(error instanceof Error ? error : new Error(String(error)))
  })

  return {
    close: () => watcher.close(),
  }
}
