import { afterEach, describe, expect, it, vi } from 'vitest'

import { expectCode, pngBase64, pngDataUrl, prepare } from './fixtures'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('image input validation', () => {
  it('normalizes strict raster data URLs', async () => {
    await expect(prepare({ commonImage: `data:IMAGE/PNG;BASE64,${pngBase64}` })).resolves.toMatchObject({
      assets: { common: { commonImage: pngDataUrl } }
    })
  })

  it.each([
    'data:image/svg+xml;base64,PHN2Zy8+',
    'data:image/png;charset=utf-8;base64,' + pngBase64,
    'data:image/png;base64,%' + pngBase64.slice(1),
    'data:image/png;base64,AAAA===',
    'data:image/png;base64,AAAA'
  ])('rejects unsupported or malformed data URLs: %s', async (value) => {
    await expectCode(prepare({ commonImage: value }), 'unsupported_image')
  })

  it('rejects empty data URLs as unsupported images', async () => {
    await expectCode(prepare({ commonImage: 'data:image/png;base64,' }), 'unsupported_image')
  })

  it('rejects an explicitly supplied empty image value', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expectCode(prepare({ commonImage: '' }), 'unsupported_image')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    '/assets/../secret.png',
    '/assets/%2e%2e/secret.png',
    '/assets//secret.png',
    '/assets\\secret.png',
    '/__framekit/templates/../secret.png',
    '/__framekit/private/secret.png',
    '/private/secret.png',
    '../assets/secret.png',
    '//images.example.com/secret.png',
    '/assets/secret.png?token=secret',
    '/assets/secret.png#fragment'
  ])('rejects unsafe paths: %s', async (value) => {
    await expectCode(prepare({ commonImage: value }), 'unsupported_image')
  })

  it('accepts only the two safe root-relative asset prefixes', async () => {
    await expect(prepare({
      commonImage: '/assets/images/hero.svg',
      variantImage: '/__framekit/templates/social/post/hero.webp'
    })).resolves.toMatchObject({
      assets: {
        common: { commonImage: '/assets/images/hero.svg' },
        variants: { en: { variantImage: '/__framekit/templates/social/post/hero.webp' } }
      }
    })
  })

  it.each([
    'file:///tmp/hero.png',
    'https://images.example.com:444/hero.png',
    'https://@images.example.com/hero.png',
    'https://user:password@images.example.com/hero.png',
    'https://images.example.com/hero.png#fragment',
    'https://127.0.0.1/hero.png',
    '//images.example.com/hero.png'
  ])('rejects unsafe remote URL forms: %s', async (value) => {
    await expectCode(prepare({ commonImage: value }), 'unsupported_image')
  })

  it('maps an initial HTTP image to the blocked-host error before fetching', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expectCode(prepare({ commonImage: 'http://images.example.com/hero.png' }), 'image_host_not_allowed')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    'https://cdn.images.example.com/hero.png',
    'https://images.example.com.evil/hero.png'
  ])('enforces exact remote host policy: %s', async (value) => {
    await expectCode(prepare({ commonImage: value }), 'image_host_not_allowed')
  })
})
