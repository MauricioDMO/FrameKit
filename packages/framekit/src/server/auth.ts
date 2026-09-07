import { timingSafeEqual } from 'node:crypto'

export function authenticateBearer (
  authorization: string | null | undefined,
  expectedToken: string
): boolean {
  if (typeof authorization !== 'string' || typeof expectedToken !== 'string') return false

  const match = /^Bearer ([^\s,]+)$/i.exec(authorization)
  if (match === null || match[0] !== authorization) return false

  const providedBytes = Buffer.from(match[1], 'utf8')
  const expectedBytes = Buffer.from(expectedToken, 'utf8')
  const length = Math.max(providedBytes.length, expectedBytes.length)
  const normalizedProvided = Buffer.alloc(length)
  const normalizedExpected = Buffer.alloc(length)
  providedBytes.copy(normalizedProvided)
  expectedBytes.copy(normalizedExpected)

  const matches = timingSafeEqual(normalizedProvided, normalizedExpected)
  return providedBytes.length === expectedBytes.length && matches
}
