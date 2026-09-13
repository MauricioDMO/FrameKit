import { expect, test } from '@playwright/test'

const endpoint = '/api/v1/images'
const template = 'redes-sociales/instagram/promocion-cuadrada'
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

test('renders a PNG through the authenticated image API', async ({ request }) => {
  const unauthorized = await request.post(endpoint, {
    data: { template }
  })
  expect(unauthorized.status()).toBe(401)
  await expect(unauthorized.json()).resolves.toMatchObject({ error: 'unauthorized' })

  const response = await request.post(endpoint, {
    headers: { authorization: 'Bearer framekit-e2e-api-key' },
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
