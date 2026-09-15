import type { IncomingMessage, ServerResponse } from 'node:http'

import { getSession, isValidSessionSecret } from '../../../server/access/sessions'
import { sendJson } from '../asset-upload/errors'

const sessionCookieName = 'framekit_session'

function readSessionCookie (request: IncomingMessage): string | undefined {
  const header = request.headers.cookie
  if (typeof header !== 'string') return undefined

  let value: string | undefined
  for (const part of header.split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1) {
      if (part.trim() === sessionCookieName) return undefined
      continue
    }
    if (part.slice(0, separator).trim() !== sessionCookieName) continue
    if (value !== undefined) return undefined
    value = part.slice(separator + 1).trim()
  }
  return value
}

function firstForwardedValue (value: string | string[] | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const first = value.split(',')[0].trim()
  return first === '' ? undefined : first
}

function requestOrigin (request: IncomingMessage): string | undefined {
  const forwardedProtocol = request.headers['x-forwarded-proto']
  const protocol = forwardedProtocol === undefined ? 'http' : firstForwardedValue(forwardedProtocol)
  if (protocol === undefined) return undefined

  const normalizedProtocol = protocol.toLowerCase()
  if (normalizedProtocol !== 'http' && normalizedProtocol !== 'https') return undefined

  const forwardedHost = request.headers['x-forwarded-host']
  const rawHost = forwardedHost === undefined ? request.headers.host : firstForwardedValue(forwardedHost)
  if (typeof rawHost !== 'string') return undefined

  const host = rawHost.trim()
  if (host === '' || /[\s\\/?#@,]/.test(host)) return undefined

  try {
    const parsed = new URL(`${normalizedProtocol}://${host}`)
    if (parsed.host === '' || parsed.username !== '' || parsed.password !== '' || parsed.pathname !== '/' || parsed.search !== '' || parsed.hash !== '') return undefined
    return parsed.origin
  } catch {
    return undefined
  }
}

function isSameOrigin (request: IncomingMessage): boolean {
  const origin = request.headers.origin
  if (typeof origin !== 'string' || origin === 'null') return false

  const expectedOrigin = requestOrigin(request)
  if (expectedOrigin === undefined) return false

  return origin === expectedOrigin
}

export function authorizeAssetRequest (request: IncomingMessage, response: ServerResponse): boolean {
  const secret = readSessionCookie(request)
  if (!isValidSessionSecret(secret)) {
    sendJson(response, 401, { error: 'Unauthorized' })
    return false
  }

  if (!isSameOrigin(request)) {
    sendJson(response, 403, { error: 'Forbidden' })
    return false
  }

  try {
    if (getSession(secret) === undefined) {
      sendJson(response, 401, { error: 'Unauthorized' })
      return false
    }
  } catch {
    sendJson(response, 401, { error: 'Unauthorized' })
    return false
  }

  return true
}
