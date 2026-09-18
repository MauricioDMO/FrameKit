import { expect, test } from '@playwright/test'

const endpoint = '/api/framekit/images/render'
const template = 'redes-sociales/instagram/promocion-cuadrada'
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const origin = 'http://localhost:3000'

test('renders a PNG through the authenticated image API', async ({ request }) => {
  const removedEndpoint = await request.post('/api/v1/images', {
    data: { template }
  })
  expect(removedEndpoint.status()).toBe(404)

  const unauthorized = await request.post(endpoint, {
    data: { template }
  })
  expect(unauthorized.status()).toBe(401)
  await expect(unauthorized.json()).resolves.toMatchObject({ error: 'unauthorized' })

  const login = await request.post('/api/framekit/login', {
    headers: { origin },
    data: { username: 'admin', password: 'framekit-e2e-password' }
  })
  expect(login.status()).toBe(200)
  const sessionCookie = login.headers()['set-cookie']?.split(';', 1)[0]
  if (!sessionCookie) throw new Error('Session cookie is unavailable')

  const sessionResponse = await request.post(endpoint, {
    headers: { cookie: sessionCookie, origin },
    data: { template }
  })
  expect(sessionResponse.status()).toBe(200)
  expect(sessionResponse.headers()['content-type']).toBe('image/png')

  const tokenResponse = await request.post('/api/framekit/tokens', {
    headers: { cookie: sessionCookie, origin },
    data: { name: 'E2E image token' }
  })
  expect(tokenResponse.status()).toBe(201)
  const tokenBody = await tokenResponse.json() as { token?: unknown }
  if (typeof tokenBody.token !== 'string') throw new Error('API token is unavailable')

  const invalidBearer = await request.post(endpoint, {
    headers: { authorization: 'Bearer invalid', cookie: sessionCookie, origin },
    data: { template }
  })
  expect(invalidBearer.status()).toBe(401)

  const response = await request.post(endpoint, {
    headers: { authorization: `Bearer ${tokenBody.token}` },
    data: { template }
  })

  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toBe('image/png')
  expect(response.headers()['cache-control']).toBe('no-store')
  expect(response.headers()['x-content-type-options']).toBe('nosniff')

  const png = await response.body()
  expect(png.subarray(0, pngSignature.length)).toEqual(pngSignature)
  expect(png.toString('ascii', 12, 16)).toBe('IHDR')
  expect(png.readUInt32BE(16)).toBe(1440)
  expect(png.readUInt32BE(20)).toBe(1440)
})
