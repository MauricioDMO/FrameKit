import { describe, expect, it } from 'vitest'

import {
  parseImageApiConfig,
  type ImageApiConfig,
  type ImageRenderRequest,
  type ResolvedRenderPayload
} from '@/server/config'
import { ImageRenderError, type ImageRenderErrorCode, type ImageRenderFailure } from '@/server/errors'

const baseEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: 'test',
  FRAMEKIT_API_KEY: 'production-secret',
  FRAMEKIT_INTERNAL_ORIGIN: 'http://127.0.0.1:3000'
}

const errorCodes = [
  'invalid_request',
  'unauthorized',
  'template_not_found',
  'request_too_large',
  'unsupported_image',
  'invalid_template_data',
  'image_host_not_allowed',
  'image_fetch_failed',
  'api_not_configured',
  'render_capacity_exhausted',
  'render_timeout',
  'render_failed'
] as const satisfies readonly ImageRenderErrorCode[]

function environment (overrides: Partial<NodeJS.ProcessEnv> = {}): NodeJS.ProcessEnv {
  return { ...baseEnvironment, ...overrides }
}

function expectConfigurationFailure (env: NodeJS.ProcessEnv): ImageRenderError {
  try {
    parseImageApiConfig(env)
    throw new Error('Expected configuration parsing to fail')
  } catch (error) {
    expect(error).toBeInstanceOf(ImageRenderError)
    const failure = error as ImageRenderError
    expect(failure.code).toBe('api_not_configured')
    return failure
  }
}

describe('ImageRenderError', () => {
  it.each(errorCodes)('accepts the public %s code', (code) => {
    const error = new ImageRenderError({ code, message: 'safe diagnostic' })

    expect(error).toBeInstanceOf(Error)
    expect(error.code).toBe(code)
    expect(error.message).toBe('safe diagnostic')
  })

  it('rejects arbitrary runtime codes', () => {
    const failure = { code: 'not-a-render-code', message: 'safe diagnostic' } as unknown as ImageRenderFailure

    expect(() => new ImageRenderError(failure)).toThrowError(TypeError)
  })

  it('allows fields only for invalid template data', () => {
    const error = new ImageRenderError({
      code: 'invalid_template_data',
      message: 'Template data is invalid',
      fields: { title: 'required' }
    })

    expect(error.fields).toEqual({ title: 'required' })
    expect(() => new ImageRenderError({
      code: 'invalid_request',
      message: 'Invalid request',
      fields: { title: 'required' }
    })).toThrowError(TypeError)
  })

  it('keeps causes out of safe failure data and JSON serialization', () => {
    const secret = 'secret-cause-value'
    const error = new ImageRenderError({
      code: 'render_failed',
      message: 'Image rendering failed',
      cause: new Error(secret)
    })

    expect(error.cause).toBeInstanceOf(Error)
    expect(error.toSafeFailure()).toEqual({ code: 'render_failed', message: 'Image rendering failed' })
    expect(error.toJSON()).toEqual({ code: 'render_failed', message: 'Image rendering failed' })
    expect(JSON.stringify(error)).not.toContain(secret)
    expect(JSON.stringify(error)).not.toContain('cause')
    expect(Object.keys(error)).not.toContain('cause')
  })
})

describe('server render contracts', () => {
  it('keeps render requests and resolved payloads serializable and scoped', () => {
    const request: ImageRenderRequest = {
      template: 'social/post',
      variant: 'summer',
      data: { title: 'Offer' }
    }
    const payload: ResolvedRenderPayload = {
      template: request.template,
      variant: request.variant ?? 'default',
      data: { title: 'Offer', count: 2, enabled: true },
      assets: { common: { logo: '/logo.svg' }, variants: { summer: { hero: '/hero.png' } } },
      width: 1080,
      height: 1080
    }

    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload)
    expect(Object.keys(payload).sort()).toEqual(['assets', 'data', 'height', 'template', 'variant', 'width'])
    expect((payload as unknown as Record<string, unknown>).apiKey).toBeUndefined()
    expect((payload as unknown as Record<string, unknown>).cause).toBeUndefined()
  })
})

