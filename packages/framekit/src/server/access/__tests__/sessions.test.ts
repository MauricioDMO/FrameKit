import { createHash } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getDatabase, resetDatabaseForTests } from '@/server/access/database'
import { createSession, deleteSession, getSession } from '@/server/access/sessions'

const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000

let originalDatabasePath: string | undefined
let temporaryRoot = ''

beforeEach(async () => {
  resetDatabaseForTests()
  originalDatabasePath = process.env.FRAMEKIT_DATABASE_PATH
  temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-sessions-'))
  process.env.FRAMEKIT_DATABASE_PATH = path.join(temporaryRoot, 'framekit.sqlite')
})

afterEach(async () => {
  resetDatabaseForTests()
  if (originalDatabasePath === undefined) delete process.env.FRAMEKIT_DATABASE_PATH
  else process.env.FRAMEKIT_DATABASE_PATH = originalDatabasePath
  await rm(temporaryRoot, { recursive: true, force: true })
})

function insertUser (id: string, username: string, active = true): { id: string, username: string, role: 'user' } {
  const user = { id, username, role: 'user' as const }
  getDatabase().prepare(`
    INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(user.id, user.username, 'test-hash', user.role, active ? 1 : 0, 1, 1)
  return user
}

function sessionCount (): number {
  return getDatabase().prepare('SELECT COUNT(*) AS count FROM sessions').get()?.count as number
}

describe('session boundary', () => {
  it('creates, resolves, keeps a fixed expiry, and deletes sessions', () => {
    const user = insertUser('user-1', 'Alice')
    const now = 1_700_000_000_000
    const secret = createSession(user.id, { now: () => now })
    const row = getDatabase().prepare('SELECT user_id, created_at, expires_at FROM sessions').get()

    expect(secret).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(getSession(secret, { now: () => now + 1_000 })).toEqual(user)
    expect(row).toEqual({ user_id: user.id, created_at: now, expires_at: now + sessionLifetimeMs })
    expect(getSession(secret, { now: () => now + sessionLifetimeMs - 1 })).toEqual(user)
    expect(getDatabase().prepare('SELECT expires_at FROM sessions').get()?.expires_at).toBe(now + sessionLifetimeMs)
    expect(getSession(secret, { now: () => now + sessionLifetimeMs })).toBeUndefined()
    expect(sessionCount()).toBe(0)

    expect(() => deleteSession(secret, { now: () => now + sessionLifetimeMs })).not.toThrow()
    expect(sessionCount()).toBe(0)
  })

  it('stores only the SHA-256 session hash', () => {
    const user = insertUser('user-1', 'Alice')
    const secret = createSession(user.id, { now: () => 1_000 })
    const storedHash = getDatabase().prepare('SELECT token_hash FROM sessions').get()?.token_hash

    expect(storedHash).toBe(createHash('sha256').update(secret, 'utf8').digest('hex'))
    expect(storedHash).toMatch(/^[a-f0-9]{64}$/)
    expect(storedHash).not.toBe(secret)
    expect(storedHash).not.toContain(secret)
  })

  it('cleans expired sessions during create, lookup, and delete operations', () => {
    const user = insertUser('user-1', 'Alice')
    const now = 1_000
    createSession(user.id, { now: () => now })
    const currentSecret = createSession(user.id, { now: () => now + sessionLifetimeMs })

    expect(sessionCount()).toBe(1)

    getDatabase().prepare(`
      INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run('expired-on-lookup', user.id, now, now)
    expect(getSession(currentSecret, { now: () => now + sessionLifetimeMs })).toEqual(user)
    expect(sessionCount()).toBe(1)

    getDatabase().prepare(`
      INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run('expired-on-delete', user.id, now, now)
    deleteSession(undefined, { now: () => now + sessionLifetimeMs })
    expect(sessionCount()).toBe(1)
  })

  it('rejects sessions for inactive and deleted users', () => {
    const inactive = insertUser('inactive-user', 'Inactive')
    const inactiveSecret = createSession(inactive.id, { now: () => 1_000 })
    getDatabase().prepare('UPDATE users SET active = 0 WHERE id = ?').run(inactive.id)
    expect(getSession(inactiveSecret, { now: () => 1_001 })).toBeUndefined()

    const deleted = insertUser('deleted-user', 'Deleted')
    const deletedSecret = createSession(deleted.id, { now: () => 1_000 })
    getDatabase().prepare('DELETE FROM users WHERE id = ?').run(deleted.id)
    expect(getSession(deletedSecret, { now: () => 1_001 })).toBeUndefined()
  })

  it('safely ignores missing and malformed secrets during deletion', () => {
    const user = insertUser('user-1', 'Alice')
    const options = { now: () => 1_000 }
    const secret = createSession(user.id, options)

    expect(() => deleteSession(undefined, options)).not.toThrow()
    expect(() => deleteSession(null, options)).not.toThrow()
    expect(() => deleteSession('malformed', options)).not.toThrow()
    expect(getSession(secret, options)).toEqual(user)

    deleteSession(secret, options)
    expect(getSession(secret, options)).toBeUndefined()
    expect(() => deleteSession(secret, options)).not.toThrow()
    expect(() => deleteSession('', options)).not.toThrow()
    expect(getSession()).toBeUndefined()
    expect(() => deleteSession()).not.toThrow()
  })

  it('creates independent secrets for separate sessions', () => {
    const user = insertUser('user-1', 'Alice')
    const now = 1_000
    const first = createSession(user.id, { now: () => now })
    const second = createSession(user.id, { now: () => now })

    expect(first).not.toBe(second)
    expect(getSession(first, { now: () => now })).toEqual(user)
    expect(getSession(second, { now: () => now })).toEqual(user)

    deleteSession(first, { now: () => now })
    expect(getSession(first, { now: () => now })).toBeUndefined()
    expect(getSession(second, { now: () => now })).toEqual(user)
    expect(sessionCount()).toBe(1)
  })
})
