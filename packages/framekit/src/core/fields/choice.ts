import type { ChoiceFieldDescriptor } from '../../types'

type ChoiceOption = { value: string; label: string }

export function choice<const Options extends readonly ChoiceOption[]>(params: {
  label: string
  options: Options
  defaultValue: Options[number]['value']
}): ChoiceFieldDescriptor<Options[number]['value']> {
  const options = Object.freeze(params.options.map(({ value, label }) => Object.freeze({ value, label })))
  return Object.freeze({ kind: 'choice', label: params.label, options, defaultValue: params.defaultValue }) as ChoiceFieldDescriptor<Options[number]['value']>
}
