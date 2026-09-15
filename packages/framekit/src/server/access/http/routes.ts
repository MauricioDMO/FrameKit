import { authenticateUser, bootstrapUsers, setPassword, updateUsername } from '../users'
import { errorResponse, fail, jsonResponse } from './errors'
import { exactBody, readAccessJson } from './request'
import { deleteSession, expiredSessionCookie, requireSession, sessionCookie, createSession, readSessionCookie } from './session'

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
