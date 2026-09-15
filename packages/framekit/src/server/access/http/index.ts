import { isSameOrigin } from './origin'
import { errorResponse, responseForError } from './errors'
import { account, login, logout, password } from './routes'

type AccessRoute = {
  methods: readonly string[]
  handle: (request: Request) => Promise<Response>
}

const routesByPath = new Map<string, AccessRoute>([
  ['/api/framekit/login', { methods: ['POST'], handle: login }],
  ['/api/framekit/logout', { methods: ['POST'], handle: logout }],
  ['/api/framekit/account', { methods: ['GET', 'PATCH'], handle: account }],
  ['/api/framekit/account/password', { methods: ['POST'], handle: password }]
])

export function createStudioAccessHandler (): (request: Request) => Promise<Response> {
  return async function studioAccessHandler (request: Request): Promise<Response> {
    let pathname: string
    try {
      pathname = new URL(request.url).pathname
    } catch {
      return errorResponse('not_found', 404)
    }

    const route = routesByPath.get(pathname)
    if (route === undefined) return errorResponse('not_found', 404)
    if (!route.methods.includes(request.method)) return errorResponse('method_not_allowed', 405, { Allow: route.methods.join(', ') })
    if (request.method !== 'GET' && !isSameOrigin(request)) return errorResponse('forbidden', 403)

    try {
      return await route.handle(request)
    } catch (error) {
      return responseForError(error)
    }
  }
}
