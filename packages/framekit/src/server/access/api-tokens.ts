import { createHash, randomBytes, randomUUID } from 'node:crypto'

import type { StudioUser } from '../../studio/types'

import { getDatabase } from './database'
import { UserDomainError, userNotFoundError } from './users/errors'
import { isRecord, isUserRole, requireUserId, toStudioUser } from './users/validation'
import { readUserState, withImmediateTransaction } from './users/repository'

const tokenSecretBytes = 32
const generatedTokenPrefix = 'fk_'
const visiblePrefixLength = 11
const maximumCredentialBytes = 256

export interface ApiTokenMetadata {
  id: string
  name: string
  tokenPrefix: string
  createdAt: number
  lastUsedAt: number | null
  revokedAt: number | null
}

export interface CreatedApiToken extends ApiTokenMetadata {
  token: string
}

interface ApiTokenRow {
  id?: unknown
  name?: unknown
  token_prefix?: unknown
  created_at?: unknown
  last_used_at?: unknown
  revoked_at?: unknown
}

interface ApiTokenAuthenticationRow {
  token_id?: unknown
  id?: unknown
  username?: unknown
  role?: unknown
  active?: unknown
}

function hashToken (token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

function requireTokenName (value: unknown): string {
  if (typeof value !== 'string') throw new UserDomainError('invalid_token_name', 'Token name must be 1-80 characters')

  const name = value.trim()
  if (name.length < 1 || name.length > 80) throw new UserDomainError('invalid_token_name', 'Token name must be 1-80 characters')
  return name
}

function toOptionalTimestamp (value: unknown): number | null | undefined {
  if (value === null) return null
  if (typeof value === 'number' && Number.isSafeInteger(value)) return value
  return undefined
}

function toApiTokenMetadata (value: unknown): ApiTokenMetadata | undefined {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.token_prefix !== 'string') return undefined
  if (typeof value.created_at !== 'number' || !Number.isSafeInteger(value.created_at)) return undefined

  const lastUsedAt = toOptionalTimestamp(value.last_used_at)
  const revokedAt = toOptionalTimestamp(value.revoked_at)
  if (lastUsedAt === undefined || revokedAt === undefined) return undefined

  return {
    id: value.id,
    name: value.name,
    tokenPrefix: value.token_prefix,
    createdAt: value.created_at,
    lastUsedAt,
    revokedAt
  }
}

function isCredential (value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Buffer.byteLength(value, 'utf8') <= maximumCredentialBytes
}

function isRevocationActor (value: unknown): value is Pick<StudioUser, 'id' | 'role'> {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0 && isUserRole(value.role)
}

export function createApiToken (userId: unknown, name: unknown): CreatedApiToken {
  const ownerId = requireUserId(userId)
  const tokenName = requireTokenName(name)
  const token = `${generatedTokenPrefix}${randomBytes(tokenSecretBytes).toString('base64url')}`
  const tokenId = randomUUID()
  const now = Date.now()
  const database = getDatabase()

  const metadata = withImmediateTransaction(database, () => {
    if (readUserState(database, ownerId) === undefined) throw userNotFoundError()

    database.prepare(`
      INSERT INTO api_tokens (id, user_id, name, token_prefix, token_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tokenId, ownerId, tokenName, token.slice(0, visiblePrefixLength), hashToken(token), now)

    return {
      id: tokenId,
      name: tokenName,
      tokenPrefix: token.slice(0, visiblePrefixLength),
      createdAt: now,
      lastUsedAt: null,
      revokedAt: null
    }
  })

  return { ...metadata, token }
}

export function listApiTokens (userId: unknown): ApiTokenMetadata[] {
  const ownerId = requireUserId(userId)
  const rows = getDatabase().prepare(`
    SELECT id, name, token_prefix, created_at, last_used_at, revoked_at
    FROM api_tokens
    WHERE user_id = ?
    ORDER BY created_at ASC, id ASC
  `).all(ownerId) as ApiTokenRow[]

  return rows
    .map(toApiTokenMetadata)
    .filter((token): token is ApiTokenMetadata => token !== undefined)
}

export function authenticateApiToken (credential: unknown): StudioUser | undefined {
  if (!isCredential(credential)) return undefined

  const database = getDatabase()
  const row = database.prepare(`
    SELECT api_tokens.id AS token_id, users.id, users.username, users.role, users.active
    FROM api_tokens
    INNER JOIN users ON users.id = api_tokens.user_id
    WHERE api_tokens.token_hash = ?
      AND api_tokens.revoked_at IS NULL
      AND users.active = 1
  `).get(hashToken(credential)) as ApiTokenAuthenticationRow | undefined
  const user = toStudioUser(row)
  if (row === undefined || user === undefined || row.active !== 1 || typeof row.token_id !== 'string') return undefined

  database.prepare(`
    UPDATE api_tokens
    SET last_used_at = ?
    WHERE id = ? AND revoked_at IS NULL
  `).run(Date.now(), row.token_id)
  return user
}

export function revokeApiToken (tokenId: unknown, actor: unknown): boolean {
  if (typeof tokenId !== 'string' || tokenId.length === 0 || !isRevocationActor(actor)) return false

  const database = getDatabase()
  const statement = actor.role === 'admin'
    ? database.prepare('UPDATE api_tokens SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL')
    : database.prepare('UPDATE api_tokens SET revoked_at = ? WHERE id = ? AND user_id = ? AND revoked_at IS NULL')
  const result = actor.role === 'admin'
    ? statement.run(Date.now(), tokenId)
    : statement.run(Date.now(), tokenId, actor.id)
  return Number(result.changes) > 0
}
