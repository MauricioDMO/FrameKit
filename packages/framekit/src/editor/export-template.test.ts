// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { domToPng } from 'modern-screenshot'

import { copyTemplate, exportTemplate } from './export-template'

vi.mock('modern-screenshot', () => ({
  domToPng: vi.fn().mockResolvedValue('data:image/png;base64,AAAA'),
}))

const originalFontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts')
let clipboardBlob: Blob

beforeEach(() => {
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } })
  vi.mocked(domToPng).mockReset().mockResolvedValue('data:image/png;base64,AAAA')
  clipboardBlob = new Blob(['png'], { type: 'image/png' })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ blob: vi.fn().mockResolvedValue(clipboardBlob) }))
  vi.stubGlobal('ClipboardItem', class ClipboardItem {
    constructor(readonly items: Record<string, Blob>) {}
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.replaceChildren()
  if (originalFontsDescriptor) {
    Object.defineProperty(document, 'fonts', originalFontsDescriptor)
  } else {
    Reflect.deleteProperty(document, 'fonts')
  }
})

function setupClipboard() {
  const write = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { write } })
  return write
}

describe('exportTemplate', () => {
  it('downloads the rendered image with its href and sanitized filename', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    await exportTemplate(document.createElement('div'), 'social/campaign', 100, 100)

    expect(click).toHaveBeenCalledTimes(1)
    const anchor = click.mock.instances[0] as HTMLAnchorElement
    expect(anchor).toBeInstanceOf(HTMLAnchorElement)
    expect(anchor.getAttribute('href')).toBe('data:image/png;base64,AAAA')
    expect(anchor.href).toBe('data:image/png;base64,AAAA')
    expect(anchor.download).toBe('social-campaign.png')
  })
})

describe('copyTemplate', () => {
  it('writes the rendered PNG to the clipboard', async () => {
    const write = setupClipboard()

    await copyTemplate(document.createElement('div'), 100, 100)

    const item = write.mock.calls[0]?.[0]?.[0] as { items: Record<string, Blob> }
    expect(write).toHaveBeenCalledTimes(1)
    expect(item).toBeInstanceOf(ClipboardItem)
    expect(item.items).toEqual({ 'image/png': clipboardBlob })
    expect(fetch).toHaveBeenCalledWith('data:image/png;base64,AAAA')
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

  it('waits for fonts before starting the capture', async () => {
    setupClipboard()
    let resolveFonts!: () => void
    const fontsReady = new Promise<void>((resolve) => {
      resolveFonts = resolve
    })
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: fontsReady } })

    const copy = copyTemplate(document.createElement('div'), 100, 100)
    await Promise.resolve()
    expect(domToPng).not.toHaveBeenCalled()

    resolveFonts()
    await copy
    expect(domToPng).toHaveBeenCalledTimes(1)
  })

  it('rejects before capturing when clipboard support is unavailable', async () => {
    vi.stubGlobal('navigator', {})

    await expect(copyTemplate(document.createElement('div'), 100, 100)).rejects.toThrow('Image clipboard support is unavailable')
    expect(domToPng).not.toHaveBeenCalled()
  })

  it('rejects before capturing when ClipboardItem is unavailable', async () => {
    setupClipboard()
    vi.stubGlobal('ClipboardItem', undefined)

    await expect(copyTemplate(document.createElement('div'), 100, 100)).rejects.toThrow('Image clipboard support is unavailable')
    expect(domToPng).not.toHaveBeenCalled()
  })

  it('removes the temporary capture when screenshot rendering fails', async () => {
    setupClipboard()
    const error = new Error('capture failed')
    vi.mocked(domToPng).mockRejectedValueOnce(error)

    await expect(copyTemplate(document.createElement('div'), 100, 100)).rejects.toBe(error)

    const capture = vi.mocked(domToPng).mock.lastCall?.[0] as unknown as HTMLDivElement
    expect(capture).toBeTruthy()
    expect(capture.parentElement).toBeNull()
  })

  it('propagates clipboard write errors', async () => {
    const error = new Error('clipboard denied')
    const write = setupClipboard()
    write.mockRejectedValueOnce(error)

    await expect(copyTemplate(document.createElement('div'), 100, 100)).rejects.toBe(error)
    expect(write).toHaveBeenCalledTimes(1)
  })
})
