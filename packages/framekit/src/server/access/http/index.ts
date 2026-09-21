import { isAuthenticationEnabled } from '@/server/access/config'
import { isSameOrigin } from './origin'
import { errorResponse, responseForError } from './errors'
import { account, login, logout, password, token, tokens, user, userPassword, userTokens, users } from './routes'

type AccessRoute = {
  methods: readonly string[]
  handle: (request: Request, parameters: readonly string[]) => Promise<Response>
}

const routesByPath = new Map<string, AccessRoute>([
  ['/api/framekit/login', { methods: ['POST'], handle: login }],
  ['/api/framekit/logout', { methods: ['POST'], handle: logout }],
  ['/api/framekit/account', { methods: ['GET', 'PATCH'], handle: account }],
  ['/api/framekit/account/password', { methods: ['POST'], handle: password }],
  ['/api/framekit/tokens', { methods: ['GET', 'POST'], handle: tokens }],
  ['/api/framekit/users', { methods: ['GET', 'POST'], handle: users }]
])

const dynamicRoutes = new Map<string, AccessRoute>([
  ['tokens', { methods: ['DELETE'], handle: token }],
  ['users', { methods: ['PATCH', 'DELETE'], handle: user }],
  ['users/password', { methods: ['POST'], handle: userPassword }],
  ['users/tokens', { methods: ['GET'], handle: userTokens }]
])

function decodePathId (value: string): string | undefined {
  if (value === '') return undefined

  try {
    const decoded = decodeURIComponent(value)
    if (decoded === '' || decoded === '.' || decoded === '..' || decoded.includes('/') || decoded.includes('\\')) return undefined
    return decoded
  } catch {
    return undefined
  }
}

function matchRoute (pathname: string): { route: AccessRoute; parameters: readonly string[] } | undefined {
  const staticRoute = routesByPath.get(pathname)
  if (staticRoute !== undefined) return { route: staticRoute, parameters: [] }

  const match = /^\/api\/framekit\/(tokens|users)\/([^/]+)(?:\/(password|tokens))?$/.exec(pathname)
  if (match === null) return undefined

  const routeKey = match[3] === undefined ? match[1] : `${match[1]}/${match[3]}`
  const route = dynamicRoutes.get(routeKey)
  if (route === undefined) return undefined

  const id = decodePathId(match[2])
  if (id === undefined) return undefined
  return { route, parameters: [id] }
}

export function createStudioAccessHandler (): (request: Request) => Promise<Response> {
  return async function studioAccessHandler (request: Request): Promise<Response> {
    let pathname: string
    try {
      pathname = new URL(request.url).pathname
    } catch {
      return errorResponse('not_found', 404)
    }

    const matchedRoute = matchRoute(pathname)
    if (matchedRoute === undefined) return errorResponse('not_found', 404)

    try {
      if (!isAuthenticationEnabled()) return errorResponse('not_found', 404)

      const { route, parameters } = matchedRoute
      if (!route.methods.includes(request.method)) return errorResponse('method_not_allowed', 405, { Allow: route.methods.join(', ') })
      if (request.method !== 'GET' && !isSameOrigin(request)) return errorResponse('forbidden', 403)

      return await route.handle(request, parameters)
    } catch (error) {
      return responseForError(error)
    }
  }
}
