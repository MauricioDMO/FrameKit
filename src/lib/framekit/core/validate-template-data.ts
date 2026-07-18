import type { TemplateDefinition } from '../types'

export function validateTemplateData(
  definition: TemplateDefinition,
  locale: string,
  data: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const [key, field] of Object.entries(definition.fields)) {
    const value = data[key] ?? ''
    const trimmed = value.trim()
    const isRequired = field.required !== false

    if (field.kind === 'number') {
      if (isRequired && trimmed === '') {
        errors[key] = 'Este campo es requerido'
        continue
      }
      if (trimmed === '') {
        continue
      }
      const num = Number(trimmed)
      if (!Number.isFinite(num)) {
        errors[key] = 'Ingresa un número válido'
        continue
      }
      if (field.min !== undefined && num < field.min) {
        errors[key] = `El valor debe ser mayor o igual a ${field.min}`
        continue
      }
      if (field.max !== undefined && num > field.max) {
        errors[key] = `El valor debe ser menor o igual a ${field.max}`
        continue
      }
      continue
    }

    if (field.kind === 'url') {
      if (isRequired && trimmed === '') {
        errors[key] = 'Este campo es requerido'
        continue
      }
      if (trimmed === '') {
        continue
      }
      const isPath = trimmed.startsWith('/')
      const isHttp = trimmed.startsWith('http:') || trimmed.startsWith('https:')
      if (!isPath && !isHttp) {
        errors[key] = 'Ingresa una URL válida'
        continue
      }
      continue
    }

    if (isRequired && trimmed === '') {
      errors[key] = 'Este campo es requerido'
    }
  }

  return errors
}
