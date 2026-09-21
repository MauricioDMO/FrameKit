import type { StudioUser } from '@/types'

import { createSession, deleteSession, getSession } from '@/server/access/sessions'
import { fail } from './errors'

const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000
const sessionLifetimeSeconds = sessionLifetimeMs / 1000
const sessionCookieName = 'framekit_session'

export function readSessionCookie (request: Request): string | undefined {
  const header = request.headers.get('cookie')
  if (header === null) return undefined

  let value: string | undefined
  for (const part of header.split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1 || part.slice(0, separator).trim() !== sessionCookieName) continue
    if (value !== undefined) return undefined
    value = part.slice(separator + 1).trim()
  }
  return value
}

function cookieAttributes (expires: string, maxAge: number): string {
  return `HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}; Expires=${expires}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}

export function sessionCookie (secret: string): string {
  const expires = new Date(Date.now() + sessionLifetimeMs).toUTCString()
  return `${sessionCookieName}=${secret}; ${cookieAttributes(expires, sessionLifetimeSeconds)}`
}

export function expiredSessionCookie (): string {
  return `${sessionCookieName}=; ${cookieAttributes(new Date(0).toUTCString(), 0)}`
}

export function requireSession (request: Request): StudioUser {
  const user = getSession(readSessionCookie(request))
  if (user === undefined) fail('unauthorized', 401)
  return user
}

export { createSession, deleteSession }
