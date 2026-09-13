import { createRequire } from 'node:module'
import path from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { installBrowser } from '@/tooling/cli/browser'

const mocks = vi.hoisted(() => ({ runChild: vi.fn() }))

vi.mock('@/tooling/cli/run-child', () => ({ runChild: mocks.runChild }))

const require = createRequire(import.meta.url)
const projectRoot = '/tmp/framekit-browser-test'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.runChild.mockResolvedValue(23)
})

describe('framekit browser install', () => {
  it.each([
    [false, ['install', 'chromium', '--only-shell']],
    [true, ['install', 'chromium', '--only-shell', '--with-deps']]
  ] as const)('uses the package-owned Playwright CLI for withDeps=%s', async (withDeps, expectedArgs) => {
    await expect(installBrowser(projectRoot, withDeps)).resolves.toBe(23)

    const playwrightPackageRoot = path.dirname(require.resolve('playwright-core/package.json'))
    expect(mocks.runChild).toHaveBeenCalledWith(
      path.join(playwrightPackageRoot, 'cli.js'),
      expectedArgs,
      projectRoot
    )
  })
})
