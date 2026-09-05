import { defineTemplateBase, field } from '@mauriciodmo/framekit'
import type { InferTemplateData, TemplateRenderProps } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  meta: { title: 'Extracted template' },
  width: 1200,
  height: 800,
  fields: {
    title: field.text({ label: 'Title' }),
    accentColor: field.color({ label: 'Accent' }),
    alignment: field.choice({
      label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    }),
  },
  content: {
    aurora: { title: 'Northern light', alignment: 'center' },
    desert: { title: 'Open horizon', alignment: 'left' },
  },
  variants: { default: 'aurora', labels: { aurora: 'Aurora', desert: 'Desert' } },
})

type Equal<Left, Right> =
  (<Type>() => Type extends Left ? 1 : 2) extends
  (<Type>() => Type extends Right ? 1 : 2)
    ? true
    : false
type Expect<Value extends true> = Value

type DataAssertion = Expect<Equal<
  InferTemplateData<typeof templateBase>,
  { title: string; accentColor: string; alignment: 'left' | 'center' | 'right' }
>>
type PropsAssertion = Expect<Equal<
  TemplateRenderProps<typeof templateBase>['variant'],
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
