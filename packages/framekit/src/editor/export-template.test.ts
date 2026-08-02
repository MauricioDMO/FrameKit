// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { domToPng } from 'modern-screenshot'

import { copyTemplate } from './export-template'

vi.mock('modern-screenshot', () => ({
  domToPng: vi.fn().mockResolvedValue('data:image/png;base64,AAAA'),
}))

describe('copyTemplate', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } })
    vi.mocked(domToPng).mockClear()
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

  it('captures outside the preview transform and removes the temporary node', async () => {
    const preview = document.createElement('div')
    preview.style.transform = 'scale(0.5)'
    const element = document.createElement('div')
    element.textContent = 'Artwork'
    preview.append(element)
    document.body.append(preview)
    const write = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { write } })

    await copyTemplate(element, 100, 100)

    const capture = vi.mocked(domToPng).mock.lastCall?.[0] as unknown as HTMLDivElement
    expect(capture).not.toBe(element)
    expect(capture.parentElement).toBeNull()
    expect(capture.style.position).toBe('fixed')
    expect(capture.style.top).toBe('0px')
    expect(capture.style.left).toBe('-100000px')
    expect(capture.style.transform).toBe('none')
    expect(domToPng).toHaveBeenLastCalledWith(capture, { width: 100, height: 100, scale: 1 })

    preview.remove()
  })
})
