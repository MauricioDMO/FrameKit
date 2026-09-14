import { describe, expect, it } from 'vitest'

import { dummyPasswordHash, hashPassword, isValidPassword, verifyPassword } from '@/server/access/passwords'

const password = 'correct horse battery staple'

describe('password primitives', () => {
  it('validates UTF-8 byte limits without trimming or normalizing', () => {
    expect(isValidPassword('a'.repeat(11))).toBe(false)
    expect(isValidPassword('a'.repeat(12))).toBe(true)
    expect(isValidPassword('a'.repeat(256))).toBe(true)
    expect(isValidPassword('a'.repeat(257))).toBe(false)
    expect(isValidPassword('😀😀😀')).toBe(true)
    expect(isValidPassword('😀😀')).toBe(false)
    expect(isValidPassword(' password ')).toBe(false)
    expect(isValidPassword(undefined)).toBe(false)
  })

  it('creates different salted hashes that both verify', async () => {
    const first = await hashPassword(password)
    const second = await hashPassword(password)
    const firstParts = first.split(':')
    const secondParts = second.split(':')

    expect(first).toMatch(/^scrypt:v1:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/)
    expect(firstParts[2]).not.toBe(secondParts[2])
    expect(await verifyPassword(password, first)).toBe(true)
    expect(await verifyPassword(password, second)).toBe(true)
  }, 30_000)

  it('rejects wrong passwords and preserves whitespace and normalization', async () => {
    const spacedPassword = 'password with spaces'
    const hash = await hashPassword(spacedPassword)
    const composed = '\u00e9'.repeat(6)
    const decomposed = 'e\u0301'.repeat(6)
    const normalizedHash = await hashPassword(composed)

    expect(await verifyPassword('password with spaces ', hash)).toBe(false)
    expect(await verifyPassword('wrong password', hash)).toBe(false)
    expect(await verifyPassword(composed, normalizedHash)).toBe(true)
    expect(await verifyPassword(decomposed, normalizedHash)).toBe(false)
  }, 30_000)

  it('rejects passwords outside the byte limits before hashing', async () => {
    await expect(hashPassword('a'.repeat(11))).rejects.toThrow('12 and 256 UTF-8 bytes')
    await expect(hashPassword('a'.repeat(257))).rejects.toThrow('12 and 256 UTF-8 bytes')
  })

  it('rejects malformed hashes before equal-length comparison', async () => {
    const validHash = await hashPassword(password)
    const [, , salt, hash] = validHash.split(':')
    const malformedHashes = [
      `scrypt:v2:${salt}:${hash}`,
      `scrypt:v1:+${salt.slice(1)}:${hash}`,
      `scrypt:v1:${salt.slice(0, -1)}:${hash}`,
      `scrypt:v1:${salt}:${hash.slice(0, -1)}`,
      `scrypt:v1:${salt}:${hash}=`,
      `scrypt:v1:${salt}:${hash}:extra`,
      'scrypt:v1'
    ]

    for (const malformedHash of malformedHashes) {
      await expect(verifyPassword(password, malformedHash)).resolves.toBe(false)
    }

    await expect(verifyPassword(password, dummyPasswordHash)).resolves.toBe(false)
  }, 30_000)
})
