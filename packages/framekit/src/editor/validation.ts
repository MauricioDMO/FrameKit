import type { TemplateDataValidationError } from '../core/validation'
import type { EditorMessages } from './types'

export function translateValidationError(error: TemplateDataValidationError, messages: EditorMessages) {
  switch (error.code) {
    case 'required': return messages.errorRequired
    case 'invalid_number': return messages.errorInvalidNumber
    case 'number_too_small': return messages.errorNumberTooSmall.replace('{min}', String(error.min ?? ''))
    case 'number_too_large': return messages.errorNumberTooLarge.replace('{max}', String(error.max ?? ''))
    case 'invalid_url': return messages.errorInvalidUrl
  }
}
