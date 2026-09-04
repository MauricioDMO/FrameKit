import { defineTemplate, field } from '@mauriciodmo/framekit'

const alignment = field.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  defaultValue: 'center',
})

type Equal<Left, Right> =
  (<Type>() => Type extends Left ? 1 : 2) extends
  (<Type>() => Type extends Right ? 1 : 2)
    ? true
    : false
type Expect<Value extends true> = Value

type OptionValuesAssertion = Expect<Equal<
  typeof alignment.options[number]['value'],
  'left' | 'center' | 'right'
>>

field.choice({
  label: 'Alignment',
  options: [{ value: 'left', label: 'Left' }],
  // @ts-expect-error the default must be one of the declared option values
  defaultValue: 'right',
})

field.choice({
  label: 'Alignment',
  options: [{ value: 'left', label: 'Left' }],
  defaultValue: 'left',
  // @ts-expect-error choice has no required option
  required: false,
})

defineTemplate({
  meta: { title: 'Choice template' },
  width: 100,
  height: 100,
  fields: { alignment },
  content: {
    en: {
      // @ts-expect-error choice content values must match declared option values
      alignment: 'justify',
    },
  },
  variants: { default: 'en' },
  render: () => null,
})

void (null as unknown as OptionValuesAssertion)
