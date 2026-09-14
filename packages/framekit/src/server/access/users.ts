import { createHash, randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'

import type { StudioUser } from '../../studio/types'
import { getDatabase } from './database'
import { dummyPasswordHash, hashPassword, isValidPassword, verifyPassword } from './passwords'

export type UserRole = StudioUser['role']

export type UserDomainErrorCode =
  | 'invalid_username'
  | 'invalid_password'
  | 'invalid_role'
  | 'invalid_active'
  | 'invalid_update'
  | 'invalid_user_state'
  | 'bootstrap_configuration'
  | 'user_not_found'
  | 'duplicate_username'
  | 'last_active_administrator'

export class UserDomainError extends Error {
  readonly code: UserDomainErrorCode

  constructor (code: UserDomainErrorCode, message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'UserDomainError'
    this.code = code
  }
}

export interface CreateUserInput {
  username: string
  password: string
  role?: UserRole
}

export interface UpdateUserInput {
  username?: string
  role?: UserRole
  active?: boolean
}

interface UserStateRow {
  id?: unknown
  username?: unknown
  role?: unknown
  active?: unknown
}

interface AuthenticationRow extends UserStateRow {
  password_hash?: unknown
}

const invalidUsernameCharacterPattern = /[^A-Za-z0-9._-]/
const dummyPassword = 'x'.repeat(12)

export function isValidUsername (value: unknown): value is string {
  return typeof value === 'string' && value.length >= 3 && value.length <= 64 && !invalidUsernameCharacterPattern.test(value)
}

function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isUserRole (value: unknown): value is UserRole {
  return value === 'admin' || value === 'user'
}

function isActiveValue (value: unknown): value is 0 | 1 {
  return value === 0 || value === 1
}

function toStudioUser (value: unknown): StudioUser | undefined {
  if (!isRecord(value) || typeof value.id !== 'string' || !isValidUsername(value.username) || !isUserRole(value.role)) return undefined
  return { id: value.id, username: value.username, role: value.role }
}

function readUserState (database: DatabaseSync, id: string): UserStateRow | undefined {
  return database.prepare('SELECT id, username, role, active FROM users WHERE id = ?').get(id) as UserStateRow | undefined
}

function readAuthenticationUser (database: DatabaseSync, username: string): AuthenticationRow | undefined {
  return database.prepare('SELECT id, username, password_hash, role, active FROM users WHERE username = ?').get(username) as AuthenticationRow | undefined
}

function countUsers (database: DatabaseSync): number {
  const row = database.prepare('SELECT COUNT(*) AS count FROM users').get() as { count?: unknown } | undefined
  if (typeof row?.count !== 'number' || !Number.isSafeInteger(row.count)) throw new Error('FrameKit user count is invalid')
  return row.count
}

function countActiveAdministratorsIn (database: DatabaseSync): number {
  const row = database.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND active = 1").get() as { count?: unknown } | undefined
  if (typeof row?.count !== 'number' || !Number.isSafeInteger(row.count)) throw new Error('FrameKit administrator count is invalid')
  return row.count
}

function withImmediateTransaction<T> (database: DatabaseSync, action: () => T): T {
  let transactionStarted = false
  try {
    database.exec('BEGIN IMMEDIATE')
    transactionStarted = true
    const result = action()
    database.exec('COMMIT')
    transactionStarted = false
    return result
  } catch (error) {
    if (transactionStarted) {
      try {
        database.exec('ROLLBACK')
      } catch {
        // Preserve the mutation error if rollback itself cannot complete.
      }
    }
    throw error
  }
}

function requireUserId (value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new UserDomainError('user_not_found', 'User not found')
  return value
}

function requireUsername (value: unknown): string {
  if (!isValidUsername(value)) throw new UserDomainError('invalid_username', 'Username must be 3-64 ASCII letters, numbers, ., _, or -')
  return value
}

function requirePassword (value: unknown): string {
  if (!isValidPassword(value)) throw new UserDomainError('invalid_password', 'Password must be between 12 and 256 UTF-8 bytes')
  return value
}

function duplicateUsernameError (): UserDomainError {
  return new UserDomainError('duplicate_username', 'Username is already in use')
}

function userNotFoundError (): UserDomainError {
  return new UserDomainError('user_not_found', 'User not found')
}

function lastAdministratorError (): UserDomainError {
  return new UserDomainError('last_active_administrator', 'The last active administrator cannot be removed or disabled')
}

function isDuplicateUsernameError (error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed:\s*users\.username/i.test(error.message)
}

function assertUsernameAvailable (database: DatabaseSync, username: string, currentId?: string): void {
  const row = currentId === undefined
    ? database.prepare('SELECT 1 AS found FROM users WHERE username = ? LIMIT 1').get(username)
    : database.prepare('SELECT 1 AS found FROM users WHERE username = ? AND id <> ? LIMIT 1').get(username, currentId)
  if (row !== undefined) throw duplicateUsernameError()
}

function normalizeUpdate (value: UpdateUserInput): UpdateUserInput {
  if (!isRecord(value)) throw new UserDomainError('invalid_update', 'User update must be an object')

  const username = value.username
  const role = value.role
  const active = value.active
  if (username !== undefined && !isValidUsername(username)) throw new UserDomainError('invalid_username', 'Username must be 3-64 ASCII letters, numbers, ., _, or -')
  if (role !== undefined && !isUserRole(role)) throw new UserDomainError('invalid_role', 'User role is invalid')
  if (active !== undefined && typeof active !== 'boolean') throw new UserDomainError('invalid_active', 'User active state is invalid')
  if (username === undefined && role === undefined && active === undefined) throw new UserDomainError('invalid_update', 'User update is empty')

  return {
    ...(username === undefined ? {} : { username }),
    ...(role === undefined ? {} : { role }),
    ...(active === undefined ? {} : { active })
  }
}

async function verifyDummyPassword (password: unknown, verify: typeof verifyPassword): Promise<void> {
  await verify(isValidPassword(password) ? password : dummyPassword, dummyPasswordHash)
}

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

export function getUserById (userId: unknown): StudioUser | undefined {
  if (typeof userId !== 'string' || userId.length === 0) return undefined
  const row = getDatabase().prepare('SELECT id, username, role FROM users WHERE id = ?').get(userId)
  return toStudioUser(row)
}

export async function authenticateUser (
  username: unknown,
  password: unknown,
  options: { verifyPassword?: typeof verifyPassword } = {}
): Promise<StudioUser | undefined> {
  const verify = options.verifyPassword ?? verifyPassword
  if (!isValidUsername(username) || !isValidPassword(password)) {
    await verifyDummyPassword(password, verify)
    return undefined
  }

  const row = readAuthenticationUser(getDatabase(), username)
  const user = toStudioUser(row)
  if (row === undefined || user === undefined || row.active !== 1 || typeof row.password_hash !== 'string') {
    await verifyDummyPassword(password, verify)
    return undefined
  }

  if (!await verify(password, row.password_hash)) return undefined
  return user
}

export async function createUser (input: CreateUserInput): Promise<StudioUser> {
  const value: Record<string, unknown> = isRecord(input) ? input : {}
  const username = requireUsername(value.username)
  const password = requirePassword(value.password)
  const role = value.role === undefined ? 'user' : value.role
  if (!isUserRole(role)) throw new UserDomainError('invalid_role', 'User role is invalid')

  const passwordHash = await hashPassword(password)
  const userId = randomUUID()
  const now = Date.now()
  const database = getDatabase()

  try {
    return withImmediateTransaction(database, () => {
      assertUsernameAvailable(database, username)
      database.prepare(`
        INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, username, passwordHash, role, 1, now, now)
      return { id: userId, username, role }
    })
  } catch (error) {
    if (isDuplicateUsernameError(error)) throw duplicateUsernameError()
    throw error
  }
}

export function updateUser (userId: unknown, input: UpdateUserInput): StudioUser {
  const id = requireUserId(userId)
  const updates = normalizeUpdate(input)
  const database = getDatabase()

  try {
    return withImmediateTransaction(database, () => {
      const current = readUserState(database, id)
      const currentUser = toStudioUser(current)
      if (current === undefined || currentUser === undefined || !isActiveValue(current.active)) throw userNotFoundError()

      const nextUsername = updates.username ?? currentUser.username
      const nextRole = updates.role ?? currentUser.role
      const nextActive = updates.active === undefined ? current.active : updates.active ? 1 : 0
      if (!isUserRole(nextRole)) throw new UserDomainError('invalid_user_state', 'User role is invalid')

      if (current.role === 'admin' && current.active === 1 && (nextRole !== 'admin' || nextActive !== 1) && countActiveAdministratorsIn(database) <= 1) {
        throw lastAdministratorError()
      }

      if (updates.username !== undefined) assertUsernameAvailable(database, nextUsername, id)
      database.prepare('UPDATE users SET username = ?, role = ?, active = ?, updated_at = ? WHERE id = ?').run(nextUsername, nextRole, nextActive, Date.now(), id)
      if (nextActive === 0) database.prepare('DELETE FROM sessions WHERE user_id = ?').run(id)
      return { id: currentUser.id, username: nextUsername, role: nextRole }
    })
  } catch (error) {
    if (isDuplicateUsernameError(error)) throw duplicateUsernameError()
    throw error
  }
}

export function updateUsername (userId: unknown, username: unknown): StudioUser {
  return updateUser(userId, { username: requireUsername(username) })
}

export async function setPassword (userId: unknown, password: unknown): Promise<void> {
  const id = requireUserId(userId)
  const validPassword = requirePassword(password)
  const passwordHash = await hashPassword(validPassword)

  const database = getDatabase()
  withImmediateTransaction(database, () => {
    if (readUserState(database, id) === undefined) throw userNotFoundError()
    database.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, Date.now(), id)
    database.prepare('DELETE FROM sessions WHERE user_id = ?').run(id)
  })
}

export function countActiveAdministrators (): number {
  return countActiveAdministratorsIn(getDatabase())
}

export function deleteUser (userId: unknown): void {
  const id = requireUserId(userId)
  const database = getDatabase()
  withImmediateTransaction(database, () => {
    const current = readUserState(database, id)
    if (current === undefined) throw userNotFoundError()
    if (current.role === 'admin' && current.active === 1 && countActiveAdministratorsIn(database) <= 1) throw lastAdministratorError()
    database.prepare('DELETE FROM users WHERE id = ?').run(id)
  })
}
