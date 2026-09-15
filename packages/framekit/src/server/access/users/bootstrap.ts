import { createHash, randomUUID } from 'node:crypto'

import type { StudioUser } from '../../../studio/types'

import { getDatabase } from '../database'
import { hashPassword, isValidPassword } from '../passwords'
import { UserDomainError } from './errors'
import { countUsers, withImmediateTransaction } from './repository'
import { isValidUsername } from './validation'

export async function bootstrapUsers (env: NodeJS.ProcessEnv = process.env): Promise<StudioUser | undefined> {
  const database = getDatabase()
  const alreadyInitialized = withImmediateTransaction(database, () => countUsers(database) > 0)
  if (alreadyInitialized) return undefined

  const password = env.FRAMEKIT_ADMIN_PASSWORD
  const username = env.FRAMEKIT_ADMIN_USERNAME ?? 'admin'
  if (!isValidPassword(password)) throw new UserDomainError('bootstrap_configuration', 'FRAMEKIT_ADMIN_PASSWORD must be between 12 and 256 UTF-8 bytes')
  if (!isValidUsername(username)) throw new UserDomainError('bootstrap_configuration', 'FRAMEKIT_ADMIN_USERNAME must be 3-64 ASCII letters, numbers, ., _, or -')

  const passwordHash = await hashPassword(password)
  const apiKey = env.FRAMEKIT_API_KEY
  const legacyTokenHash = typeof apiKey === 'string' && apiKey.length > 0 ? createHash('sha256').update(apiKey, 'utf8').digest('hex') : undefined
  const userId = randomUUID()
  const tokenId = legacyTokenHash === undefined ? undefined : randomUUID()
  const now = Date.now()

  return withImmediateTransaction(database, () => {
    if (countUsers(database) > 0) return undefined

    database.prepare(`
      INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, passwordHash, 'admin', 1, now, now)

    if (legacyTokenHash !== undefined && tokenId !== undefined) {
      database.prepare(`
        INSERT INTO api_tokens (id, user_id, name, token_prefix, token_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(tokenId, userId, 'Legacy FRAMEKIT_API_KEY', 'legacy', legacyTokenHash, now)
    }

    return { id: userId, username, role: 'admin' }
  })
}
