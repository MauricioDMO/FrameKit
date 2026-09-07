import { authenticateBearer, ImageRenderError, parseImageApiConfig } from '@mauriciodmo/framekit/server'
import type {
  ImageApiConfig,
  ImageRenderErrorCode,
  ImageRenderFailure,
  ImageRenderRequest,
  ImageRenderRuntimeConfig,
  ResolvedRenderPayload
} from '@mauriciodmo/framekit/server'

const request = {
  template: 'social/post',
  variant: 'launch',
  data: { title: 'Launch' }
} satisfies ImageRenderRequest

const runtime = {
  internalOrigin: new URL('http://127.0.0.1'),
  allowedImageHosts: new Set(['images.example.com']),
  maxConcurrentRenders: 2,
  renderTimeoutMs: 30_000
} satisfies ImageRenderRuntimeConfig

const config = {
  apiKey: 'secret',
  render: runtime
} satisfies ImageApiConfig

const payload = {
  template: request.template,
  variant: request.variant ?? 'launch',
  data: { title: 'Launch', count: 1, enabled: true },
  assets: { common: {}, variants: {} },
  width: 1080,
  height: 1080
} satisfies ResolvedRenderPayload

const failure: ImageRenderFailure = { code: 'render_failed', message: 'Render failed' }
const errorCode: ImageRenderErrorCode = failure.code
const error = new ImageRenderError(failure)
const parsedConfig = parseImageApiConfig({
  FRAMEKIT_API_KEY: config.apiKey,
  FRAMEKIT_INTERNAL_ORIGIN: runtime.internalOrigin.toString()
})
const authorized: boolean = authenticateBearer('Bearer secret', parsedConfig.apiKey)

export { payload, errorCode, error, authorized }
