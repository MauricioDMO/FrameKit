import type { NumberFieldDescriptor, TemplateBase } from '../../types'

export type TemplateDataValidationError =
  | { code: 'required' }
  | { code: 'invalid_number' }
  | { code: 'number_too_small'; min: number }
  | { code: 'number_too_large'; max: number }
  | { code: 'invalid_step'; step: number }
  | { code: 'text_too_short'; minLength: number }
  | { code: 'text_too_long'; maxLength: number }
  | { code: 'invalid_color' }
  | { code: 'invalid_choice' }
  | { code: 'invalid_boolean' }

export function isValidColor(value: string): boolean {
  return /^#[\da-f]{6}$/i.test(value)
}

export function isValidNumberStep(value: number, min: number | undefined, step = 1): boolean {
  const base = min ?? 0
  if (!Number.isFinite(value) || !Number.isFinite(base) || !Number.isFinite(step) || step <= 0) return false

  const decimalParts = (number: number) => {
    const [coefficient, exponent] = number.toExponential().split('e')
    const coefficientDigits = coefficient[0] === '-' ? coefficient.slice(1) : coefficient
    const digits = coefficientDigits.replace('.', '')
    const integer = BigInt(digits) * (coefficient[0] === '-' ? -BigInt(1) : BigInt(1))
    return { integer, scale: Number(exponent) - (digits.length - 1) }
  }

  const valueParts = decimalParts(value)
  const baseParts = decimalParts(base)
  const stepParts = decimalParts(step)
  const powerOfTen = (exponent: number) => BigInt(10) ** BigInt(exponent)
  const commonScale = Math.min(valueParts.scale, baseParts.scale)
  const difference = valueParts.integer * powerOfTen(valueParts.scale - commonScale)
    - baseParts.integer * powerOfTen(baseParts.scale - commonScale)
  const scaleDifference = commonScale - stepParts.scale
  const numerator = scaleDifference >= 0 ? difference * powerOfTen(scaleDifference) : difference
  const denominator = scaleDifference >= 0
    ? stepParts.integer
    : stepParts.integer * powerOfTen(-scaleDifference)
  const remainder = numerator % denominator
  const absoluteRemainder = remainder < BigInt(0) ? -remainder : remainder
  const distance = absoluteRemainder < denominator - absoluteRemainder
    ? absoluteRemainder
    : denominator - absoluteRemainder

  return distance * BigInt(16_777_216) < denominator
}

export function validateNumberValue(value: unknown, field: Pick<NumberFieldDescriptor, 'min' | 'max' | 'step'>): TemplateDataValidationError | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return { code: 'invalid_number' }
  if (field.min !== undefined && value < field.min) return { code: 'number_too_small', min: field.min }
  if (field.max !== undefined && value > field.max) return { code: 'number_too_large', max: field.max }

  const step = field.step ?? 1
  if (!Number.isFinite(step) || step <= 0 || !isValidNumberStep(value, field.min, step)) {
    return { code: 'invalid_step', step }
  }
}

export function validateTemplateData(
  definition: TemplateBase,
  data: Record<string, string | number | boolean>,
): Record<string, TemplateDataValidationError> {
  const errors: Record<string, TemplateDataValidationError> = {}

  for (const [key, field] of Object.entries(definition.fields)) {
    if (field.kind === 'number') {
      const error = validateNumberValue(data[key], field)
      if (error) errors[key] = error
      continue
    }

    const value = data[key] ?? ''

    if (field.kind === 'boolean') {
      if (typeof value !== 'boolean') {
        errors[key] = { code: 'invalid_boolean' }
      }
      continue
    }

    if (field.kind === 'choice') {
      if (typeof value !== 'string' || !field.options.some((option) => option.value === value)) {
        errors[key] = { code: 'invalid_choice' }
      }
      continue
    }

    if (typeof value !== 'string') {
      errors[key] = field.kind === 'color'
        ? { code: 'invalid_color' }
        : { code: 'required' }
      continue
    }

    const trimmed = value.trim()
    const isRequired = field.required !== false

    if (field.kind === 'color') {
      if (isRequired && trimmed === '') {
        errors[key] = { code: 'required' }
        continue
      }
      if (trimmed !== '' && !isValidColor(trimmed)) {
        errors[key] = { code: 'invalid_color' }
      }
      continue
    }

    if (field.kind === 'text') {
      if (isRequired && trimmed === '') {
        errors[key] = { code: 'required' }
        continue
      }
      if (value === '') {
        continue
      }
      if (field.minLength !== undefined && value.length < field.minLength) {
        errors[key] = { code: 'text_too_short', minLength: field.minLength }
        continue
      }
      if (field.maxLength !== undefined && value.length > field.maxLength) {
        errors[key] = { code: 'text_too_long', maxLength: field.maxLength }
      }
      continue
    }

    if (isRequired && trimmed === '') {
      errors[key] = { code: 'required' }
    }
  }

  return errors
}
