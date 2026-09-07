import { afterEach, describe, expect, it, vi } from 'vitest'

import { expectCode, pngBytes, pngDataUrl, prepare } from './fixtures'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('remote image inputs', () => {
  it('rejects an explicitly allowlisted localhost for initial and redirect targets', async () => {
    const allowedImageHosts = new Set(['images.example.com', 'localhost'])
    const initialFetch = vi.fn()
    vi.stubGlobal('fetch', initialFetch)

    await expectCode(prepare({ commonImage: 'https://localhost/hero.png' }, { allowedImageHosts }), 'unsupported_image')
    expect(initialFetch).not.toHaveBeenCalled()

    const redirectFetch = vi.fn().mockResolvedValue(new Response(null, {
      status: 302,
      headers: { location: 'https://localhost/private.png?token=redirect-secret' }
    }))
    vi.stubGlobal('fetch', redirectFetch)

    const error = await expectCode(prepare({ commonImage: 'https://images.example.com/start.png' }, { allowedImageHosts }), 'image_fetch_failed')
    expect(redirectFetch).toHaveBeenCalledTimes(1)
    expect(error.message).not.toContain('localhost')
    expect(JSON.stringify(error)).not.toContain('redirect-secret')
  })

  it('fetches allowlisted HTTPS images and canonicalizes the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(pngBytes, {
      status: 200,
      headers: { 'content-type': 'image/png', 'content-length': String(pngBytes.length) }
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await prepare({ commonImage: 'https://images.example.com/hero.png?token=secret' })

    expect(result.assets.common.commonImage).toBe(pngDataUrl)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://images.example.com/hero.png?token=secret',
      expect.objectContaining({ redirect: 'manual' })
    )
  })

  it('follows up to three manually validated redirects', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: '/step-two.png' } }))
      .mockResolvedValueOnce(new Response(null, { status: 307, headers: { location: 'https://images.example.com/final.png' } }))
      .mockResolvedValueOnce(new Response(pngBytes, { status: 200, headers: { 'content-type': 'image/png' } }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await prepare({ commonImage: 'https://images.example.com/step-one.png' })

    expect(result.assets.common.commonImage).toBe(pngDataUrl)
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://images.example.com/step-one.png', expect.objectContaining({ redirect: 'manual' }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://images.example.com/step-two.png', expect.objectContaining({ redirect: 'manual' }))
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'https://images.example.com/final.png', expect.objectContaining({ redirect: 'manual' }))
  })

  it('rejects blocked redirect targets and redirect loops', async () => {
    const blockedFetch = vi.fn().mockResolvedValue(new Response(null, {
      status: 302,
      headers: { location: 'https://other.example.com/secret.png' }
    }))
    vi.stubGlobal('fetch', blockedFetch)
    await expectCode(prepare({ commonImage: 'https://images.example.com/start.png' }), 'image_host_not_allowed')

    const loopFetch = vi.fn().mockImplementation(async () => new Response(null, {
      status: 302,
      headers: { location: '/again.png' }
    }))
    vi.stubGlobal('fetch', loopFetch)
    await expectCode(prepare({ commonImage: 'https://images.example.com/start.png' }), 'image_fetch_failed')
    expect(loopFetch).toHaveBeenCalledTimes(4)
  })

  it.each([
    ['http://images.example.com/private.png?token=redirect-secret', 'image_fetch_failed'],
    ['https://127.0.0.1/private.png?token=redirect-secret', 'image_fetch_failed'],
    ['https://10.0.0.1/private.png?token=redirect-secret', 'image_fetch_failed'],
    ['https://localhost/private.png?token=redirect-secret', 'image_fetch_failed'],
    ['https://user:password@images.example.com/private.png?token=redirect-secret', 'image_fetch_failed'],
    ['https://images.example.com/private.png#redirect-secret', 'image_fetch_failed'],
    ['https://images.example.com:8443/private.png?token=redirect-secret', 'image_fetch_failed']
  ] as const)('rejects unsafe redirect targets before a second fetch: %s', async (location, code) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, {
      status: 302,
      headers: { location }
    }))
    vi.stubGlobal('fetch', fetchMock)

    const error = await expectCode(prepare({ commonImage: 'https://images.example.com/start.png' }), code)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(error.message).not.toContain(location)
    expect(JSON.stringify(error)).not.toContain(location)
    expect(JSON.stringify(error)).not.toContain('redirect-secret')
  })

  it('maps status, content-type, and declared-size failures to stable codes', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    fetchMock.mockResolvedValueOnce(new Response('private response body', {
      status: 404,
      headers: { 'content-type': 'image/png' }
    }))
    await expectCode(prepare({ commonImage: 'https://images.example.com/missing.png' }), 'image_fetch_failed')

    fetchMock.mockResolvedValueOnce(new Response('<svg>private response body</svg>', {
      status: 200,
      headers: { 'content-type': 'image/svg+xml' }
    }))
    await expectCode(prepare({ commonImage: 'https://images.example.com/vector.svg' }), 'unsupported_image')

    fetchMock.mockResolvedValueOnce(new Response(pngBytes, {
      status: 200,
      headers: { 'content-type': 'application/octet-stream' }
    }))
    await expectCode(prepare({ commonImage: 'https://images.example.com/blob' }), 'unsupported_image')

    const cancelDeclaredOversize = vi.fn()
    fetchMock.mockResolvedValueOnce({
      status: 200,
      headers: new Headers({ 'content-type': 'image/png', 'content-length': '8000001' }),
      body: { cancel: cancelDeclaredOversize }
    } as unknown as Response)
    await expectCode(prepare({ commonImage: 'https://images.example.com/large.png' }), 'request_too_large')
    expect(cancelDeclaredOversize).toHaveBeenCalledTimes(1)

    const cancelMalformedLength = vi.fn()
    fetchMock.mockResolvedValueOnce({
      status: 200,
      headers: new Headers({ 'content-type': 'image/png', 'content-length': 'not-a-length' }),
      body: { cancel: cancelMalformedLength }
    } as unknown as Response)
    await expectCode(prepare({ commonImage: 'https://images.example.com/malformed-length.png' }), 'image_fetch_failed')
    expect(cancelMalformedLength).toHaveBeenCalledTimes(1)
  })

  it('cancels a response stream as soon as it exceeds 8,000,000 bytes', async () => {
    const cancel = vi.fn()
    const chunks = [
      { done: false, value: pngBytes },
      { done: false, value: new Uint8Array(8_000_000) }
    ]
    const reader = {
      read: vi.fn(async () => chunks.shift() ?? { done: true, value: undefined }),
      cancel,
      releaseLock: vi.fn()
    }
    const response = {
      status: 200,
      headers: new Headers({ 'content-type': 'image/png' }),
      body: { getReader: () => reader }
    } as unknown as Response
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))

    await expectCode(prepare({ commonImage: 'https://images.example.com/large-stream.png' }), 'request_too_large')
    expect(cancel).toHaveBeenCalledTimes(1)
  })

  it('preserves abort errors from fetch', async () => {
    const controller = new AbortController()
    const abort = new DOMException('aborted', 'AbortError')
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, options: RequestInit) => {
      expect(options.signal).toBe(controller.signal)
      throw abort
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(prepare({ commonImage: 'https://images.example.com/abort.png' }, { signal: controller.signal })).rejects.toBe(abort)
    expect(fetchMock).toHaveBeenCalledWith('https://images.example.com/abort.png', expect.objectContaining({ signal: controller.signal }))
  })

  it('does not leak URLs, query strings, or response bodies in failures', async () => {
    const secretUrl = 'https://images.example.com/private.png?token=secret-token'
    const secretBody = 'response-body-secret'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(`${secretUrl} ${secretBody}`)))

    const error = await expectCode(prepare({ commonImage: secretUrl }), 'image_fetch_failed')
    expect(error.message).not.toContain(secretUrl)
    expect(error.message).not.toContain('secret-token')
    expect(error.message).not.toContain(secretBody)
    expect(JSON.stringify(error)).not.toContain(secretUrl)
    expect(JSON.stringify(error)).not.toContain(secretBody)
  })
})
