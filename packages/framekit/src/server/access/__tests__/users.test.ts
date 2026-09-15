import { createHash } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getDatabase, resetDatabaseForTests } from '@/server/access/database'
import { dummyPasswordHash, verifyPassword } from '@/server/access/passwords'
import {
  authenticateUser,
  bootstrapUsers,
  countActiveAdministrators,
  createUser,
  deleteUser,
  getManagedUserById,
  getUserById,
  isValidUsername,
  listUsers,
  setPassword,
  updateUser,
  updateUsername,
  UserDomainError
} from '@/server/access/users'

const password = 'correct horse battery staple'
const environmentKeys = ['FRAMEKIT_DATABASE_PATH', 'FRAMEKIT_ADMIN_USERNAME', 'FRAMEKIT_ADMIN_PASSWORD', 'FRAMEKIT_API_KEY'] as const

let originalEnvironment: Partial<Record<typeof environmentKeys[number], string>>
let temporaryRoot = ''

beforeEach(async () => {
  resetDatabaseForTests()
  originalEnvironment = {}
  for (const key of environmentKeys) {
    originalEnvironment[key] = process.env[key]
    delete process.env[key]
  }

  temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-users-'))
  process.env.FRAMEKIT_DATABASE_PATH = path.join(temporaryRoot, 'framekit.sqlite')
})

