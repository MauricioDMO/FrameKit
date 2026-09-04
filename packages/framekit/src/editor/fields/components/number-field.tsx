import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import { validateNumberValue } from '../../../core/validation/data'
import { controlClass } from '../shared'
import type { EditorFieldProps } from '../../types'

function decimalPlaces(value: number): number {
  const [coefficient, exponentText] = value.toString().toLowerCase().split('e')
  const fractionLength = coefficient.includes('.') ? coefficient.length - coefficient.indexOf('.') - 1 : 0
  return Math.max(0, fractionLength - Number(exponentText ?? 0))
}

function normalizeSliderValue(value: number, min: number | undefined, max: number | undefined, step: number): number {
  const lower = min ?? 0
  const upper = max ?? 100
  const bounded = Math.min(upper, Math.max(lower, value))
  const offset = bounded - lower
  const normalized = Number.isFinite(offset)
    ? lower + Math.round(offset / step) * step
    : bounded
  const clamped = Math.min(upper, Math.max(lower, normalized))
  const precision = Math.max(decimalPlaces(lower), decimalPlaces(step))
  return precision <= 100 ? Number(clamped.toFixed(precision)) : clamped
}

export function NumberField({ field, value, onChange, error, onValidationError }: EditorFieldProps) {
  const control = field.control ?? 'input'
  const committedValue = typeof value === 'number' && Number.isFinite(value) ? value : undefined
  const sliderValue = committedValue ?? field.min ?? 0
  const [draftValue, setDraftValue] = useState(() => committedValue === undefined ? '' : String(committedValue))
  const committedValueRef = useRef(committedValue)

  useEffect(() => {
    if (committedValueRef.current === committedValue) return
    committedValueRef.current = committedValue
    setDraftValue(committedValue === undefined ? '' : String(committedValue))
  }, [committedValue])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (control === 'input') setDraftValue(event.currentTarget.value)
    const nextValue = event.currentTarget.valueAsNumber
    const validationError = validateNumberValue(nextValue, field)
    if (validationError) {
      onValidationError?.(validationError)
      return
    }

    committedValueRef.current = nextValue
    onValidationError?.()
    onChange(nextValue)
  }

  if (control === 'slider') {
    const normalizedSliderValue = normalizeSliderValue(sliderValue, field.min, field.max, field.step ?? 1)
    return (
      <div className="flex items-center gap-3">
        <input
          id={field.key}
          name={field.key}
          type="range"
          aria-label={field.label}
          aria-invalid={error !== undefined}
          aria-describedby={error ? `${field.key}-error` : undefined}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          value={normalizedSliderValue}
          onChange={handleChange}
          className="min-w-0 flex-1 accent-[#39775f] focus-visible:ring-3 focus-visible:ring-[#39775f]/20 focus-visible:outline-none"
        />
        <output htmlFor={field.key} className="min-w-12 text-right text-sm font-bold tabular-nums text-[#59665f] dark:text-[#b8c8be]">{normalizedSliderValue}</output>
      </div>
    )
  }

  return (
    <input
      id={field.key}
      name={field.key}
      type="number"
      required={field.required}
      aria-label={field.label}
      aria-required={field.required}
      aria-invalid={error !== undefined}
      aria-describedby={error ? `${field.key}-error` : undefined}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
      step={field.step ?? 1}
      value={draftValue}
      onChange={handleChange}
      className={controlClass}
    />
  )
}
