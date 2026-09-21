import type { StudioUser } from '@/types'

import { getDatabase } from '@/server/access/database'
import { dummyPasswordHash, isValidPassword, verifyPassword } from '@/server/access/passwords'
import { readAuthenticationUser } from './repository'
import { isValidUsername, toStudioUser } from './validation'

const dummyPassword = 'x'.repeat(12)

async function verifyDummyPassword (password: unknown, verify: typeof verifyPassword): Promise<void> {
  await verify(isValidPassword(password) ? password : dummyPassword, dummyPasswordHash)
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
