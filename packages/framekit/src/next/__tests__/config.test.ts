import type { NextConfig } from 'next'
import { describe, expect, it, vi } from 'vitest'

import { withFrameKit } from '@/next/config'

const frameKitRedirect = { source: '/', destination: '/editor', permanent: false }

async function readRedirects (config: NextConfig) {
  if (config.redirects === undefined) throw new Error('redirects are missing')
  return config.redirects()
}

describe('withFrameKit', () => {
  it('owns the standalone build settings and root redirect', async () => {
    const result = withFrameKit()

    expect(result.distDir).toBe('.framekit/next')
    expect(result.output).toBe('standalone')
    await expect(readRedirects(result)).resolves.toEqual([frameKitRedirect])
  })

  it('preserves ordinary settings and prepends the reserved redirect before async rules', async () => {
    const headers = vi.fn(async () => [])
    const rewrites = vi.fn(async () => [])
    const redirects = vi.fn(async () => [
      { source: '/legacy', destination: '/editor', permanent: true },
      { source: '/old', destination: '/new', permanent: false }
    ])
    const config: NextConfig = {
      turbopack: { root: '/workspace' },
      headers,
      rewrites,
      redirects
    }

    const result = withFrameKit(config)
    const resultRedirects = await readRedirects(result)

    expect(result).not.toBe(config)
    expect(result.turbopack).toBe(config.turbopack)
    expect(result.headers).toBe(headers)
    expect(result.rewrites).toBe(rewrites)
    expect(resultRedirects).toEqual([
      frameKitRedirect,
      { source: '/legacy', destination: '/editor', permanent: true },
      { source: '/old', destination: '/new', permanent: false }
    ])
    expect(redirects).toHaveBeenCalledOnce()
    expect(config).toEqual({ turbopack: config.turbopack, headers, rewrites, redirects })
  })

  it('deduplicates an equivalent exact root redirect', async () => {
    const existing = { source: '/', destination: '/editor', permanent: false }
    const result = withFrameKit({ redirects: () => [existing] })

    await expect(readRedirects(result)).resolves.toEqual([frameKitRedirect])
  })

  it('accepts the equivalent status-code form of the temporary redirect', async () => {
    const existing = { source: '/', destination: '/editor', statusCode: 307 }
    const result = withFrameKit({ redirects: () => [existing] })

    await expect(readRedirects(result)).resolves.toEqual([frameKitRedirect])
  })

  it('rejects a conflicting exact root redirect', async () => {
    const result = withFrameKit({ redirects: async () => [{ source: '/', destination: '/home', permanent: false }] })

    await expect(readRedirects(result)).rejects.toThrow(/root redirect/)
  })

  it('rejects conflicting owned settings', () => {
    expect(() => withFrameKit({ distDir: 'custom-output' })).toThrow(/distDir.*\.framekit\/next/)
    expect(() => withFrameKit({ output: 'export' })).toThrow(/output.*standalone/)
  })

  it('leaves non-exact root patterns available as custom rules', async () => {
    const custom = { source: '/:path*', destination: '/legacy/:path*', permanent: false }
    const result = withFrameKit({ redirects: () => [custom] })

    await expect(readRedirects(result)).resolves.toEqual([frameKitRedirect, custom])
  })
})
