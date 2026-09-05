import { defineTemplate, field } from '@mauriciodmo/framekit'
import type { InferTemplateData, TemplateAssetManifest, TemplateRenderProps } from '@mauriciodmo/framekit'

export const templateAssets = {
  common: { logo: '/images/logo.svg' },
  variants: {
    moon: { background: '/images/moon-background.png' },
    fjord: { background: '/images/fjord-background.png' },
  },
} satisfies TemplateAssetManifest

export const template = defineTemplate({
  meta: {
    title: 'Valid template',
    description: 'A valid template for type tests',
    marketingDescription: 'Present a clear offer',
    tags: ['social', 'promotion'],
  },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({ label: 'Título', required: true, minLength: 1, maxLength: 80 }),
    accentColor: field.color({ label: 'Color', defaultValue: '#173d31' }),
    image: field.image({ label: 'Image', scope: 'variant' }),
    alignment: field.choice({
      label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    }),
    count: field.number({ label: 'Count', defaultValue: 10, min: 0, max: 100, step: 5 }),
    showLogo: field.boolean({ label: 'Show logo' }),
  },
  content: {
    moon: { title: 'Oferta', image: '/images/moon.png', alignment: 'center', count: 15, showLogo: true },
    fjord: { title: 'Offer', image: '/images/fjord.png', alignment: 'left', count: 20, showLogo: false },
  },
  variants: { default: 'moon', labels: { moon: 'Lunar', fjord: 'Fjordic' } },
  render({ data, assets, variant, width, height }) {
    const title: string = data.title
    const image: string = data.image
    const alignment: 'left' | 'center' | 'right' = data.alignment
    const count: number = data.count
    const showLogo: boolean = data.showLogo
    const commonLogo: string = assets.common.logo
    const variantBackground: string = assets.variants[variant].background
    const variantKey: 'moon' | 'fjord' = variant
    const dimension: number = width + height

    // @ts-expect-error data keys come from fields
    String(data.missing)

    return null
  },
})

type Equal<Left, Right> =
  (<Type>() => Type extends Left ? 1 : 2) extends
  (<Type>() => Type extends Right ? 1 : 2)
    ? true
    : false
type Expect<Value extends true> = Value

type DataAssertion = Expect<Equal<
  InferTemplateData<typeof template>,
  { title: string; accentColor: string; image: string; alignment: 'left' | 'center' | 'right'; count: number; showLogo: boolean }
>>
type PropsAssertion = Expect<Equal<
  TemplateRenderProps<typeof template>['variant'],
  'moon' | 'fjord'
>>
type WidthAssertion = Expect<Equal<
  TemplateRenderProps<typeof template>['width'],
  1080
>>
type HeightAssertion = Expect<Equal<
  TemplateRenderProps<typeof template>['height'],
  1080
>>
