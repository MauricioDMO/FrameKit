import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { PATCH, POST } from '@/app/api/framekit/[...action]/route'

const appRoot = fileURLToPath(new URL('../../app/', import.meta.url))

async function readAppFile (...segments: string[]): Promise<string> {
  return readFile(path.join(appRoot, ...segments), 'utf8')
}

describe('Studio app adapters', () => {
  it('keeps the protected Studio page request-time and binding-only', async () => {
    const source = await readAppFile('[section]', '[[...slug]]', 'page.tsx')

    expect(source).toContain("import { createStudioPage } from '@mauriciodmo/framekit/studio/root'")
    expect(source).toContain("import { StudioClient } from '@framekit/generated/studio-client'")
    expect(source).toContain("export const runtime = 'nodejs'")
    expect(source).toContain("export const dynamic = 'force-dynamic'")
    expect(source).toContain('export default createStudioPage(StudioClient)')
    expect(source).not.toContain('getSession')
  })

  it('keeps login and access adapters thin with request-time settings', async () => {
    const loginSource = await readAppFile('login', 'page.tsx')
    const accessSource = await readAppFile('api', 'framekit', '[...action]', 'route.ts')

    expect(loginSource).toContain("import { createLoginPage } from '@mauriciodmo/framekit/studio/root'")
    expect(loginSource).toContain("export const runtime = 'nodejs'")
    expect(loginSource).toContain("export const dynamic = 'force-dynamic'")
    expect(loginSource).toContain('export default createLoginPage()')
    expect(loginSource).not.toContain('cookies')

    expect(accessSource).toContain("import { createStudioAccessHandler } from '@mauriciodmo/framekit/server'")
    expect(accessSource).toContain("export const runtime = 'nodejs'")
    expect(accessSource).toContain("export const dynamic = 'force-dynamic'")
    expect(accessSource).toContain('const handler = createStudioAccessHandler()')
    expect(accessSource).toContain('export const GET = handler')
    expect(accessSource).toContain('export const POST = handler')
    expect(accessSource).toContain('export const PATCH = handler')
    expect(accessSource).not.toContain('getSession')
  })

  it('uses forwarded HTTPS origin headers through the actual Next route adapter', async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-access-adapter-'))
    const environmentKeys = ['FRAMEKIT_DATABASE_PATH', 'FRAMEKIT_ADMIN_USERNAME', 'FRAMEKIT_ADMIN_PASSWORD', 'FRAMEKIT_PUBLIC_ORIGIN', 'NODE_ENV'] as const
    const originalEnvironment = Object.fromEntries(environmentKeys.map((key) => [key, process.env[key]]))
    const internalOrigin = 'http://127.0.0.1:3000'
    const publicOrigin = 'https://framekit.example.com'
    const forwardedHeaders = {
      Origin: publicOrigin,
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'framekit.example.com'
    }

    try {
      for (const key of environmentKeys) delete process.env[key]
      process.env.FRAMEKIT_DATABASE_PATH = path.join(temporaryRoot, 'framekit.sqlite')
      process.env.FRAMEKIT_ADMIN_USERNAME = 'adapter-admin'
      process.env.FRAMEKIT_ADMIN_PASSWORD = 'adapter-test-password'
      Object.assign(process.env, { NODE_ENV: 'production' })

      const loginResponse = await POST(new NextRequest(`${internalOrigin}/api/framekit/login`, {
        method: 'POST',
        headers: { ...forwardedHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'adapter-admin', password: 'adapter-test-password' })
      }))
      expect(loginResponse.status).toBe(200)
      expect(await loginResponse.json()).toMatchObject({ username: 'adapter-admin', role: 'admin' })

      const setCookie = loginResponse.headers.get('set-cookie')
      expect(setCookie).toMatch(/^framekit_session=[A-Za-z0-9_-]{43};/)
      if (setCookie === null) throw new Error('Expected login session cookie')

      const patchResponse = await PATCH(new NextRequest(`${internalOrigin}/api/framekit/account`, {
        method: 'PATCH',
        headers: {
          ...forwardedHeaders,
          Cookie: setCookie.split(';', 1)[0],
          'content-type': 'application/json'
        },
        body: JSON.stringify({ username: 'adapter-renamed' })
      }))
      expect(patchResponse.status).toBe(200)
      expect(await patchResponse.json()).toMatchObject({ username: 'adapter-renamed', role: 'admin' })
    } finally {
      for (const key of environmentKeys) {
        const value = originalEnvironment[key]
        if (value === undefined) delete process.env[key]
        else (process.env as Record<string, string>)[key] = value
      }
      await rm(temporaryRoot, { recursive: true, force: true })
    }
  })
})
