import { afterEach, describe, expect, it, vi } from 'vitest'

import { assertSupportedRuntime } from './runtime'

describe('runtime requirements', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts the documented Node.js and pnpm minimums', () => {
    expect(() => assertSupportedRuntime('22.13.0', 'pnpm/11.14.0 npm/? node/v22.13.0')).not.toThrow()
  })

  it.each([
    ['a lower major version', '20.9.0'],
    ['a lower minor version', '22.12.99'],
    ['an invalid version', ''],
    ['a missing patch version', '22.13'],
    ['a malformed version', 'not-a-version'],
    ['a version with trailing garbage', '22.13.0-basura'],
  ])('rejects %s', (_caseName, version) => {
    expect(() => assertSupportedRuntime(version, '')).toThrow('requires Node.js >=22.13.0')
  })

  it.each(['22.13.0', '22.13.1', '23.0.0', 'v22.13.0'])('accepts a supported Node.js version: %s', (version) => {
    expect(() => assertSupportedRuntime(version, '')).not.toThrow()
  })

  it.each(['pnpm/10.0.0 npm/? node/v22.13.0', 'pnpm/11.13.9 npm/? node/v22.13.0'])('rejects an unsupported pnpm version: %s', (userAgent) => {
    expect(() => assertSupportedRuntime('22.13.0', userAgent)).toThrow(
      'requires pnpm >=11.14.0',
    )
  })

  it('uses the default user agent from the environment', () => {
    vi.stubEnv('npm_config_user_agent', 'pnpm/10.0.0 npm/? node/v22.13.0')

    expect(() => assertSupportedRuntime('22.13.0')).toThrow('requires pnpm >=11.14.0')
  })

  it('does not require pnpm when the default user agent is empty', () => {
    vi.stubEnv('npm_config_user_agent', '')

    expect(() => assertSupportedRuntime('22.13.0')).not.toThrow()
  })
})
