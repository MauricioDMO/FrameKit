import { startTransition, useEffect, useRef, useState } from 'react'

import { isValidColor } from '../../../core/validation'
import { controlClass } from '../shared'
import type { EditorFieldProps } from '../../types'

export function ColorField({ field, value, onChange, error }: EditorFieldProps) {
  const normalizedValue = value.trim()
  const externalPickerValue = isValidColor(normalizedValue) ? normalizedValue : '#000000'
  const [pickerState, setPickerState] = useState(() => ({ externalValue: externalPickerValue, pickerValue: externalPickerValue }))
  const pendingValueRef = useRef<string | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const hexValue = value.replace(/^#+/, '')
  const pickerId = `${field.key}-picker`

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
  }, [])

  if (pickerState.externalValue !== externalPickerValue) {
    setPickerState({ externalValue: externalPickerValue, pickerValue: externalPickerValue })
  }

  function cancelPendingPickerUpdate() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    pendingValueRef.current = null
  }

  function schedulePickerUpdate(nextValue: string) {
    pendingValueRef.current = nextValue
    if (timeoutRef.current !== null) return

    // ponytail: preview capped at ~30 fps to keep color dragging responsive.
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null
      const pendingValue = pendingValueRef.current
      pendingValueRef.current = null
      if (pendingValue !== null) startTransition(() => onChange(pendingValue))
    }, 32)
  }

  return (
    <div className="flex max-w-full items-center gap-2">
      <input id={pickerId} name={field.key} type="color" required={field.required} aria-required={field.required} aria-invalid={error !== undefined} value={pickerState.pickerValue} onChange={(event) => {
        const nextValue = event.target.value
        setPickerState({ externalValue: externalPickerValue, pickerValue: nextValue })
        schedulePickerUpdate(nextValue)
      }} className="sr-only" />
      <label htmlFor={pickerId} aria-label={`Seleccionar ${field.label}`} className="h-10 w-16 shrink-0 cursor-pointer rounded-xl border border-[#d6d5ce] p-1 dark:border-white/15">
        <span aria-hidden="true" className="block size-full rounded-lg" style={{ backgroundColor: pickerState.pickerValue }} />
      </label>
      <div className={`${controlClass} flex h-10 items-center gap-1 px-3 py-0`}>
        <span aria-hidden="true" className="text-base text-[#59665f] dark:text-[#b8c8be]">#</span>
        <input name={`${field.key}-value`} type="text" required={field.required} aria-label={field.label} aria-required={field.required} aria-invalid={error !== undefined} maxLength={6} pattern="[\da-fA-F]{6}" value={hexValue} onChange={(event) => {
          cancelPendingPickerUpdate()
          onChange(`#${event.target.value.replace(/^#+/, '')}`)
        }} className="w-full min-w-0 flex-1 bg-transparent text-base outline-none" />
      </div>
    </div>
  )
}
