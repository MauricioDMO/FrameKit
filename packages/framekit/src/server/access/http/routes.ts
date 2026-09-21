import { createApiToken, listApiTokens, revokeApiToken } from '@/server/access/api-tokens'
import { authenticateUser, bootstrapUsers, createUser, deleteUser, getManagedUserById, listUsers, setPassword, updateUser, updateUsername } from '@/server/access/users'
import { errorResponse, fail, jsonResponse } from './errors'
import { exactBody, readAccessJson } from './request'
import { deleteSession, expiredSessionCookie, requireSession, sessionCookie, createSession, readSessionCookie } from './session'

type PathParameters = readonly string[]

function requireAdministrator (request: Request) {
  const user = requireSession(request)
  if (user.role !== 'admin') fail('forbidden', 403)
  return user
}

function requirePathId (parameters: PathParameters): string {
  const id = parameters[0]
  if (id === undefined) fail('not_found', 404)
  return id
}

function requireManagedUser (id: string) {
  const user = getManagedUserById(id)
  if (user === undefined) fail('not_found', 404)
  return user
}

export async function login (request: Request): Promise<Response> {
  const body = exactBody(await readAccessJson(request), ['username', 'password'])
  await bootstrapUsers()

  const user = await authenticateUser(body.username, body.password)
  if (user === undefined) fail('unauthorized', 401)

  const secret = createSession(user.id)
  return jsonResponse(200, user, { 'Set-Cookie': sessionCookie(secret) })
}

export async function logout (request: Request): Promise<Response> {
  try {
    deleteSession(readSessionCookie(request))
  } catch {
    return errorResponse('internal_error', 500, { 'Set-Cookie': expiredSessionCookie() })
  }
  return jsonResponse(200, { status: 'ok' }, { 'Set-Cookie': expiredSessionCookie() })
}

export async function account (request: Request): Promise<Response> {
  if (request.method === 'GET') return jsonResponse(200, requireSession(request))

  const user = requireSession(request)
  const body = exactBody(await readAccessJson(request), ['username'])
  return jsonResponse(200, updateUsername(user.id, body.username))
}

export async function password (request: Request): Promise<Response> {
  const user = requireSession(request)
  const body = exactBody(await readAccessJson(request), ['currentPassword', 'newPassword'])
  const authenticated = await authenticateUser(user.username, body.currentPassword)
  if (authenticated?.id !== user.id) fail('unauthorized', 401)

  await setPassword(user.id, body.newPassword)
  return jsonResponse(200, { status: 'ok' }, { 'Set-Cookie': expiredSessionCookie() })
}

export async function tokens (request: Request): Promise<Response> {
  const user = requireSession(request)
  if (request.method === 'GET') return jsonResponse(200, listApiTokens(user.id))

  const body = exactBody(await readAccessJson(request), ['name'])
  return jsonResponse(201, createApiToken(user.id, body.name))
}

export async function token (request: Request, parameters: PathParameters = []): Promise<Response> {
  const user = requireSession(request)
  const id = requirePathId(parameters)
  if (!revokeApiToken(id, user)) fail('not_found', 404)
  return jsonResponse(200, { status: 'ok' })
}

export async function users (request: Request): Promise<Response> {
  requireAdministrator(request)
  if (request.method === 'GET') return jsonResponse(200, listUsers())

  const body = exactBody(await readAccessJson(request), ['username', 'password'], ['role'])
  const user = await createUser(body as unknown as Parameters<typeof createUser>[0])
  return jsonResponse(201, user)
}

export async function user (request: Request, parameters: PathParameters = []): Promise<Response> {
  const actor = requireAdministrator(request)
  const id = requirePathId(parameters)
  requireManagedUser(id)

  if (request.method === 'PATCH') {
    const body = exactBody(await readAccessJson(request), [], ['username', 'role', 'active'])
    const updated = updateUser(id, body as unknown as Parameters<typeof updateUser>[1])
    const extraHeaders: Record<string, string> = actor.id === id && body.active === false ? { 'Set-Cookie': expiredSessionCookie() } : {}
    return jsonResponse(200, updated, extraHeaders)
  }

  deleteUser(id)
  const extraHeaders: Record<string, string> = actor.id === id ? { 'Set-Cookie': expiredSessionCookie() } : {}
  return jsonResponse(200, { status: 'ok' }, extraHeaders)
}

export async function userPassword (request: Request, parameters: PathParameters = []): Promise<Response> {
  const actor = requireAdministrator(request)
  const id = requirePathId(parameters)
  requireManagedUser(id)
  const body = exactBody(await readAccessJson(request), ['password'])

  await setPassword(id, body.password)
  const extraHeaders: Record<string, string> = actor.id === id ? { 'Set-Cookie': expiredSessionCookie() } : {}
  return jsonResponse(200, { status: 'ok' }, extraHeaders)
}

export async function userTokens (request: Request, parameters: PathParameters = []): Promise<Response> {
  const actor = requireSession(request)
  const id = requirePathId(parameters)
  const target = requireManagedUser(id)
  if (actor.role !== 'admin' && actor.id !== target.id) fail('forbidden', 403)

  return jsonResponse(200, listApiTokens(target.id))
}
