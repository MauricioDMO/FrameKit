import type { TemplateRegistryEntry } from '@/types'

import { createStudioAccessHandler } from './access/http'
import { errorResponse } from './access/http/errors'
import { createStudioImageHandler } from './image-handler'

const imageRenderPath = '/api/framekit/images/render'

export function createFrameKitApiHandler (templates: readonly TemplateRegistryEntry[], env?: NodeJS.ProcessEnv): (request: Request) => Promise<Response> {
  let handlers: {
    access: ReturnType<typeof createStudioAccessHandler>
    image: ReturnType<typeof createStudioImageHandler>
  } | undefined

  function getHandlers () {
    if (handlers !== undefined) return handlers

    const runtimeEnv = env ?? process.env
    handlers = {
      access: createStudioAccessHandler(runtimeEnv),
      image: createStudioImageHandler(templates, runtimeEnv)
    }
    return handlers
  }

  return async function frameKitApiHandler (request: Request): Promise<Response> {
    const { access, image } = getHandlers()
    let pathname: string
    try {
      pathname = new URL(request.url).pathname
    } catch {
      return errorResponse('not_found', 404)
    }

    if (pathname !== imageRenderPath) return access(request)
    if (request.method !== 'POST') return errorResponse('method_not_allowed', 405, { Allow: 'POST' })
    return image(request)
  }
}
