import { authenticateApiToken } from '@/server/access/api-tokens'
import { isAuthenticationEnabled } from '@/server/access/config'
import { getSession } from '@/server/access/sessions'
import { isSameOrigin } from '@/server/access/http/origin'
import { readSessionCookie } from '@/server/access/http/session'
import type { ImageRenderRuntimeConfig } from '@/server/config'
import { parseImageRenderConfig } from '@/server/config'
import type { TemplateRegistryEntry } from '@/types'
import { renderTemplateImage } from '@/server/render-image'
import { readJsonBody } from '@/server/request-body'
import { failure } from './errors'
import { awaitWithAbort, createRequestDeadline, normalizeFailure, throwIfAborted } from './request-deadline'
import { parseImageRequest } from './parse-request'
import { loadDefinition, resolveRenderPayload } from './render-payload'
import { errorResponse, successResponse } from './response'

function readBearerCredential (authorization: string | null): string | undefined {
  if (authorization === null) return undefined

  const match = /^Bearer ([^\s,]+)$/i.exec(authorization)
  if (match === null || match[0] !== authorization) return undefined
  return match[1]
}

function authenticateStudioImageRequest (request: Request): boolean {
  const authorization = request.headers.get('authorization')
  if (authorization !== null) {
    const credential = readBearerCredential(authorization)
    return credential !== undefined && authenticateApiToken(credential) !== undefined
  }

  if (!isSameOrigin(request)) return false
  return getSession(readSessionCookie(request)) !== undefined
}

function createStudioImageHandlerInternal (
  templates: readonly TemplateRegistryEntry[]
): (request: Request) => Promise<Response> {
  return async function imageHandler (request: Request): Promise<Response> {
    let config: ImageRenderRuntimeConfig
    let authenticationEnabled: boolean
    try {
      config = parseImageRenderConfig(process.env)
      authenticationEnabled = isAuthenticationEnabled()
    } catch (error) {
      return errorResponse(failure('api_not_configured', error))
    }

    const deadline = createRequestDeadline(request, config.renderTimeoutMs)
    try {
      if (authenticationEnabled && !authenticateStudioImageRequest(request)) {
        return errorResponse(failure('unauthorized'))
      }

      const requestData = parseImageRequest(await readJsonBody(request, deadline.signal))
      throwIfAborted(deadline)

      const entry = templates.find((candidate) => candidate.slug === requestData.template)
      if (entry === undefined) throw failure('template_not_found')

      const definition = await loadDefinition(entry, deadline.signal)
      const payload = await resolveRenderPayload({
        entry,
        definition,
        request: requestData,
        config,
        deadline
      })
      throwIfAborted(deadline)

      const bytes = await awaitWithAbort(() => renderTemplateImage({ payload, config, signal: deadline.signal }), deadline.signal)
      throwIfAborted(deadline)
      return successResponse(entry.slug, bytes)
    } catch (error) {
      return errorResponse(normalizeFailure(error, deadline))
    } finally {
      deadline.cleanup()
    }
  }
}

export function createStudioImageHandler (templates: readonly TemplateRegistryEntry[]): (request: Request) => Promise<Response> {
  return createStudioImageHandlerInternal(templates)
}
