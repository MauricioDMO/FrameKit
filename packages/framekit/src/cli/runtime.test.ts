import { describe, expect, it } from 'vitest'

import { assertSupportedRuntime } from './runtime'

describe('runtime requirements', () => {
  it('accepts the documented Node.js and pnpm minimums', () => {
    expect(() => assertSupportedRuntime('22.13.0', 'pnpm/11.14.0 npm/? node/v22.13.0')).not.toThrow()
  })

  it('rejects an unsupported Node.js version', () => {
    expect(() => assertSupportedRuntime('20.9.0')).toThrow('requires Node.js >=22.13.0')
  })

  it.each(['', '22.13', 'not-a-version'])('rejects an invalid Node.js version: %j', (version) => {
    expect(() => assertSupportedRuntime(version)).toThrow('requires Node.js >=22.13.0')
  })

  it('rejects an unsupported pnpm version when pnpm launched the CLI', () => {
    expect(() => assertSupportedRuntime('22.13.0', 'pnpm/10.0.0 npm/? node/v22.13.0')).toThrow(
      'requires pnpm >=11.14.0',
    )
  })

  it('does not require pnpm when no pnpm user agent is present', () => {
    expect(() => assertSupportedRuntime('22.13.0', '')).not.toThrow()
  })
})
