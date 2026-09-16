import type { TemplateRegistryEntry } from '../types'

import { createStudioAccessHandler } from './access/http'
import { errorResponse } from './access/http/errors'
import { createStudioImageHandler } from './image-handler'

const imageRenderPath = '/api/framekit/images/render'

export function createFrameKitApiHandler (templates: readonly TemplateRegistryEntry[]): (request: Request) => Promise<Response> {
  const accessHandler = createStudioAccessHandler()
  const imageHandler = createStudioImageHandler(templates)

  return async function frameKitApiHandler (request: Request): Promise<Response> {
    let pathname: string
    try {
      pathname = new URL(request.url).pathname
    } catch {
      return errorResponse('not_found', 404)
    }

    if (pathname !== imageRenderPath) return accessHandler(request)
    if (request.method !== 'POST') return errorResponse('method_not_allowed', 405, { Allow: 'POST' })
    return imageHandler(request)
  }
}
