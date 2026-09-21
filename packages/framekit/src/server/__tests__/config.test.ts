import { describe, expect, it } from 'vitest'

import {
  parseImageRenderConfig,
  type ImageRenderRequest,
  type ImageRenderRuntimeConfig
} from '@/server/config'
import { ImageRenderError, type ImageRenderErrorCode, type ImageRenderFailure } from '@/server/errors'
import type { ResolvedRenderPayload } from '@/types'

const baseEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: 'test'
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
    parseImageRenderConfig(env)
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

describe('parseImageRenderConfig', () => {
  it('infers a loopback origin on the default port', () => {
    const config = parseImageRenderConfig(environment())

    expect(config.internalOrigin.href).toBe('http://localhost:3000/')
  })

  it('infers a loopback origin from a custom port', () => {
    const config = parseImageRenderConfig(environment({ PORT: '4321' }))

    expect(config.internalOrigin.href).toBe('http://localhost:4321/')
  })

  it.each(['', '0', '-1', '+1', '1.5', '1e2', '65536', 'NaN', 'Infinity', ' 3000'])('rejects an invalid PORT: %s', (port) => {
    expectConfigurationFailure(environment({ PORT: port }))
  })

  it.each([undefined, '', ' , , '])('returns an empty host set for empty input: %s', (allowedImageHosts) => {
    const config = parseImageRenderConfig(environment({ FRAMEKIT_ALLOWED_IMAGE_HOSTS: allowedImageHosts }))

    expect(config.allowedImageHosts.size).toBe(0)
  })

  it('normalizes, trims, and deduplicates image hosts', () => {
    const config = parseImageRenderConfig(environment({
      FRAMEKIT_ALLOWED_IMAGE_HOSTS: ' Example.COM, example.com, CDN.Example , , cdn.example '
    }))

    expect([...config.allowedImageHosts]).toEqual(['example.com', 'cdn.example'])
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
    const config: ImageRenderRuntimeConfig = parseImageRenderConfig(environment())

    expect(config.maxConcurrentRenders).toBe(2)
    expect(config.renderTimeoutMs).toBe(30_000)
  })

  it('accepts bounded positive base-10 integers', () => {
    const config = parseImageRenderConfig(environment({
      FRAMEKIT_MAX_CONCURRENT_RENDERS: '0002',
      FRAMEKIT_RENDER_TIMEOUT_MS: '120000'
    }))

    expect(config.maxConcurrentRenders).toBe(2)
    expect(config.renderTimeoutMs).toBe(120_000)
  })

  it.each(['', '0', '-1', '+1', '1.5', '1e2', 'NaN', 'Infinity', '-Infinity', '33', '9007199254740992', ' 2'])('rejects invalid concurrent render limits: %s', (value) => {
    expectConfigurationFailure(environment({ FRAMEKIT_MAX_CONCURRENT_RENDERS: value }))
  })

  it.each(['', '0', '-1', '+1', '1.5', '1e2', 'NaN', 'Infinity', '-Infinity', '120001', '9007199254740992', ' 30000'])('rejects invalid render timeouts: %s', (value) => {
    expectConfigurationFailure(environment({ FRAMEKIT_RENDER_TIMEOUT_MS: value }))
  })
})
