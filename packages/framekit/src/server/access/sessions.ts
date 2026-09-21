import { createHash, randomBytes } from 'node:crypto'

import type { StudioUser } from '@/types'
import { getDatabase } from './database'
import { toStudioUser } from '@/server/access/users/validation'

const sessionSecretBytes = 32
const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000
const sessionSecretPattern = /^[A-Za-z0-9_-]+$/

interface SessionOptions {
  now?: () => number
  env?: NodeJS.ProcessEnv
}

interface SessionUserRow {
  id?: unknown
  username?: unknown
  role?: unknown
}

function parseSessionSecret (value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length !== Math.ceil(sessionSecretBytes * 4 / 3) || !sessionSecretPattern.test(value)) return undefined

  let decoded: Buffer
  try {
    decoded = Buffer.from(value, 'base64url')
  } catch {
    return undefined
  }

  if (decoded.length !== sessionSecretBytes || decoded.toString('base64url') !== value) return undefined
  return value
}

export function isValidSessionSecret (value: unknown): value is string {
  return parseSessionSecret(value) !== undefined
}

function hashSessionSecret (secret: string): string {
  return createHash('sha256').update(secret, 'utf8').digest('hex')
}

function deleteExpiredSessions (now: number, env: NodeJS.ProcessEnv): void {
  getDatabase(env).prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now)
}

function currentTime (options: SessionOptions): number {
  return (options.now ?? Date.now)()
}

export function createSession (userId: string, options: SessionOptions = {}): string {
  const now = currentTime(options)
  const secret = randomBytes(sessionSecretBytes).toString('base64url')
  const database = getDatabase(options.env ?? process.env)
  database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now)
  database.prepare(`
    INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(hashSessionSecret(secret), userId, now, now + sessionLifetimeMs)
  return secret
}

export function getSession (value?: unknown, options: SessionOptions = {}): StudioUser | undefined {
  const now = currentTime(options)
  const env = options.env ?? process.env
  deleteExpiredSessions(now, env)
  const secret = parseSessionSecret(value)
  if (secret === undefined) return undefined

  const row = getDatabase(env).prepare(`
    SELECT users.id, users.username, users.role
    FROM sessions
    INNER JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ? AND users.active = 1
  `).get(hashSessionSecret(secret), now) as SessionUserRow | undefined
  return toStudioUser(row)
}

export function deleteSession (value?: unknown, options: SessionOptions = {}): void {
  const now = currentTime(options)
  const env = options.env ?? process.env
  deleteExpiredSessions(now, env)
  const secret = parseSessionSecret(value)
  if (secret === undefined) return

  getDatabase(env).prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashSessionSecret(secret))
}
