import { expect } from 'vitest'

import { defineTemplate, field } from '@/index'
import { ImageRenderError } from '@/server/errors'
import { prepareRenderInputs } from '@/server/image-input/index'
import type { TemplateAssetManifest } from '@/types'

export const pngBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
export const pngBase64 = Buffer.from(pngBytes).toString('base64')
export const pngDataUrl = `data:image/png;base64,${pngBase64}`

export const definition = defineTemplate({
  meta: { title: 'Server image input' },
  width: 100,
  height: 100,
  fields: {
    commonImage: field.image({ label: 'Common image', scope: 'common' }),
    variantImage: field.image({ label: 'Variant image', scope: 'variant' }),
    title: field.text({ label: 'Title' }),
    count: field.number({ label: 'Count', defaultValue: 1 })
  },
  content: { en: {}, es: {} },
  variants: { default: 'en' },
  render: () => null
})

export function assets (): TemplateAssetManifest {
  return {
    common: {
      commonImage: '/assets/common/base.png'
    },
    variants: {
      en: {
        variantImage: '/framekit/templates/en/base.png'
      },
      es: {
        variantImage: '/framekit/templates/es/base.png'
      }
    }
  }
}

export async function expectCode (promise: Promise<unknown>, code: ImageRenderError['code']): Promise<ImageRenderError> {
  const error = await promise.catch((failure: unknown) => failure)
  expect(error).toBeInstanceOf(ImageRenderError)
  expect((error as ImageRenderError).code).toBe(code)
  return error as ImageRenderError
}

export function prepare (data: unknown, options: Partial<Parameters<typeof prepareRenderInputs>[0]> = {}) {
  return prepareRenderInputs({
    definition,
    variant: 'en',
    data,
    assets: assets(),
    allowedImageHosts: new Set(['images.example.com']),
    ...options
  })
}
