import { describe, expect, it } from 'vitest'

import { assertSupportedNodeRuntime, assertSupportedPackageManager } from './runtime'

describe('runtime requirements', () => {
  it('accepts the documented Node.js minimum', () => {
    expect(() => assertSupportedNodeRuntime('22.13.0')).not.toThrow()
  })

  it('rejects an unsupported Node.js version', () => {
    expect(() => assertSupportedNodeRuntime('20.9.0')).toThrow('requires Node.js >=22.13.0')
  })

  it('does not require pnpm when npm is selected', () => {
    expect(() => assertSupportedPackageManager('npm')).not.toThrow()
  })
})
