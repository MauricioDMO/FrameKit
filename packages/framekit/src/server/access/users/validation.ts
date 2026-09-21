import type { StudioUser } from '@/types'

import { isValidPassword } from '@/server/access/passwords'
import { UserDomainError } from './errors'

export type UserRole = StudioUser['role']

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

const invalidUsernameCharacterPattern = /[^A-Za-z0-9._-]/

export function isValidUsername (value: unknown): value is string {
  return typeof value === 'string' && value.length >= 3 && value.length <= 64 && !invalidUsernameCharacterPattern.test(value)
}

export function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isUserRole (value: unknown): value is UserRole {
  return value === 'admin' || value === 'user'
}

export function isActiveValue (value: unknown): value is 0 | 1 {
  return value === 0 || value === 1
}

export function toStudioUser (value: unknown): StudioUser | undefined {
  if (!isRecord(value) || typeof value.id !== 'string' || !isValidUsername(value.username) || !isUserRole(value.role)) return undefined
  return { id: value.id, username: value.username, role: value.role }
}

export function requireUserId (value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new UserDomainError('user_not_found', 'User not found')
  return value
}

export function requireUsername (value: unknown): string {
  if (!isValidUsername(value)) throw new UserDomainError('invalid_username', 'Username must be 3-64 ASCII letters, numbers, ., _, or -')
  return value
}

export function requirePassword (value: unknown): string {
  if (!isValidPassword(value)) throw new UserDomainError('invalid_password', 'Password must be between 12 and 256 UTF-8 bytes')
  return value
}

export function normalizeUpdate (value: UpdateUserInput): UpdateUserInput {
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
