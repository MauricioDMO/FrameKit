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

let lastReady: Promise<void> | undefined
let lastWatchArguments: Parameters<typeof chokidar.watch> | undefined

function waitForReady(watcher: FSWatcher): Promise<void> {
  if (watcher._readyEmitted) return Promise.resolve()

  return new Promise<void>((resolve, reject) => {
    const onReady = () => {
      watcher.off('error', onError)
      resolve()
    }
    const onError = (error: unknown) => {
      watcher.off('ready', onReady)
      reject(error)
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
  const ready = lastReady
  const watcher = chokidarWatchers.at(-1)
  if (!ready || !watcher) throw new Error('Expected a Chokidar watcher')

  activeWatchers.push(result)
  await ready
  expect(onStructureChange).not.toHaveBeenCalled()

  return { chokidarWatcher: watcher, onError, onStructureChange, result }
}

async function waitForStructureChange(
  onStructureChange: ReturnType<typeof vi.fn>,
  mutation: () => Promise<void>,
): Promise<void> {
  const callsBefore = onStructureChange.mock.calls.length
  await mutation()
  await vi.waitFor(() => {
    expect(onStructureChange.mock.calls.length).toBeGreaterThan(callsBefore)
  }, { timeout: 3_000 })
}

async function waitForChokidarEvent(
  watcher: FSWatcher,
  expectedPath: string,
  mutation: () => Promise<void>,
): Promise<void> {
  const normalizedExpectedPath = path.resolve(expectedPath)

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      watcher.off('all', onAll)
      reject(new Error(`Timed out waiting for Chokidar to observe ${normalizedExpectedPath}`))
    }, 3_000)

    const onAll = (_event: string, filePath: string) => {
      if (path.resolve(filePath) !== normalizedExpectedPath) return
      clearTimeout(timeout)
      watcher.off('all', onAll)
      setImmediate(resolve)
    }

    watcher.on('all', onAll)
    void mutation().catch((error: unknown) => {
      clearTimeout(timeout)
      watcher.off('all', onAll)
      reject(error)
    })
  })
}

beforeEach(() => {
  chokidarWatchers.length = 0
  lastReady = undefined
  lastWatchArguments = undefined

  vi.spyOn(chokidar, 'watch').mockImplementation((...args) => {
    lastWatchArguments = args
    const watcher = originalWatch(...args)
    chokidarWatchers.push(watcher)
    lastReady = waitForReady(watcher)
    return watcher
  })
})

afterEach(async () => {
  await Promise.all(activeWatchers.splice(0).map((watcher) => watcher.close()))
  await Promise.all(activeRoots.splice(0).map((projectRoot) => rm(projectRoot, { recursive: true, force: true })))
  vi.restoreAllMocks()
})

describe('watchTemplates', () => {
  it('regenerates when template.tsx changes', async () => {
    const projectRoot = await createProject()
    const templateFile = path.join(projectRoot, 'src', 'templates', 'example', 'template.tsx')
    await writeFile(templateFile, 'export default 1')

    const { onError, onStructureChange } = await startWatcher(projectRoot)

    await waitForStructureChange(onStructureChange, () => writeFile(templateFile, 'export default 2'))

    expect(onError).not.toHaveBeenCalled()
  })

  it('regenerates when a private template helper changes', async () => {
    const projectRoot = await createProject()
    const helperFile = path.join(projectRoot, 'src', 'templates', 'example', 'helpers.ts')
    await writeFile(helperFile, 'export const value = 1')

    const { onStructureChange } = await startWatcher(projectRoot)

    await waitForStructureChange(onStructureChange, () => writeFile(helperFile, 'export const value = 2'))
  })

  it('regenerates when template files are added and removed', async () => {
    const projectRoot = await createProject()
    const existingFile = path.join(projectRoot, 'src', 'templates', 'example', 'existing.md')
    const addedFile = path.join(projectRoot, 'src', 'templates', 'example', 'added.md')
    await writeFile(existingFile, 'existing')

    const { onStructureChange } = await startWatcher(projectRoot)

    await waitForStructureChange(onStructureChange, () => writeFile(addedFile, 'added'))
    await waitForStructureChange(onStructureChange, () => unlink(existingFile))
  })

  it('regenerates for template asset files and directories', async () => {
    const projectRoot = await createProject()
    const assetsDirectory = path.join(projectRoot, 'src', 'templates', 'example', 'assets')
    await mkdir(assetsDirectory, { recursive: true })

    const { onStructureChange } = await startWatcher(projectRoot)
    const variantDirectory = path.join(assetsDirectory, 'common')
    const assetFile = path.join(variantDirectory, 'hero.png')

    await waitForStructureChange(onStructureChange, () => mkdir(variantDirectory))
    await waitForStructureChange(onStructureChange, () => writeFile(assetFile, 'asset'))
    await waitForStructureChange(onStructureChange, () => rm(variantDirectory, { recursive: true }))
  })

  it('regenerates for changes in the brand boundary', async () => {
    const projectRoot = await createProject()
    const brandFile = path.join(projectRoot, 'src', 'brand', 'README.md')
    await writeFile(brandFile, 'brand')

    const { onStructureChange } = await startWatcher(projectRoot)

    await waitForStructureChange(onStructureChange, () => writeFile(brandFile, 'updated brand'))
  })

  it('ignores changes outside the template and brand boundaries', async () => {
    const projectRoot = await createProject()
    const outsideFile = path.join(projectRoot, 'src', 'components', 'README.md')
    await mkdir(path.dirname(outsideFile), { recursive: true })
    await writeFile(outsideFile, 'outside')

    const { chokidarWatcher, onStructureChange } = await startWatcher(projectRoot)
    const callsBefore = onStructureChange.mock.calls.length

    await waitForChokidarEvent(chokidarWatcher, outsideFile, () => writeFile(outsideFile, 'updated outside'))

    expect(onStructureChange.mock.calls.length).toBe(callsBefore)
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
