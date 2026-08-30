import path from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  watch: vi.fn(),
}))

vi.mock('chokidar', () => ({
  default: { watch: mocks.watch },
}))

import { watchTemplates } from './watch-templates'

type EventHandler = (filePath: string) => void

function createTestWatcher() {
  const handlers = new Map<string, EventHandler>()
  const watcher = {
    on(event: string, handler: EventHandler) {
      handlers.set(event, handler)
      return watcher
    },
    close: vi.fn(async () => undefined),
  }
  mocks.watch.mockReturnValue(watcher)

  const onStructureChange = vi.fn()
  const onError = vi.fn()
  const result = watchTemplates({
    projectRoot: '/tmp/framekit',
    onStructureChange,
    onError,
  })

  return { handlers, watcher, result, onStructureChange, onError }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('watchTemplates', () => {
  it.each(['add', 'change', 'unlink'])('regenerates for any template file on %s', (event) => {
    const { handlers, onStructureChange } = createTestWatcher()

    handlers.get(event)?.(path.join('/tmp/framekit', 'src', 'templates', 'example', 'README.md'))

    expect(onStructureChange).toHaveBeenCalledOnce()
  })

  it.each(['addDir', 'unlinkDir'])('regenerates for template directories on %s', (event) => {
    const { handlers, onStructureChange } = createTestWatcher()

    handlers.get(event)?.(path.join('/tmp/framekit', 'src', 'templates', 'new-template'))

    expect(onStructureChange).toHaveBeenCalledOnce()
  })

  it.each(['add', 'change', 'unlink', 'addDir', 'unlinkDir'])('keeps brand watching on %s', (event) => {
    const { handlers, onStructureChange } = createTestWatcher()

    handlers.get(event)?.(path.join('/tmp/framekit', 'src', 'brand', 'communication', 'hero', 'README.md'))

    expect(onStructureChange).toHaveBeenCalledOnce()
  })

  it('ignores paths outside the watched template and brand roots', () => {
    const { handlers, onStructureChange } = createTestWatcher()

    handlers.get('change')?.(path.join('/tmp/framekit', 'src', 'components', 'README.md'))

    expect(onStructureChange).not.toHaveBeenCalled()
  })

  it('passes the source directory and ignoreInitial option to chokidar', () => {
    createTestWatcher()

    expect(mocks.watch).toHaveBeenCalledWith(path.join('/tmp/framekit', 'src'), { ignoreInitial: true })
  })

  it('closes the underlying watcher', async () => {
    const { result, watcher } = createTestWatcher()

    await result.close()

    expect(watcher.close).toHaveBeenCalledOnce()
  })
})
