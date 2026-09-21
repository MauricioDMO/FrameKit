import { randomUUID } from 'node:crypto'

import type { StudioUser } from '@/types'

import { getDatabase } from '@/server/access/database'
import { hashPassword } from '@/server/access/passwords'
import {
  duplicateUsernameError,
  lastAdministratorError,
  userNotFoundError,
  UserDomainError
} from './errors'
import {
  isActiveValue,
  isRecord,
  isUserRole,
  normalizeUpdate,
  requirePassword,
  requireUserId,
  requireUsername,
  toStudioUser,
  type CreateUserInput,
  type UpdateUserInput
} from './validation'
import {
  countActiveAdministrators as countActiveAdministratorsIn,
  isDuplicateUsernameError,
  readManagedUserById,
  readUserById,
  readUserState,
  readUsers,
  usernameExists,
  withImmediateTransaction
} from './repository'

interface ManagedUser {
  id: string
  username: string
  role: StudioUser['role']
  active: boolean
  createdAt: number
  updatedAt: number
}

function toManagedUser (value: unknown): ManagedUser | undefined {
  if (!isRecord(value)) return undefined
  const user = toStudioUser(value)
  if (user === undefined || !isUserRole(value.role) || !isActiveValue(value.active)) return undefined
  if (typeof value.created_at !== 'number' || !Number.isSafeInteger(value.created_at) || typeof value.updated_at !== 'number' || !Number.isSafeInteger(value.updated_at)) return undefined

  return {
    ...user,
    active: value.active === 1,
    createdAt: value.created_at,
    updatedAt: value.updated_at
  }
}

export function getUserById (userId: unknown, env: NodeJS.ProcessEnv = process.env): StudioUser | undefined {
  if (typeof userId !== 'string' || userId.length === 0) return undefined
  const row = readUserById(getDatabase(env), userId)
  return toStudioUser(row)
}

export function getManagedUserById (userId: unknown, env: NodeJS.ProcessEnv = process.env): ManagedUser | undefined {
  if (typeof userId !== 'string' || userId.length === 0) return undefined
  return toManagedUser(readManagedUserById(getDatabase(env), userId))
}

export function listUsers (env: NodeJS.ProcessEnv = process.env): ManagedUser[] {
  return readUsers(getDatabase(env))
    .map(toManagedUser)
    .filter((user): user is ManagedUser => user !== undefined)
}

export async function createUser (input: CreateUserInput, env: NodeJS.ProcessEnv = process.env): Promise<StudioUser> {
  const value: Record<string, unknown> = isRecord(input) ? input : {}
  const username = requireUsername(value.username)
  const password = requirePassword(value.password)
  const role = value.role === undefined ? 'user' : value.role
  if (!isUserRole(role)) throw new UserDomainError('invalid_role', 'User role is invalid')

  const passwordHash = await hashPassword(password)
  const userId = randomUUID()
  const now = Date.now()
  const database = getDatabase(env)

  try {
    return withImmediateTransaction(database, () => {
      if (usernameExists(database, username)) throw duplicateUsernameError()
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

export function updateUser (userId: unknown, input: UpdateUserInput, env: NodeJS.ProcessEnv = process.env): StudioUser {
  const id = requireUserId(userId)
  const updates = normalizeUpdate(input)
  const database = getDatabase(env)

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

      if (updates.username !== undefined && usernameExists(database, nextUsername, id)) throw duplicateUsernameError()
      database.prepare('UPDATE users SET username = ?, role = ?, active = ?, updated_at = ? WHERE id = ?').run(nextUsername, nextRole, nextActive, Date.now(), id)
      if (nextActive === 0) database.prepare('DELETE FROM sessions WHERE user_id = ?').run(id)
      return { id: currentUser.id, username: nextUsername, role: nextRole }
    })
  } catch (error) {
    if (isDuplicateUsernameError(error)) throw duplicateUsernameError()
    throw error
  }
}

export function updateUsername (userId: unknown, username: unknown, env: NodeJS.ProcessEnv = process.env): StudioUser {
  return updateUser(userId, { username: requireUsername(username) }, env)
}

export async function setPassword (userId: unknown, password: unknown, env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const id = requireUserId(userId)
  const validPassword = requirePassword(password)
  const passwordHash = await hashPassword(validPassword)

  const database = getDatabase(env)
  withImmediateTransaction(database, () => {
    if (readUserState(database, id) === undefined) throw userNotFoundError()
    database.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, Date.now(), id)
    database.prepare('DELETE FROM sessions WHERE user_id = ?').run(id)
  })
}

export function countActiveAdministrators (env: NodeJS.ProcessEnv = process.env): number {
  return countActiveAdministratorsIn(getDatabase(env))
}

export function deleteUser (userId: unknown, env: NodeJS.ProcessEnv = process.env): void {
  const id = requireUserId(userId)
  const database = getDatabase(env)
  withImmediateTransaction(database, () => {
    const current = readUserState(database, id)
    if (current === undefined) throw userNotFoundError()
    if (current.role === 'admin' && current.active === 1 && countActiveAdministratorsIn(database) <= 1) throw lastAdministratorError()
    database.prepare('DELETE FROM users WHERE id = ?').run(id)
  })
}
