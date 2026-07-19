import path from 'node:path'

import chokidar, { type FSWatcher } from 'chokidar'

export interface TemplateWatcher {
  close(): Promise<void>
}

export function watchTemplates(options: {
  projectRoot: string
  onStructureChange: () => void | Promise<void>
}): TemplateWatcher {
  const templatesDirectory = path.join(options.projectRoot, 'src', 'templates')
  const watcher: FSWatcher = chokidar.watch(templatesDirectory, { ignoreInitial: true })

  watcher.on('add', (filePath) => {
    if (path.basename(filePath) === 'template.tsx') {
      void options.onStructureChange()
    }
  })
  watcher.on('unlink', (filePath) => {
    if (path.basename(filePath) === 'template.tsx') {
      void options.onStructureChange()
    }
  })
  watcher.on('addDir', () => void options.onStructureChange())
  watcher.on('unlinkDir', () => void options.onStructureChange())

  return {
    close: () => watcher.close(),
  }
}
