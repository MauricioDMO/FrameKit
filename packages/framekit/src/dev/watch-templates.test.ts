// @vitest-environment node

import { mkdir, mkdtemp, rm, unlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import chokidar, { type FSWatcher } from 'chokidar'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { watchTemplates, type TemplateWatcher } from './watch-templates'

const originalWatch = chokidar.watch
const activeWatchers: TemplateWatcher[] = []
const activeRoots: string[] = []
const chokidarWatchers: FSWatcher[] = []
const WATCH_TIMEOUT_MS = 5_000

let lastWatchArguments: Parameters<typeof chokidar.watch> | undefined
let watcherReadiness = new WeakMap<FSWatcher, Promise<void>>()

type ChokidarEvent = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir'

function waitForReady(watcher: FSWatcher): Promise<void> {
  if (watcher._readyEmitted) return Promise.resolve()

  return new Promise<void>((resolve, reject) => {
    let settled = false
    const timeout = setTimeout(() => finish(new Error('Timed out waiting for Chokidar to become ready')), WATCH_TIMEOUT_MS)

    function cleanup() {
      clearTimeout(timeout)
      watcher.off('ready', onReady)
      watcher.off('error', onError)
    }

    function finish(error?: Error) {
      if (settled) return
      settled = true
      cleanup()
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    }

    function onReady() {
      finish()
    }

    function onError(error: unknown) {
      finish(error instanceof Error ? error : new Error(String(error)))
    }

    watcher.once('ready', onReady)
    watcher.once('error', onError)
  })
}

async function createProject(): Promise<string> {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-watch-'))
  activeRoots.push(projectRoot)
  await mkdir(path.join(projectRoot, 'src', 'templates', 'example'), { recursive: true })
  await mkdir(path.join(projectRoot, 'src', 'brand'), { recursive: true })
  return projectRoot
}

async function startWatcher(projectRoot: string) {
  const onStructureChange = vi.fn()
  const onError = vi.fn()
  const result = watchTemplates({ projectRoot, onStructureChange, onError })
  activeWatchers.push(result)
  const watcher = chokidarWatchers.at(-1)
  const ready = watcher ? watcherReadiness.get(watcher) : undefined

  try {
    if (!ready || !watcher) throw new Error('Expected a Chokidar watcher and ready promise')
    await ready
    expect(onStructureChange).not.toHaveBeenCalled()

    return { chokidarWatcher: watcher, onError, onStructureChange, result }
  } catch (error) {
    await result.close().catch(() => undefined)
    const index = activeWatchers.indexOf(result)
    if (index !== -1) activeWatchers.splice(index, 1)
    throw error
  }
}

async function waitForStructureChange(
  watcher: FSWatcher,
  onStructureChange: ReturnType<typeof vi.fn>,
  expectedEvent: ChokidarEvent,
  expectedPath: string,
  mutation: () => Promise<void>,
): Promise<void> {
  const callsBefore = onStructureChange.mock.calls.length
  await waitForChokidarEvent(watcher, expectedEvent, expectedPath, mutation)
  expect(onStructureChange.mock.calls.length).toBeGreaterThan(callsBefore)
}

async function waitForChokidarEvent(
  watcher: FSWatcher,
  expectedEvent: ChokidarEvent,
  expectedPath: string,
  mutation: () => Promise<void>,
): Promise<void> {
  const normalizedExpectedPath = path.resolve(expectedPath)

  await new Promise<void>((resolve, reject) => {
    let settled = false
    const timeout = setTimeout(() => finish(new Error(`Timed out waiting for Chokidar to observe ${expectedEvent} at ${normalizedExpectedPath}`)), WATCH_TIMEOUT_MS)

    function cleanup() {
      clearTimeout(timeout)
      watcher.off('all', onAll)
    }

    function finish(error?: Error) {
      if (settled) return
      settled = true
      cleanup()
      if (error) {
        reject(error)
      } else {
        setImmediate(resolve)
      }
    }

    function onAll(event: string, filePath: string) {
      if (event !== expectedEvent || path.resolve(filePath) !== normalizedExpectedPath) return
      finish()
    }

    watcher.on('all', onAll)
    void mutation().catch((error: unknown) => finish(error instanceof Error ? error : new Error(String(error))))
  })
}

beforeEach(() => {
  chokidarWatchers.length = 0
  lastWatchArguments = undefined
  watcherReadiness = new WeakMap()

  vi.spyOn(chokidar, 'watch').mockImplementation((...args) => {
    lastWatchArguments = args
    const watcher = originalWatch(...args)
    chokidarWatchers.push(watcher)
    watcherReadiness.set(watcher, waitForReady(watcher))
    return watcher
  })
})

afterEach(async () => {
  const watchers = activeWatchers.splice(0)
  const roots = activeRoots.splice(0)
  await Promise.allSettled(watchers.map((watcher) => watcher.close()))
  await Promise.allSettled(roots.map((projectRoot) => rm(projectRoot, { recursive: true, force: true })))
  vi.restoreAllMocks()
})

describe('watchTemplates', () => {
  it('regenerates when template.tsx changes', async () => {
    const projectRoot = await createProject()
    const templateFile = path.join(projectRoot, 'src', 'templates', 'example', 'template.tsx')
    await writeFile(templateFile, 'export default 1')

    const { chokidarWatcher, onError, onStructureChange } = await startWatcher(projectRoot)

    await waitForStructureChange(chokidarWatcher, onStructureChange, 'change', templateFile, () => writeFile(templateFile, 'export default 2'))

    expect(onError).not.toHaveBeenCalled()
  })

  it('regenerates when a private template helper changes', async () => {
    const projectRoot = await createProject()
    const helperFile = path.join(projectRoot, 'src', 'templates', 'example', 'helpers.ts')
    await writeFile(helperFile, 'export const value = 1')

    const { chokidarWatcher, onStructureChange } = await startWatcher(projectRoot)

    await waitForStructureChange(chokidarWatcher, onStructureChange, 'change', helperFile, () => writeFile(helperFile, 'export const value = 2'))
  })

  it('regenerates when template files are added and removed', async () => {
    const projectRoot = await createProject()
    const existingFile = path.join(projectRoot, 'src', 'templates', 'example', 'existing.md')
    const addedFile = path.join(projectRoot, 'src', 'templates', 'example', 'added.md')
    await writeFile(existingFile, 'existing')

    const { chokidarWatcher, onStructureChange } = await startWatcher(projectRoot)

    await waitForStructureChange(chokidarWatcher, onStructureChange, 'add', addedFile, () => writeFile(addedFile, 'added'))
    await waitForStructureChange(chokidarWatcher, onStructureChange, 'unlink', existingFile, () => unlink(existingFile))
  })

  it('regenerates for template asset files and directories', async () => {
    const projectRoot = await createProject()
    const assetsDirectory = path.join(projectRoot, 'src', 'templates', 'example', 'assets')
    await mkdir(assetsDirectory, { recursive: true })

    const { chokidarWatcher, onStructureChange } = await startWatcher(projectRoot)
    const variantDirectory = path.join(assetsDirectory, 'common')
    const assetFile = path.join(variantDirectory, 'hero.png')

    await waitForStructureChange(chokidarWatcher, onStructureChange, 'addDir', variantDirectory, () => mkdir(variantDirectory))
    await waitForStructureChange(chokidarWatcher, onStructureChange, 'add', assetFile, () => writeFile(assetFile, 'asset'))
    await waitForStructureChange(chokidarWatcher, onStructureChange, 'unlinkDir', variantDirectory, () => rm(variantDirectory, { recursive: true }))
  })

  it('regenerates for changes in the brand boundary', async () => {
    const projectRoot = await createProject()
    const brandFile = path.join(projectRoot, 'src', 'brand', 'README.md')
    await writeFile(brandFile, 'brand')

    const { chokidarWatcher, onStructureChange } = await startWatcher(projectRoot)

    await waitForStructureChange(chokidarWatcher, onStructureChange, 'change', brandFile, () => writeFile(brandFile, 'updated brand'))
  })

  it('ignores changes in sibling template and brand directories', async () => {
    const projectRoot = await createProject()
    const siblingTemplateFile = path.join(projectRoot, 'src', 'templates-other', 'README.md')
    const siblingBrandFile = path.join(projectRoot, 'src', 'brand-other', 'README.md')
    await mkdir(path.dirname(siblingTemplateFile), { recursive: true })
    await mkdir(path.dirname(siblingBrandFile), { recursive: true })
    await writeFile(siblingTemplateFile, 'outside template')
    await writeFile(siblingBrandFile, 'outside brand')

    const { chokidarWatcher, onStructureChange } = await startWatcher(projectRoot)
    const callsBefore = onStructureChange.mock.calls.length

    await waitForChokidarEvent(chokidarWatcher, 'change', siblingTemplateFile, () => writeFile(siblingTemplateFile, 'updated outside template'))
    await waitForChokidarEvent(chokidarWatcher, 'change', siblingBrandFile, () => writeFile(siblingBrandFile, 'updated outside brand'))

    expect(onStructureChange.mock.calls.length).toBe(callsBefore)
  })

  it('forwards watcher errors to onError', async () => {
    const projectRoot = await createProject()
    const { chokidarWatcher, onError } = await startWatcher(projectRoot)
    const error = new Error('watch failed')

    chokidarWatcher.emit('error', error)

    expect(onError).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith(error)
  })

  it('passes the source directory and ignoreInitial option to chokidar', async () => {
    const projectRoot = await createProject()
    await startWatcher(projectRoot)

    expect(lastWatchArguments).toEqual([path.join(projectRoot, 'src'), { ignoreInitial: true }])
  })

  it('closes the underlying watcher', async () => {
    const projectRoot = await createProject()
    const { result, chokidarWatcher } = await startWatcher(projectRoot)
    const close = vi.spyOn(chokidarWatcher, 'close')

    await result.close()

    expect(close).toHaveBeenCalledOnce()
  })
})
