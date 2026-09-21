import { isPlainObject } from '@/core/validation/utils'

import { validateChoiceField } from './kinds/choice'
import { validateCommonField } from './common'
import { validateImageField } from './kinds/image'
import { validateNumberField } from './kinds/number'
import { validatePrimitiveField } from './kinds/primitive'
import { validateTextField } from './kinds/text'

export function validateFields (fields: unknown): string | undefined {
  if (!isPlainObject(fields)) {
    return 'fields must be a plain object'
  }

  for (const [key, value] of Object.entries(fields)) {
    const error = validateFieldDescriptor(key, value)
    if (error !== undefined) return error
  }
}

function validateFieldDescriptor (key: string, value: unknown): string | undefined {
  const field = validateCommonField(key, value)
  if (typeof field === 'string') return field

  switch (field.kind) {
    case 'choice':
      return validateChoiceField(key, field)
    case 'boolean':
    case 'color':
      return validatePrimitiveField(key, field)
    case 'number':
      return validateNumberField(key, field)
    case 'image':
      return validateImageField(key, field)
    case 'text':
      return validateTextField(key, field)
  }
}
