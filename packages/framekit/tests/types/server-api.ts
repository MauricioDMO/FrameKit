import { createFrameKitApiHandler, createStudioImageHandler, ImageRenderError, renderTemplateImage } from '@mauriciodmo/framekit/server'
import type {
  ApiTokenMetadata,
  CreatedApiToken,
  ImageRenderErrorCode,
  ImageRenderFailure,
  ImageRenderRequest,
  ImageRenderRuntimeConfig,
  ResolvedRenderPayload
} from '@mauriciodmo/framekit/server'

const tokenMetadata = {
  id: 'token-id',
  name: 'deploy',
  tokenPrefix: 'fk_abc',
  createdAt: 1,
  lastUsedAt: null,
  revokedAt: null
} satisfies ApiTokenMetadata

const createdToken = {
  ...tokenMetadata,
  token: 'fk_secret'
} satisfies CreatedApiToken

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
const rendered: Promise<Buffer> = renderTemplateImage({ payload, config: runtime, signal: new AbortController().signal })
const apiHandler: (request: Request) => Promise<Response> = createFrameKitApiHandler([])
const studioImageHandler: (request: Request) => Promise<Response> = createStudioImageHandler([])

export {
  tokenMetadata,
  createdToken,
  payload,
  errorCode,
  error,
  rendered,
  apiHandler,
  studioImageHandler
}
