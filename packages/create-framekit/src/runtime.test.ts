import { describe, expect, it } from 'vitest'

import { assertSupportedNodeRuntime, assertSupportedPackageManager } from './runtime'

describe('runtime requirements', () => {
  it('accepts the documented Node.js minimum', () => {
    expect(() => assertSupportedNodeRuntime('22.13.0')).not.toThrow()
  })

  it('rejects an unsupported Node.js version', () => {
    expect(() => assertSupportedNodeRuntime('20.9.0')).toThrow('requires Node.js >=22.13.0')
  })

  it.each(['', '22.13', 'not-a-version'])('rejects an invalid Node.js version: %j', (version) => {
    expect(() => assertSupportedNodeRuntime(version)).toThrow('requires Node.js >=22.13.0')
  })

  it('rejects an unsupported pnpm version', () => {
    const previousUserAgent = process.env.npm_config_user_agent
    process.env.npm_config_user_agent = 'pnpm/11.13.0 npm/? node/v22.13.0'
    try {
      expect(() => assertSupportedPackageManager('pnpm')).toThrow('requires pnpm >=11.14.0')
    } finally {
      if (previousUserAgent === undefined) delete process.env.npm_config_user_agent
      else process.env.npm_config_user_agent = previousUserAgent
    }
  })

  it('does not require pnpm when npm is selected', () => {
    expect(() => assertSupportedPackageManager('npm')).not.toThrow()
  })
})
