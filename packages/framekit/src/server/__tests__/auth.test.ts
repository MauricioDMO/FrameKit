import { describe, expect, it } from 'vitest'

import { authenticateBearer } from '@/server/auth'

describe('authenticateBearer', () => {
  it.each([
    'Bearer production-secret',
    'bearer production-secret',
    'BEARER production-secret',
    'BeArEr production-secret'
  ])('accepts a case-insensitive Bearer scheme: %s', (authorization) => {
    expect(authenticateBearer(authorization, 'production-secret')).toBe(true)
  })

  it.each([
    undefined,
    null,
    '',
    'Bearer',
    'Bearer ',
    'Bearer  production-secret',
    'Bearer\tproduction-secret',
    'Bearer production-secret ',
    ' Bearer production-secret',
    'Bearer production-secret\n',
    'Bearer production-secret extra',
    'Bearer production-secret Bearer production-secret',
    'Bearer production-secret, Bearer production-secret',
    'Bearer production-secret,production-secret',
    'Basic production-secret',
    'Token production-secret'
  ])('rejects a missing or malformed header: %s', (authorization) => {
    expect(authenticateBearer(authorization, 'production-secret')).toBe(false)
  })

  it('requires an exact token match', () => {
    expect(authenticateBearer('Bearer Production-secret', 'production-secret')).toBe(false)
    expect(authenticateBearer('Bearer production-secre', 'production-secret')).toBe(false)
    expect(authenticateBearer('Bearer production-secret-long', 'production-secret')).toBe(false)
    expect(authenticateBearer('Bearer production-secret', ' production-secret')).toBe(false)
    expect(authenticateBearer('Bearer production-secret', 'production-secret ')).toBe(false)
  })

  it('compares equal-length tokens without throwing', () => {
    expect(authenticateBearer('Bearer production-secret', 'production-secret')).toBe(true)
    expect(authenticateBearer('Bearer production-secrex', 'production-secret')).toBe(false)
  })

  it('compares unequal-length tokens without throwing', () => {
    expect(() => authenticateBearer('Bearer production-secre', 'production-secret')).not.toThrow()
    expect(() => authenticateBearer('Bearer production-secret-long', 'production-secret')).not.toThrow()
  })
})
