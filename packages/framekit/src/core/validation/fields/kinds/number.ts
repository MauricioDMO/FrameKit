import { isValidNumberStep } from '../../data'

import type { FieldRecord } from '../common'

export function validateNumberField (key: string, field: FieldRecord): string | undefined {
  if ('required' in field) {
    return `fields.${key} cannot define required`
  }
  if (!('defaultValue' in field)) {
    return `fields.${key}.defaultValue is required`
  }
  if (typeof field.defaultValue !== 'number' || !Number.isFinite(field.defaultValue)) {
    return `fields.${key}.defaultValue must be a finite number`
  }
  if (field.control !== undefined && field.control !== 'input' && field.control !== 'slider') {
    return `fields.${key}.control must be "input" or "slider"`
  }
  if (field.min !== undefined && (typeof field.min !== 'number' || !Number.isFinite(field.min))) {
    return `fields.${key}.min must be a finite number`
  }
  if (field.max !== undefined && (typeof field.max !== 'number' || !Number.isFinite(field.max))) {
    return `fields.${key}.max must be a finite number`
  }
  if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
    return `fields.${key}.min must be less than or equal to max`
  }
  if (field.step !== undefined && (typeof field.step !== 'number' || !Number.isFinite(field.step) || field.step <= 0)) {
    return `fields.${key}.step must be a finite positive number`
  }
  if (field.control === 'slider' && (field.min === undefined || field.max === undefined)) {
    return `fields.${key}.slider requires explicit min and max`
  }
  if (field.min !== undefined && field.defaultValue < field.min) {
    return `fields.${key}.defaultValue must be greater than or equal to min`
  }
  if (field.max !== undefined && field.defaultValue > field.max) {
    return `fields.${key}.defaultValue must be less than or equal to max`
  }
  if (!isValidNumberStep(field.defaultValue, field.min, field.step ?? 1)) {
    return `fields.${key}.defaultValue must match step`
  }
}
