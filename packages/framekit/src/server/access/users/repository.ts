import type { DatabaseSync } from 'node:sqlite'

export interface UserStateRow {
  id?: unknown
  username?: unknown
  role?: unknown
  active?: unknown
  created_at?: unknown
  updated_at?: unknown
}

export interface AuthenticationRow extends UserStateRow {
  password_hash?: unknown
}

export function readUserById (database: DatabaseSync, id: string): UserStateRow | undefined {
  return database.prepare('SELECT id, username, role FROM users WHERE id = ?').get(id) as UserStateRow | undefined
}

export function readUserState (database: DatabaseSync, id: string): UserStateRow | undefined {
  return database.prepare('SELECT id, username, role, active FROM users WHERE id = ?').get(id) as UserStateRow | undefined
}

export function readManagedUserById (database: DatabaseSync, id: string): UserStateRow | undefined {
  return database.prepare('SELECT id, username, role, active, created_at, updated_at FROM users WHERE id = ?').get(id) as UserStateRow | undefined
}

export function readUsers (database: DatabaseSync): UserStateRow[] {
  return database.prepare(`
    SELECT id, username, role, active, created_at, updated_at
    FROM users
    ORDER BY created_at ASC, id ASC
  `).all() as UserStateRow[]
}

export function readAuthenticationUser (database: DatabaseSync, username: string): AuthenticationRow | undefined {
  return database.prepare('SELECT id, username, password_hash, role, active FROM users WHERE username = ?').get(username) as AuthenticationRow | undefined
}

export function countUsers (database: DatabaseSync): number {
  const row = database.prepare('SELECT COUNT(*) AS count FROM users').get() as { count?: unknown } | undefined
  if (typeof row?.count !== 'number' || !Number.isSafeInteger(row.count)) throw new Error('FrameKit user count is invalid')
  return row.count
}

export function countActiveAdministrators (database: DatabaseSync): number {
  const row = database.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND active = 1").get() as { count?: unknown } | undefined
  if (typeof row?.count !== 'number' || !Number.isSafeInteger(row.count)) throw new Error('FrameKit administrator count is invalid')
  return row.count
}

export function usernameExists (database: DatabaseSync, username: string, currentId?: string): boolean {
  const row = currentId === undefined
    ? database.prepare('SELECT 1 AS found FROM users WHERE username = ? LIMIT 1').get(username)
    : database.prepare('SELECT 1 AS found FROM users WHERE username = ? AND id <> ? LIMIT 1').get(username, currentId)
  return row !== undefined
}

export function isDuplicateUsernameError (error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed:\s*users\.username/i.test(error.message)
}

export function withImmediateTransaction<T> (database: DatabaseSync, action: () => T): T {
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
