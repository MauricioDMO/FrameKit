import { defineTemplate, fields } from '@/lib/framekit'
import type { InferTemplateData, TemplateRenderProps } from '@/lib/framekit'

export const template = defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Título', required: true }),
    accentColor: fields.color({ label: 'Color', defaultValue: '#173d31' }),
  },
  content: {
    moon: { language: 'Lunar', title: 'Oferta' },
    fjord: { language: 'Fjordic', title: 'Offer' },
  },
  render({ data, locale, width, height }) {
    const title: string = data.title
    const localeKey: 'moon' | 'fjord' = locale
    const dimension: number = width + height

    // @ts-expect-error data keys come from fields
    String(data.missing)

    void title
    void localeKey
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
  { title: string; accentColor: string }
>>
type PropsAssertion = Expect<Equal<
  TemplateRenderProps<typeof template>['locale'],
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
