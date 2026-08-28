import type { NumberFieldDescriptor } from '../../types'

export function number({ step = 1, control = 'input', ...params }: Omit<NumberFieldDescriptor, 'kind'>): NumberFieldDescriptor {
  return Object.freeze({
    ...params,
    kind: 'number',
    step,
    control,
  })
}
