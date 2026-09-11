import { authenticateBearer } from '../auth'
import type { ImageApiConfig } from '../config'
import { parseImageApiConfig } from '../config'
import type { TemplateRegistryEntry } from '../../types'
import { renderTemplateImage } from '../render-image'
import { readJsonBody } from '../request-body'
import { failure } from './errors'
import { awaitWithAbort, createRequestDeadline, normalizeFailure, throwIfAborted } from './request-deadline'
import { parseImageRequest } from './parse-request'
import { loadDefinition, resolveRenderPayload } from './render-payload'
import { errorResponse, successResponse } from './response'

export function createImageHandler (templates: readonly TemplateRegistryEntry[]): (request: Request) => Promise<Response> {
  return async function imageHandler (request: Request): Promise<Response> {
    let config: ImageApiConfig
    try {
      config = parseImageApiConfig(process.env)
    } catch (error) {
      return errorResponse(failure('api_not_configured', error))
    }

    const deadline = createRequestDeadline(request, config.render.renderTimeoutMs)
    try {
      if (!authenticateBearer(request.headers.get('authorization'), config.apiKey)) {
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
        config: config.render,
        deadline
      })
      throwIfAborted(deadline)

      const bytes = await awaitWithAbort(() => renderTemplateImage({ payload, config: config.render, signal: deadline.signal }), deadline.signal)
      throwIfAborted(deadline)
      return successResponse(entry.slug, bytes)
    } catch (error) {
      return errorResponse(normalizeFailure(error, deadline))
    } finally {
      deadline.cleanup()
    }
  }
}
