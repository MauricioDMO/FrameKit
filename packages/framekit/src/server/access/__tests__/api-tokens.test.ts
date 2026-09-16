import { mkdtemp, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { StudioUser } from '@/studio/types'
import { getDatabase, resetDatabaseForTests } from '@/server/access/database'
import {
  authenticateApiToken,
  createApiToken,
  listApiTokens,
  revokeApiToken
} from '@/server/access/api-tokens'
import { updateUser } from '@/server/access/users'
import { UserDomainError } from '@/server/access/users/errors'

let originalDatabasePath: string | undefined
let temporaryRoot = ''

beforeEach(async () => {
  resetDatabaseForTests()
  originalDatabasePath = process.env.FRAMEKIT_DATABASE_PATH
  temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-api-tokens-'))
  process.env.FRAMEKIT_DATABASE_PATH = path.join(temporaryRoot, 'framekit.sqlite')
})

afterEach(async () => {
  resetDatabaseForTests()
  if (originalDatabasePath === undefined) delete process.env.FRAMEKIT_DATABASE_PATH
  else process.env.FRAMEKIT_DATABASE_PATH = originalDatabasePath
  await rm(temporaryRoot, { recursive: true, force: true })
})

function insertUser (
  id: string,
  username: string,
  role: StudioUser['role'] = 'user',
  active = true
): StudioUser {
  const user = { id, username, role }
  getDatabase().prepare(`
    INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, username, 'test-hash', role, active ? 1 : 0, 1, 1)
  return user
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

describe('API-token boundary', () => {
  it('generates independent secrets and stores only a hash with safe metadata', () => {
    const owner = insertUser('owner', 'Owner')
    const first = createApiToken(owner.id, '  First token  ')
    const second = createApiToken(owner.id, 'Second token')

    expect(first.token).toMatch(/^fk_[A-Za-z0-9_-]{43}$/)
    expect(second.token).toMatch(/^fk_[A-Za-z0-9_-]{43}$/)
    expect(first.token).not.toBe(second.token)
    expect(first.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(first.tokenPrefix).toMatch(/^fk_[A-Za-z0-9_-]+$/)
    expect(first.tokenPrefix.length).toBeLessThan(first.token.length)
    expect(first.name).toBe('First token')

    const stored = getDatabase().prepare('SELECT id, user_id, name, token_prefix, token_hash, created_at, last_used_at, revoked_at FROM api_tokens WHERE id = ?').get(first.id)
    expect(stored).toEqual({
      id: first.id,
      user_id: owner.id,
      name: 'First token',
      token_prefix: first.tokenPrefix,
      token_hash: createHash('sha256').update(first.token, 'utf8').digest('hex'),
      created_at: first.createdAt,
      last_used_at: null,
      revoked_at: null
    })
    expect(stored?.token_hash).not.toBe(first.token)
    expect(stored?.token_hash).not.toContain(first.token)

    const listed = listApiTokens(owner.id)
    expect(listed).toHaveLength(2)
    expect(listed).toEqual(expect.arrayContaining([
      {
        id: first.id,
        name: 'First token',
        tokenPrefix: first.tokenPrefix,
        createdAt: first.createdAt,
        lastUsedAt: null,
        revokedAt: null
      },
      {
        id: second.id,
        name: 'Second token',
        tokenPrefix: second.tokenPrefix,
        createdAt: second.createdAt,
        lastUsedAt: null,
        revokedAt: null
      }
    ]))
    expect(listed[0]).not.toHaveProperty('token')
  })

  it('trims token names and rejects empty or overlong names before insertion', () => {
    const owner = insertUser('owner', 'Owner')

    expectDomainError(() => createApiToken(owner.id, ''), 'invalid_token_name')
    expectDomainError(() => createApiToken(owner.id, '   '), 'invalid_token_name')
    expectDomainError(() => createApiToken(owner.id, 'x'.repeat(81)), 'invalid_token_name')
    expectDomainError(() => createApiToken(owner.id, undefined), 'invalid_token_name')
    expect(listApiTokens(owner.id)).toEqual([])

    expect(createApiToken(owner.id, `${'x'.repeat(79)} `).name).toBe('x'.repeat(79))
    expect(listApiTokens(owner.id)).toHaveLength(1)
  })

  it('lists by owner and lets only the owner or an administrator revoke', () => {
    const owner = insertUser('owner', 'Owner')
    const other = insertUser('other', 'Other')
    const administrator = insertUser('administrator', 'Administrator', 'admin')
    const ownerToken = createApiToken(owner.id, 'Owner token')
    const otherToken = createApiToken(other.id, 'Other token')

    expect(listApiTokens(owner.id)).toEqual([expect.objectContaining({ id: ownerToken.id, name: 'Owner token' })])
    expect(listApiTokens(other.id)).toEqual([expect.objectContaining({ id: otherToken.id, name: 'Other token' })])
    expect(revokeApiToken(otherToken.id, owner)).toBe(false)
    expect(getDatabase().prepare('SELECT revoked_at FROM api_tokens WHERE id = ?').get(otherToken.id)?.revoked_at).toBeNull()

    expect(revokeApiToken(ownerToken.id, owner)).toBe(true)
    expect(revokeApiToken(ownerToken.id, owner)).toBe(false)
    expect(revokeApiToken(otherToken.id, administrator)).toBe(true)

    const revoked = listApiTokens(other.id)[0]
    expect(revoked).toMatchObject({
      id: otherToken.id,
      name: 'Other token',
      tokenPrefix: otherToken.tokenPrefix,
      createdAt: otherToken.createdAt,
      lastUsedAt: null,
      revokedAt: expect.any(Number)
    })
    expect(revoked).not.toHaveProperty('token')
  })

  it('authenticates generated credentials, updates last use, and respects revocation and owner activity', () => {
    const owner = insertUser('owner', 'Owner')
    const generated = createApiToken(owner.id, 'Generated token')
    const beforeLookup = Date.now()

    expect(authenticateApiToken('')).toBeUndefined()
    expect(authenticateApiToken('missing-secret')).toBeUndefined()
    expect(authenticateApiToken('x'.repeat(257))).toBeUndefined()
    expect(authenticateApiToken(generated.token)).toEqual(owner)

    const lastUsedAt = getDatabase().prepare('SELECT last_used_at FROM api_tokens WHERE id = ?').get(generated.id)?.last_used_at
    expect(lastUsedAt).toBeGreaterThanOrEqual(beforeLookup)
    expect(authenticateApiToken(generated.token)).toEqual(owner)

    expect(revokeApiToken(generated.id, owner)).toBe(true)
    expect(authenticateApiToken(generated.token)).toBeUndefined()

    const reactivating = createApiToken(owner.id, 'Reactivating token')
    updateUser(owner.id, { active: false })
    expect(authenticateApiToken(reactivating.token)).toBeUndefined()

    updateUser(owner.id, { active: true })
    expect(authenticateApiToken(reactivating.token)).toEqual(owner)
    expect(revokeApiToken(reactivating.id, owner)).toBe(true)
    expect(authenticateApiToken(reactivating.token)).toBeUndefined()
  })
})
