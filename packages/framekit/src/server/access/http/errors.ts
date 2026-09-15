import { UserDomainError } from '../users/errors'

export type AccessErrorCode =
  | 'invalid_request'
  | 'request_too_large'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'method_not_allowed'
  | 'conflict'
  | 'service_unavailable'
  | 'internal_error'

const accessMessageByCode: Record<AccessErrorCode, string> = {
  invalid_request: 'Invalid request',
  request_too_large: 'Request body exceeds the size limit',
  unauthorized: 'Unauthorized',
  forbidden: 'Forbidden',
  not_found: 'Not found',
  method_not_allowed: 'Method not allowed',
  conflict: 'Conflict',
  service_unavailable: 'Service unavailable',
  internal_error: 'Internal server error'
}

export class AccessError extends Error {
  constructor (readonly code: AccessErrorCode, readonly status: number) {
    super(code)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'AccessError'
  }
}

export function fail (code: AccessErrorCode, status: number): never {
  throw new AccessError(code, status)
}

export function jsonResponse (status: number, body: unknown, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      ...extraHeaders
    }
  })
}

export function errorResponse (code: AccessErrorCode, status: number, extraHeaders?: Record<string, string>): Response {
  return jsonResponse(status, { error: code, message: accessMessageByCode[code] }, extraHeaders)
}

export function responseForError (error: unknown): Response {
  if (error instanceof AccessError) return errorResponse(error.code, error.status)

  if (error instanceof UserDomainError) {
    if (error.code === 'duplicate_username') return errorResponse('conflict', 409)
    if (error.code === 'last_active_administrator') return errorResponse('conflict', 409)
    if (error.code === 'bootstrap_configuration') return errorResponse('service_unavailable', 503)
    if (error.code === 'user_not_found') return errorResponse('unauthorized', 401)
    if (error.code === 'invalid_username' || error.code === 'invalid_password' || error.code === 'invalid_token_name' || error.code === 'invalid_update' || error.code === 'invalid_role' || error.code === 'invalid_active' || error.code === 'invalid_user_state') return errorResponse('invalid_request', 400)
  }

  return errorResponse('internal_error', 500)
}
