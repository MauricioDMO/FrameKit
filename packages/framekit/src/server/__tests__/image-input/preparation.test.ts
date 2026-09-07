import { afterEach, describe, expect, it, vi } from 'vitest'

import { prepareRenderInputs as facadePrepareRenderInputs } from '@/server'
import { prepareRenderInputs } from '@/server/image-input/index'

import { assets, definition, expectCode, pngDataUrl, prepare } from './fixtures'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('prepareRenderInputs', () => {
  it('is the only preparation boundary exposed by the server facade', () => {
    expect(facadePrepareRenderInputs).toBe(prepareRenderInputs)
  })

  it('applies common and selected-variant image precedence without mutating assets', async () => {
    const inputAssets = assets()
    const inputData = {
      commonImage: pngDataUrl,
      variantImage: '/assets/edited-variant.png',
      title: 'Edited title'
    }

    const result = await prepareRenderInputs({
      definition,
      variant: 'en',
      data: inputData,
      assets: inputAssets,
      allowedImageHosts: new Set()
    })

    expect(result.edits).toEqual({ title: 'Edited title' })
    expect(result.assets.common).toEqual({ commonImage: pngDataUrl })
    expect(result.assets.variants.en).toEqual({ variantImage: '/assets/edited-variant.png' })
    expect(result.assets.variants.es).toBe(inputAssets.variants.es)
    expect(result.assets.common).not.toBe(inputAssets.common)
    expect(result.assets.variants).not.toBe(inputAssets.variants)
    expect(result.assets.variants.en).not.toBe(inputAssets.variants.en)
    expect(inputAssets).toEqual(assets())
    expect(inputData).toEqual({
      commonImage: pngDataUrl,
      variantImage: '/assets/edited-variant.png',
      title: 'Edited title'
    })
  })

  it('treats omitted data as empty plain data and retains non-image values', async () => {
    await expect(prepare(undefined)).resolves.toEqual({
      edits: {},
      assets: assets()
    })

    await expect(prepare({ title: 12, count: 'not-a-number' })).resolves.toMatchObject({
      edits: { title: 12, count: 'not-a-number' }
    })
  })

  it.each([null, [], new Date(), 'data'])('rejects non-plain data: %s', async (data) => {
    await expectCode(prepare(data), 'invalid_template_data')
  })

  it('rejects unknown keys before fetching or changing the manifest', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const inputAssets = assets()

    await expectCode(prepare({ unknown: 'https://images.example.com/private?token=secret' }, {
      assets: inputAssets
    }), 'invalid_template_data')

    expect(fetchMock).not.toHaveBeenCalled()
    expect(inputAssets).toEqual(assets())
  })
})
