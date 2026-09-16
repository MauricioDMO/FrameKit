// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { copyTemplate, ExportValidationError, exportTemplate } from '@/editor/export/export-template'

let fetchMock: ReturnType<typeof vi.fn>
let clipboardBlob: Blob
let createObjectURL: ReturnType<typeof vi.fn>
let revokeObjectURL: ReturnType<typeof vi.fn>

beforeEach(() => {
  clipboardBlob = new Blob(['png'], { type: 'image/png' })
  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'image/png' }),
    blob: vi.fn().mockResolvedValue(clipboardBlob)
  })
  vi.stubGlobal('fetch', fetchMock)
  createObjectURL = vi.fn().mockReturnValue('blob:framekit')
  revokeObjectURL = vi.fn()
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  vi.stubGlobal('ClipboardItem', class ClipboardItem {
    constructor (readonly items: Record<string, Blob>) {}
  })
  vi.spyOn(document, 'hasFocus').mockReturnValue(true)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.replaceChildren()
})

function setupClipboard () {
  const write = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { write } })
  return write
}

function requestInit (): RequestInit {
  return fetchMock.mock.calls[0]?.[1] as RequestInit
}

describe('exportTemplate', () => {
  it('requests the exact editor payload and downloads a Blob with a sanitized filename', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    await exportTemplate('social/campaign', 'en', { title: 'Edited', enabled: true })

    expect(fetchMock).toHaveBeenCalledWith('/api/framekit/images/render', expect.objectContaining({ method: 'POST' }))
    expect(JSON.parse(String(requestInit().body))).toEqual({
      template: 'social/campaign',
      variant: 'en',
      data: { title: 'Edited', enabled: true }
    })
    expect(createObjectURL).toHaveBeenCalledWith(clipboardBlob)
    expect(click).toHaveBeenCalledTimes(1)
    const anchor = click.mock.instances[0] as HTMLAnchorElement
    expect(anchor.download).toBe('social-campaign.png')
    expect(anchor.href).toBe('blob:framekit')
    expect(anchor.parentElement).toBeNull()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:framekit')
  })

  it('rejects successful responses that are not PNGs', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      blob: vi.fn()
    })

    await expect(exportTemplate('social/campaign', 'en', {})).rejects.toThrow('invalid content type')
    expect(createObjectURL).not.toHaveBeenCalled()
  })
})

describe('copyTemplate', () => {
  it('requests the same payload and writes the PNG Blob to the clipboard', async () => {
    const write = setupClipboard()

    await copyTemplate('social/campaign', 'en', { title: 'Edited' })

    expect(JSON.parse(String(requestInit().body))).toEqual({
      template: 'social/campaign',
      variant: 'en',
      data: { title: 'Edited' }
    })
    const item = write.mock.calls[0]?.[0]?.[0] as { items: Record<string, Blob> }
    expect(write).toHaveBeenCalledTimes(1)
    expect(item.items).toEqual({ 'image/png': clipboardBlob })
  })

  it('waits for focus before writing the PNG to the clipboard', async () => {
    const write = setupClipboard()
    vi.spyOn(document, 'hasFocus').mockReturnValue(false)

    const copyPromise = copyTemplate('social/campaign', 'en', { title: 'Edited' })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(write).not.toHaveBeenCalled()
    window.dispatchEvent(new Event('focus'))
    await copyPromise

    expect(write).toHaveBeenCalledTimes(1)
  })

  it('rejects before requesting when clipboard support is unavailable', async () => {
    vi.stubGlobal('navigator', {})

    await expect(copyTemplate('social/campaign', 'en', {})).rejects.toThrow('Image clipboard support is unavailable')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('server validation errors', () => {
  it('exposes validated structured field errors', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({
        error: 'invalid_template_data',
        fields: { title: { code: 'required' }, count: { code: 'number_too_small', min: 5 } }
      })
    })

    const promise = exportTemplate('social/campaign', 'en', {})
    await expect(promise).rejects.toBeInstanceOf(ExportValidationError)
    await expect(promise).rejects.toMatchObject({
      fields: { title: { code: 'required' }, count: { code: 'number_too_small', min: 5 } }
    })
  })

  it('uses a generic failure for malformed bodies and server errors', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 422, json: vi.fn().mockResolvedValue({ error: 'invalid_template_data', fields: { title: { code: 'unknown' } } }) })
    await expect(exportTemplate('social/campaign', 'en', {})).rejects.toThrow('HTTP 422')

    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: vi.fn().mockRejectedValue(new Error('not JSON')) })
    await expect(exportTemplate('social/campaign', 'en', {})).rejects.toThrow('HTTP 500')
  })
})