afterEach(async () => {
  resetDatabaseForTests()
  for (const key of environmentKeys) {
    const value = originalEnvironment[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  await rm(temporaryRoot, { recursive: true, force: true })
})

function userCount (): number {
  return getDatabase().prepare('SELECT COUNT(*) AS count FROM users').get()?.count as number
}

function tokenCount (): number {
  return getDatabase().prepare('SELECT COUNT(*) AS count FROM api_tokens').get()?.count as number
}

function expectDomainError (action: () => unknown, code: UserDomainError['code']): void {
  try {
    action()
    throw new Error(`Expected ${code}`)
  } catch (error) {
    expect(error).toBeInstanceOf(UserDomainError)
    expect((error as UserDomainError).code).toBe(code)
  }
}

describe('user boundary', () => {
  it('validates username shape and password limits before persistence', async () => {
    expect(isValidUsername('Abc_9.-')).toBe(true)
    expect(isValidUsername('ab')).toBe(false)
    expect(isValidUsername('a'.repeat(65))).toBe(false)
    expect(isValidUsername('a b')).toBe(false)
    expect(isValidUsername('abc\n')).toBe(false)
    expect(isValidUsername('ábc')).toBe(false)
    expect(isValidUsername('abc!')).toBe(false)

    await expect(createUser({ username: 'ab', password })).rejects.toMatchObject({ code: 'invalid_username' })
    await expect(createUser({ username: 'valid-user', password: 'short' })).rejects.toMatchObject({ code: 'invalid_password' })
    expect(userCount()).toBe(0)
  }, 30_000)
})

describe('user bootstrap', () => {
  it('fails closed without a valid administrator password', async () => {
    await expect(bootstrapUsers()).rejects.toMatchObject({ code: 'bootstrap_configuration' })
    expect(userCount()).toBe(0)
  })

  it('creates one administrator and imports only the legacy API-key hash', async () => {
    process.env.FRAMEKIT_ADMIN_PASSWORD = password
    process.env.FRAMEKIT_API_KEY = 'legacy-secret'

    const user = await bootstrapUsers()
    expect(user).toMatchObject({ username: 'admin', role: 'admin' })
    expect(Object.keys(user ?? {})).toEqual(['id', 'username', 'role'])
    expect(user?.id).toMatch(/^[0-9a-f-]{36}$/)

    const database = getDatabase()
    const storedUser = database.prepare('SELECT username, password_hash, role, active, created_at, updated_at FROM users').get()
    expect(storedUser).toMatchObject({ username: 'admin', role: 'admin', active: 1 })
    expect(storedUser?.password_hash).not.toBe(password)
    expect(Number.isInteger(storedUser?.created_at)).toBe(true)
    expect(Number.isInteger(storedUser?.updated_at)).toBe(true)

    const storedToken = database.prepare('SELECT id, user_id, name, token_prefix, token_hash, created_at FROM api_tokens').get()
    expect(storedToken).toEqual({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      user_id: user?.id,
      name: 'Legacy FRAMEKIT_API_KEY',
      token_prefix: 'legacy',
      token_hash: createHash('sha256').update('legacy-secret', 'utf8').digest('hex'),
      created_at: storedUser?.created_at
    })
    expect(storedToken?.token_hash).not.toContain('legacy-secret')
    expect(getUserById(user?.id)).toEqual(user)
    expect(countActiveAdministrators()).toBe(1)
  }, 30_000)

  it('is idempotent and ignores changed bootstrap environment after first boot', async () => {
    process.env.FRAMEKIT_ADMIN_USERNAME = 'FirstAdmin'
    process.env.FRAMEKIT_ADMIN_PASSWORD = password
    process.env.FRAMEKIT_API_KEY = 'first-secret'
    const firstUser = await bootstrapUsers()
    if (!firstUser) throw new Error('Expected bootstrap user')

    updateUsername(firstUser.id, 'RenamedAdmin')
    process.env.FRAMEKIT_ADMIN_USERNAME = 'not valid'
    process.env.FRAMEKIT_ADMIN_PASSWORD = 'short'
    process.env.FRAMEKIT_API_KEY = 'second-secret'

    expect(await bootstrapUsers()).toBeUndefined()
    expect(getUserById(firstUser.id)).toEqual({ id: firstUser.id, username: 'RenamedAdmin', role: 'admin' })
    expect(userCount()).toBe(1)
    expect(tokenCount()).toBe(1)
    expect(getDatabase().prepare('SELECT token_hash FROM api_tokens').get()?.token_hash).toBe(createHash('sha256').update('first-secret', 'utf8').digest('hex'))

    resetDatabaseForTests()
    expect(await bootstrapUsers()).toBeUndefined()
    expect(getUserById(firstUser.id)).toEqual({ id: firstUser.id, username: 'RenamedAdmin', role: 'admin' })
  }, 30_000)

  it('rolls back the administrator when legacy-token insertion fails', async () => {
    getDatabase().exec(`
      CREATE TRIGGER fail_legacy_token
      BEFORE INSERT ON api_tokens
      WHEN NEW.name = 'Legacy FRAMEKIT_API_KEY'
      BEGIN
        SELECT RAISE(ABORT, 'legacy token insert failed');
      END
    `)
    process.env.FRAMEKIT_ADMIN_PASSWORD = password
    process.env.FRAMEKIT_API_KEY = 'legacy-secret'

    await expect(bootstrapUsers()).rejects.toThrow('legacy token insert failed')
    expect(userCount()).toBe(0)
    expect(tokenCount()).toBe(0)
  }, 30_000)
})

describe('user authentication and password changes', () => {
  it('uses the fixed dummy hash for unknown, inactive, and invalid authentication inputs', async () => {
    const user = await createUser({ username: 'Alice', password })
    const calls: Array<[string, string]> = []
    const verifier = async (candidate: string, storedHash: string): Promise<boolean> => {
      calls.push([candidate, storedHash])
      return verifyPassword(candidate, storedHash)
    }

    await authenticateUser('Missing', password, { verifyPassword: verifier })
    updateUser(user.id, { active: false })
    await authenticateUser('Alice', password, { verifyPassword: verifier })
    await authenticateUser('bad!', password, { verifyPassword: verifier })
    await authenticateUser('Alice', 'short', { verifyPassword: verifier })

    expect(calls).toHaveLength(4)
    expect(calls.map(([, storedHash]) => storedHash)).toEqual([
      dummyPasswordHash,
      dummyPasswordHash,
      dummyPasswordHash,
      dummyPasswordHash
    ])
    expect(calls[0][0]).toBe(password)
    expect(calls[1][0]).toBe(password)
    expect(calls[2][0]).toBe(password)
    expect(calls[3][0]).toBe('x'.repeat(12))
  }, 30_000)

  it('returns one generic invalid result for wrong, unknown, inactive, and invalid logins', async () => {
    const user = await createUser({ username: 'Alice', password })
    const wrong = await authenticateUser('Alice', 'wrong password')
    const unknown = await authenticateUser('Missing', password)
    const invalidUsername = await authenticateUser('no spaces', password)
    const invalidPassword = await authenticateUser('Alice', 'short')

    expect(await authenticateUser('alice', password)).toEqual(user)
    expect(wrong).toBeUndefined()
    expect(unknown).toBeUndefined()
    expect(invalidUsername).toBeUndefined()
    expect(invalidPassword).toBeUndefined()

    getDatabase().prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run('inactive-session', user.id, 1, 2)
    updateUser(user.id, { active: false })
    expect(await authenticateUser('Alice', password)).toBeUndefined()
    expect(getDatabase().prepare('SELECT COUNT(*) AS count FROM sessions').get()?.count).toBe(0)
  }, 30_000)

  it('invalidates sessions on password changes while preserving API tokens', async () => {
    const user = await createUser({ username: 'password-owner', password })
    const database = getDatabase()
    database.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run('session-one', user.id, 1, 2)
    database.prepare('INSERT INTO api_tokens (id, user_id, name, token_prefix, token_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)').run('token-one', user.id, 'Token', 'fk_test', 'token-hash-one', 1)

    await setPassword(user.id, 'changed password')
    expect(database.prepare('SELECT COUNT(*) AS count FROM sessions').get()?.count).toBe(0)
    expect(database.prepare('SELECT COUNT(*) AS count FROM api_tokens').get()?.count).toBe(1)
    expect(await authenticateUser(user.username, password)).toBeUndefined()
    expect(await authenticateUser(user.username, 'changed password')).toEqual(user)
  }, 30_000)
})

describe('user mutations', () => {
  it('returns safe DTOs, preserves case, and rejects duplicate or missing users', async () => {
    const first = await createUser({ username: 'FirstUser', password })
    const second = await createUser({ username: 'SecondUser', password })

    const renamed = updateUsername(first.id, 'Renamed.User')
    expect(renamed).toEqual({ id: first.id, username: 'Renamed.User', role: 'user' })
    expect(Object.keys(renamed)).toEqual(['id', 'username', 'role'])
    expect(updateUser(first.id, { active: false })).toEqual(renamed)
    expect(updateUser(first.id, { role: 'admin', active: true })).toEqual({ ...renamed, role: 'admin' })

    expectDomainError(() => updateUsername(first.id, 'seconduser'), 'duplicate_username')
    await expect(createUser({ username: 'renamed.user', password })).rejects.toMatchObject({ code: 'duplicate_username' })
    expect(getUserById('missing-user')).toBeUndefined()
    expectDomainError(() => updateUsername('missing-user', 'new-user'), 'user_not_found')
    expectDomainError(() => deleteUser('missing-user'), 'user_not_found')

    const database = getDatabase()
    database.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run('owned-session', second.id, 1, 2)
    database.prepare('INSERT INTO api_tokens (id, user_id, name, token_prefix, token_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)').run('owned-token', second.id, 'Token', 'fk_test', 'owned-token-hash', 1)
    deleteUser(second.id)
    expect(database.prepare('SELECT COUNT(*) AS count FROM sessions WHERE user_id = ?').get(second.id)?.count).toBe(0)
    expect(database.prepare('SELECT COUNT(*) AS count FROM api_tokens WHERE user_id = ?').get(second.id)?.count).toBe(0)
  }, 30_000)

  it('returns safe managed-user projections with active state and timestamps', async () => {
    const first = await createUser({ username: 'FirstUser', password })
    const second = await createUser({ username: 'SecondUser', password, role: 'admin' })
    updateUser(first.id, { active: false })

    expect(getManagedUserById(first.id)).toEqual({
      id: first.id,
      username: first.username,
      role: first.role,
      active: false,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number)
    })
    expect(listUsers()).toEqual(expect.arrayContaining([
      {
        id: first.id,
        username: first.username,
        role: first.role,
        active: false,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number)
      },
      {
        id: second.id,
        username: second.username,
        role: second.role,
        active: true,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number)
      }
    ]))
    expect(Object.keys(listUsers()[0])).toEqual(['id', 'username', 'role', 'active', 'createdAt', 'updatedAt'])
    expect(listUsers().every((user) => !('passwordHash' in user))).toBe(true)
    expect(getManagedUserById('missing-user')).toBeUndefined()
  }, 30_000)
})