describe('parseImageApiConfig', () => {
  it.each([undefined, ''])('rejects a missing or empty API key: %s', (apiKey) => {
    const failure = expectConfigurationFailure(environment({ FRAMEKIT_API_KEY: apiKey }))

    expect(failure.message).not.toContain('production-secret')
    expect(failure.toSafeFailure()).not.toHaveProperty('cause')
  })

  it('preserves the API key exactly', () => {
    const apiKey = '  key with intentional whitespace  '
    const config = parseImageApiConfig(environment({ FRAMEKIT_API_KEY: apiKey }))

    expect(config.apiKey).toBe(apiKey)
  })

  it.each([
    undefined,
    '',
    'https://127.0.0.1:3000',
    'http://example.com:3000',
    'http://user:password@localhost:3000',
    'http://@localhost:3000',
    'http://localhost:3000/path',
    'http://localhost:3000/.',
    'http://localhost:3000/%2e%2e',
    'http://localhost:',
    'http://localhost:3000?query=1',
    'http://localhost:3000#fragment',
    'http://2130706433:3000',
    'not an origin'
  ])('rejects an invalid internal origin: %s', (internalOrigin) => {
    expectConfigurationFailure(environment({ FRAMEKIT_INTERNAL_ORIGIN: internalOrigin }))
  })

  it.each([
    ['http://127.0.0.1:4321', 'http://127.0.0.1:4321/'],
    ['http://[::1]:4321', 'http://[::1]:4321/'],
    ['http://localhost', 'http://localhost/']
  ])('accepts and normalizes a loopback origin', (internalOrigin, expected) => {
    const config = parseImageApiConfig(environment({ FRAMEKIT_INTERNAL_ORIGIN: internalOrigin }))

    expect(config.render.internalOrigin.href).toBe(expected)
  })

  it.each([undefined, '', ' , , '])('returns an empty host set for empty input: %s', (allowedImageHosts) => {
    const config = parseImageApiConfig(environment({ FRAMEKIT_ALLOWED_IMAGE_HOSTS: allowedImageHosts }))

    expect(config.render.allowedImageHosts.size).toBe(0)
  })

  it('normalizes, trims, and deduplicates image hosts', () => {
    const config = parseImageApiConfig(environment({
      FRAMEKIT_ALLOWED_IMAGE_HOSTS: ' Example.COM, example.com, CDN.Example , , cdn.example '
    }))

    expect([...config.render.allowedImageHosts]).toEqual(['example.com', 'cdn.example'])
  })

  it.each([
    'https://example.com',
    'user@example.com',
    'example.com/path',
    'example.com?query=1',
    'example.com#fragment',
    '*.example.com',
    'example.*',
    'example.com:443',
    '127.0.0.1',
    '127.1',
    '2130706433',
    '0x7f000001',
    '[::1]',
    '::1',
    'example.com.'
  ])('rejects a non-hostname allowlist entry: %s', (allowedImageHosts) => {
    const failure = expectConfigurationFailure(environment({ FRAMEKIT_ALLOWED_IMAGE_HOSTS: allowedImageHosts }))

    expect(failure.message).not.toContain(allowedImageHosts)
  })

  it('uses the documented numeric defaults', () => {
    const config: ImageApiConfig = parseImageApiConfig(environment())

    expect(config.render.maxConcurrentRenders).toBe(2)
    expect(config.render.renderTimeoutMs).toBe(30_000)
  })

  it('accepts bounded positive base-10 integers', () => {
    const config = parseImageApiConfig(environment({
      FRAMEKIT_MAX_CONCURRENT_RENDERS: '0002',
      FRAMEKIT_RENDER_TIMEOUT_MS: '120000'
    }))

    expect(config.render.maxConcurrentRenders).toBe(2)
    expect(config.render.renderTimeoutMs).toBe(120_000)
  })

  it.each(['', '0', '-1', '+1', '1.5', '1e2', 'NaN', 'Infinity', '-Infinity', '33', '9007199254740992', ' 2'])('rejects invalid concurrent render limits: %s', (value) => {
    expectConfigurationFailure(environment({ FRAMEKIT_MAX_CONCURRENT_RENDERS: value }))
  })

  it.each(['', '0', '-1', '+1', '1.5', '1e2', 'NaN', 'Infinity', '-Infinity', '120001', '9007199254740992', ' 30000'])('rejects invalid render timeouts: %s', (value) => {
    expectConfigurationFailure(environment({ FRAMEKIT_RENDER_TIMEOUT_MS: value }))
  })
})
