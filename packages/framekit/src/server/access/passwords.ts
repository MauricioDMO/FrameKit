import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const passwordHashPrefix = 'scrypt:v1'
const minimumPasswordBytes = 12
const maximumPasswordBytes = 256
const saltBytes = 16
const hashBytes = 64
const base64UrlPattern = /^[A-Za-z0-9_-]+$/
const scryptOptions = {
  N: 131072,
  r: 8,
  p: 1,
  maxmem: 268435456
} as const

export const dummyPasswordHash = `${passwordHashPrefix}:${Buffer.alloc(saltBytes).toString('base64url')}:${Buffer.alloc(hashBytes).toString('base64url')}`

export function isValidPassword (password: unknown): password is string {
  if (typeof password !== 'string') return false

  const byteLength = Buffer.byteLength(password, 'utf8')
  return byteLength >= minimumPasswordBytes && byteLength <= maximumPasswordBytes
}

const deriveScrypt = promisify(scrypt) as unknown as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: typeof scryptOptions
) => Promise<Buffer>
const derivePasswordHash = (password: string, salt: Buffer): Promise<Buffer> =>
  deriveScrypt(password, salt, hashBytes, scryptOptions)

function decodeBase64Url (value: string, expectedBytes: number): Buffer | undefined {
  if (value.length !== Math.ceil(expectedBytes * 4 / 3) || !base64UrlPattern.test(value)) return undefined

  let decoded: Buffer
  try {
    decoded = Buffer.from(value, 'base64url')
  } catch {
    return undefined
  }

  if (decoded.length !== expectedBytes || decoded.toString('base64url') !== value) return undefined
  return decoded
}

function parsePasswordHash (value: unknown): { salt: Buffer, hash: Buffer } | undefined {
  if (typeof value !== 'string') return undefined

  const parts = value.split(':')
  if (parts.length !== 4 || parts[0] !== 'scrypt' || parts[1] !== 'v1') return undefined

  const salt = decodeBase64Url(parts[2], saltBytes)
  const hash = decodeBase64Url(parts[3], hashBytes)
  if (salt === undefined || hash === undefined) return undefined

  return { salt, hash }
}

export async function hashPassword (password: string): Promise<string> {
  if (!isValidPassword(password)) throw new Error('Password must be between 12 and 256 UTF-8 bytes')

  const salt = randomBytes(saltBytes)
  const hash = await derivePasswordHash(password, salt)
  return `${passwordHashPrefix}:${salt.toString('base64url')}:${hash.toString('base64url')}`
}

export async function verifyPassword (password: string, storedHash: string): Promise<boolean> {
  const parsed = parsePasswordHash(storedHash)
  if (parsed === undefined || !isValidPassword(password)) return false

  const derivedHash = await derivePasswordHash(password, parsed.salt)
  if (derivedHash.length !== parsed.hash.length) return false

  return timingSafeEqual(derivedHash, parsed.hash)
}
