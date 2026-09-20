import { describe, expect, it } from 'vitest'

import { AuthenticationConfigurationError, isAuthenticationEnabled } from '@/server/access/config'

const invalidValues = ['', 'TRUE', 'False', ' true', 'true ', '1', '0', '42', 'yes', 'no']
const invalidConfigurationMessage = 'FRAMEKIT_AUTH_ENABLED must be exactly "true" or "false" when set'

describe('authentication configuration', () => {
  it('disables authentication when the variable is missing', () => {
    expect(isAuthenticationEnabled({ NODE_ENV: 'test' })).toBe(false)
  })

  it('accepts only the exact false and true values', () => {
    expect(isAuthenticationEnabled({ NODE_ENV: 'test', FRAMEKIT_AUTH_ENABLED: 'false' })).toBe(false)
    expect(isAuthenticationEnabled({ NODE_ENV: 'test', FRAMEKIT_AUTH_ENABLED: 'true' })).toBe(true)
  })

  it.each(invalidValues)('rejects invalid value %j with a stable configuration error', (value) => {
    const environment: NodeJS.ProcessEnv = { NODE_ENV: 'test', FRAMEKIT_AUTH_ENABLED: value }

    expect(() => isAuthenticationEnabled(environment)).toThrow(AuthenticationConfigurationError)
    expect(() => isAuthenticationEnabled(environment)).toThrow(invalidConfigurationMessage)
    expect(() => isAuthenticationEnabled(environment)).toThrow(/FRAMEKIT_AUTH_ENABLED.*true.*false/)
  })

  it('does not infer authentication from NODE_ENV', () => {
    expect(isAuthenticationEnabled({ NODE_ENV: 'production' })).toBe(false)
    expect(isAuthenticationEnabled({ NODE_ENV: 'production', FRAMEKIT_AUTH_ENABLED: 'true' })).toBe(true)
  })

  it('evaluates injected environment objects independently on every call', () => {
    const environment: NodeJS.ProcessEnv = { NODE_ENV: 'test' }
    const otherEnvironment: NodeJS.ProcessEnv = { NODE_ENV: 'test', FRAMEKIT_AUTH_ENABLED: 'false' }

    expect(isAuthenticationEnabled(environment)).toBe(false)
    expect(isAuthenticationEnabled(otherEnvironment)).toBe(false)

    environment.FRAMEKIT_AUTH_ENABLED = 'true'
    expect(isAuthenticationEnabled(environment)).toBe(true)
    expect(isAuthenticationEnabled(otherEnvironment)).toBe(false)

    environment.FRAMEKIT_AUTH_ENABLED = 'false'
    expect(isAuthenticationEnabled(environment)).toBe(false)
  })

  it('reads process.env when called without an injected environment', () => {
    const previousValue = process.env.FRAMEKIT_AUTH_ENABLED

    try {
      delete process.env.FRAMEKIT_AUTH_ENABLED
      expect(isAuthenticationEnabled()).toBe(false)

      process.env.FRAMEKIT_AUTH_ENABLED = 'true'
      expect(isAuthenticationEnabled()).toBe(true)
    } finally {
      if (previousValue === undefined) delete process.env.FRAMEKIT_AUTH_ENABLED
      else process.env.FRAMEKIT_AUTH_ENABLED = previousValue
    }
  })
})
