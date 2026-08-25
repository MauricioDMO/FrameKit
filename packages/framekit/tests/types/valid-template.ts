import { defineTemplate, field } from '@mauriciodmo/framekit'
import type { InferTemplateData, TemplateRenderProps } from '@mauriciodmo/framekit'

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
    alignment: field.choice({
      label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    }),
    showLogo: field.boolean({ label: 'Show logo' }),
  },
  content: {
    moon: { title: 'Oferta', showLogo: true },
    fjord: { title: 'Offer', showLogo: false },
  },
  variants: { default: 'moon', labels: { moon: 'Lunar', fjord: 'Fjordic' } },
  render({ data, variant, width, height }) {
    const title: string = data.title
    const alignment: 'left' | 'center' | 'right' = data.alignment
    const showLogo: boolean = data.showLogo
    const variantKey: 'moon' | 'fjord' = variant
    const dimension: number = width + height

    // @ts-expect-error data keys come from fields
    String(data.missing)

    void title
    void alignment
    void showLogo
    void variantKey
    void dimension
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
  { title: string; accentColor: string; alignment: 'left' | 'center' | 'right'; showLogo: boolean }
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

void (null as unknown as DataAssertion)
void (null as unknown as PropsAssertion)
void (null as unknown as WidthAssertion)
void (null as unknown as HeightAssertion)
