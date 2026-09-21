import { createApiToken, listApiTokens, revokeApiToken } from '@/server/access/api-tokens'
import { authenticateUser, bootstrapUsers, createUser, deleteUser, getManagedUserById, listUsers, setPassword, updateUser, updateUsername } from '@/server/access/users'
import { errorResponse, fail, jsonResponse } from './errors'
import { exactBody, readAccessJson } from './request'
import { deleteSession, expiredSessionCookie, requireSession, sessionCookie, createSession, readSessionCookie } from './session'

type PathParameters = readonly string[]
type Environment = NodeJS.ProcessEnv

function requireAdministrator (request: Request, env: Environment) {
  const user = requireSession(request, env)
  if (user.role !== 'admin') fail('forbidden', 403)
  return user
}

function requirePathId (parameters: PathParameters): string {
  const id = parameters[0]
  if (id === undefined) fail('not_found', 404)
  return id
}

function requireManagedUser (id: string, env: Environment) {
  const user = getManagedUserById(id, env)
  if (user === undefined) fail('not_found', 404)
  return user
}

export async function login (request: Request, env: Environment = process.env): Promise<Response> {
  const body = exactBody(await readAccessJson(request), ['username', 'password'])
  await bootstrapUsers(env)

  const user = await authenticateUser(body.username, body.password, { env })
  if (user === undefined) fail('unauthorized', 401)

  const secret = createSession(user.id, { env })
  return jsonResponse(200, user, { 'Set-Cookie': sessionCookie(secret, env) })
}

export async function logout (request: Request, env: Environment = process.env): Promise<Response> {
  try {
    deleteSession(readSessionCookie(request), { env })
  } catch {
    return errorResponse('internal_error', 500, { 'Set-Cookie': expiredSessionCookie(env) })
  }
  return jsonResponse(200, { status: 'ok' }, { 'Set-Cookie': expiredSessionCookie(env) })
}

export async function account (request: Request, env: Environment = process.env): Promise<Response> {
  if (request.method === 'GET') return jsonResponse(200, requireSession(request, env))

  const user = requireSession(request, env)
  const body = exactBody(await readAccessJson(request), ['username'])
  return jsonResponse(200, updateUsername(user.id, body.username, env))
}

export async function password (request: Request, env: Environment = process.env): Promise<Response> {
  const user = requireSession(request, env)
  const body = exactBody(await readAccessJson(request), ['currentPassword', 'newPassword'])
  const authenticated = await authenticateUser(user.username, body.currentPassword, { env })
  if (authenticated?.id !== user.id) fail('unauthorized', 401)

  await setPassword(user.id, body.newPassword, env)
  return jsonResponse(200, { status: 'ok' }, { 'Set-Cookie': expiredSessionCookie(env) })
}

export async function tokens (request: Request, env: Environment = process.env): Promise<Response> {
  const user = requireSession(request, env)
  if (request.method === 'GET') return jsonResponse(200, listApiTokens(user.id, env))

  const body = exactBody(await readAccessJson(request), ['name'])
  return jsonResponse(201, createApiToken(user.id, body.name, env))
}

export async function token (request: Request, env: Environment = process.env, parameters: PathParameters = []): Promise<Response> {
  const user = requireSession(request, env)
  const id = requirePathId(parameters)
  if (!revokeApiToken(id, user, env)) fail('not_found', 404)
  return jsonResponse(200, { status: 'ok' })
}

export async function users (request: Request, env: Environment = process.env): Promise<Response> {
  requireAdministrator(request, env)
  if (request.method === 'GET') return jsonResponse(200, listUsers(env))

  const body = exactBody(await readAccessJson(request), ['username', 'password'], ['role'])
  const user = await createUser(body as unknown as Parameters<typeof createUser>[0], env)
  return jsonResponse(201, user)
}

export async function user (request: Request, env: Environment = process.env, parameters: PathParameters = []): Promise<Response> {
  const actor = requireAdministrator(request, env)
  const id = requirePathId(parameters)
  requireManagedUser(id, env)

  if (request.method === 'PATCH') {
    const body = exactBody(await readAccessJson(request), [], ['username', 'role', 'active'])
    const updated = updateUser(id, body as unknown as Parameters<typeof updateUser>[1], env)
    const extraHeaders: Record<string, string> = actor.id === id && body.active === false ? { 'Set-Cookie': expiredSessionCookie(env) } : {}
    return jsonResponse(200, updated, extraHeaders)
  }

  deleteUser(id, env)
  const extraHeaders: Record<string, string> = actor.id === id ? { 'Set-Cookie': expiredSessionCookie(env) } : {}
  return jsonResponse(200, { status: 'ok' }, extraHeaders)
}

export async function userPassword (request: Request, env: Environment = process.env, parameters: PathParameters = []): Promise<Response> {
  const actor = requireAdministrator(request, env)
  const id = requirePathId(parameters)
  requireManagedUser(id, env)
  const body = exactBody(await readAccessJson(request), ['password'])

  await setPassword(id, body.password, env)
  const extraHeaders: Record<string, string> = actor.id === id ? { 'Set-Cookie': expiredSessionCookie(env) } : {}
  return jsonResponse(200, { status: 'ok' }, extraHeaders)
}

export async function userTokens (request: Request, env: Environment = process.env, parameters: PathParameters = []): Promise<Response> {
  const actor = requireSession(request, env)
  const id = requirePathId(parameters)
  const target = requireManagedUser(id, env)
  if (actor.role !== 'admin' && actor.id !== target.id) fail('forbidden', 403)

  return jsonResponse(200, listApiTokens(target.id, env))
}
