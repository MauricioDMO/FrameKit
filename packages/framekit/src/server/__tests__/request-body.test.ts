import { afterEach, describe, expect, it, vi } from 'vitest'

import { ImageRenderError } from '@/server/errors'
import { readJsonBody } from '@/server/request-body'

function createRequest (body: BodyInit | null, headers: Record<string, string> = {}): Request {
  return new Request('http://framekit.test/api/v1/images', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body
  })
}

function createStreamRequest (body: ReadableStream<Uint8Array>, headers: Record<string, string> = {}): Request {
  return new Request('http://framekit.test/api/v1/images', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
    duplex: 'half'
  } as RequestInit)
}

async function expectCode (promise: Promise<unknown>, code: ImageRenderError['code']): Promise<void> {
  await expect(promise).rejects.toMatchObject({ code })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('readJsonBody', () => {
  it('reads JSON from a bounded byte stream and accepts UTF-8 charset metadata', async () => {
    const body = createStreamRequest(new ReadableStream({
      start (controller) {
        controller.enqueue(new TextEncoder().encode('{"template":"card"}'))
        controller.close()
      }
    }), { 'content-type': 'application/json; charset=utf-8' })

    await expect(readJsonBody(body)).resolves.toEqual({ template: 'card' })
  })

  it.each([null, 'text/plain', 'application/jsonp', 'application/json; charset=utf-16'])('rejects a non-JSON content type: %s', async (contentType) => {
    const request = contentType === null
      ? new Request('http://framekit.test/api/v1/images', { method: 'POST', body: '{}' })
      : createRequest('{}', { 'content-type': contentType })
    await expectCode(readJsonBody(request), 'invalid_request')
  })

  it.each(['gzip', 'br', 'deflate', 'gzip, identity'])('rejects compressed request bodies: %s', async (contentEncoding) => {
    await expectCode(readJsonBody(createRequest('{}', { 'content-encoding': contentEncoding })), 'invalid_request')
  })

  it('accepts an explicit identity content encoding', async () => {
    await expect(readJsonBody(createRequest('{"template":"card"}', { 'content-encoding': 'identity' }))).resolves.toEqual({ template: 'card' })
  })

  it.each([
    ['missing body', createRequest(null)],
    ['invalid JSON', createRequest('{')]
  ])('rejects %s', async (_name, request) => {
    await expectCode(readJsonBody(request), 'invalid_request')
  })

  it('rejects invalid UTF-8 without exposing decoder details', async () => {
    const request = createStreamRequest(new ReadableStream({
      start (controller) {
        controller.enqueue(Uint8Array.from([0xc3, 0x28]))
        controller.close()
      }
    }))

    await expectCode(readJsonBody(request), 'invalid_request')
  })

  it.each(['12000001', '9'.repeat(400)])('rejects a declared body over 12,000,000 bytes before reading it: %s', async (contentLength) => {
    const request = createStreamRequest(new ReadableStream(), {
      'content-length': contentLength
    })

    await expectCode(readJsonBody(request), 'request_too_large')
    expect(request.bodyUsed).toBe(false)
  })

  it('enforces the 12,000,000-byte limit while streaming', async () => {
    const cancel = vi.fn()
    const request = createStreamRequest(new ReadableStream({
      start (controller) {
        controller.enqueue(new Uint8Array(12_000_001))
      },
      cancel
    }), { 'content-length': '1' })

    await expectCode(readJsonBody(request), 'request_too_large')
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('cancels a pending body read when its signal aborts', async () => {
    const cancel = vi.fn()
    const request = createStreamRequest(new ReadableStream({ cancel }))
    const controller = new AbortController()
    const reading = readJsonBody(request, controller.signal)

    controller.abort()

    await expect(reading).rejects.toBeDefined()
    expect(cancel).toHaveBeenCalledOnce()
  })
})
