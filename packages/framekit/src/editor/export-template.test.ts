// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { copyTemplate } from './export-template'

vi.mock('modern-screenshot', () => ({
  domToPng: vi.fn().mockResolvedValue('data:image/png;base64,AAAA'),
}))

describe('copyTemplate', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ blob: () => Promise.resolve(new Blob(['png'], { type: 'image/png' })) }))
    vi.stubGlobal('ClipboardItem', class ClipboardItem {
      constructor(readonly items: Record<string, Blob>) {}
    })
  })

  it('writes the rendered PNG to the clipboard', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { write } })

    await copyTemplate(document.createElement('div'), 100, 100)

    expect(write).toHaveBeenCalledWith([expect.any(ClipboardItem)])
  })
})