describe('active administrator invariant', () => {
  async function bootstrapAdministrator (): Promise<NonNullable<Awaited<ReturnType<typeof bootstrapUsers>>>> {
    process.env.FRAMEKIT_ADMIN_PASSWORD = password
    const user = await bootstrapUsers()
    if (!user) throw new Error('Expected bootstrap user')
    return user
  }

  it('rejects deletion, deactivation, and demotion of the last active administrator', async () => {
    const admin = await bootstrapAdministrator()

    expectDomainError(() => deleteUser(admin.id), 'last_active_administrator')
    expectDomainError(() => updateUser(admin.id, { active: false }), 'last_active_administrator')
    expectDomainError(() => updateUser(admin.id, { role: 'user' }), 'last_active_administrator')
    expect(countActiveAdministrators()).toBe(1)
    expect(getUserById(admin.id)).toEqual(admin)
  }, 30_000)

  it('allows an administrator mutation while another active administrator remains', async () => {
    const first = await bootstrapAdministrator()
    const second = await createUser({ username: 'second-admin', password, role: 'admin' })

    deleteUser(first.id)
    expect(getUserById(first.id)).toBeUndefined()
    expect(getUserById(second.id)).toEqual(second)
    expect(countActiveAdministrators()).toBe(1)
  }, 30_000)
})
