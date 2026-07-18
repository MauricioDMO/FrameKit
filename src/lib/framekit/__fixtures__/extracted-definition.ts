import { defineTemplateBase, fields } from '@/lib/framekit'
import type { InferTemplateData, TemplateRenderProps } from '@/lib/framekit'

export const templateBase = defineTemplateBase({
  width: 1200,
  height: 800,
  fields: {
    title: fields.text({ label: 'Title' }),
    accentColor: fields.color({ label: 'Accent' }),
  },
  content: {
    aurora: { language: 'Aurora', title: 'Northern light' },
    desert: { language: 'Desert', title: 'Open horizon' },
  },
})

type Equal<Left, Right> =
  (<Type>() => Type extends Left ? 1 : 2) extends
  (<Type>() => Type extends Right ? 1 : 2)
    ? true
    : false
type Expect<Value extends true> = Value

type DataAssertion = Expect<Equal<
  InferTemplateData<typeof templateBase>,
  { title: string; accentColor: string }
>>
type PropsAssertion = Expect<Equal<
  TemplateRenderProps<typeof templateBase>['locale'],
  'aurora' | 'desert'
>>
type WidthAssertion = Expect<Equal<
  TemplateRenderProps<typeof templateBase>['width'],
  1200
>>
type HeightAssertion = Expect<Equal<
  TemplateRenderProps<typeof templateBase>['height'],
  800
>>

void (null as unknown as DataAssertion)
void (null as unknown as PropsAssertion)
void (null as unknown as WidthAssertion)
void (null as unknown as HeightAssertion)
