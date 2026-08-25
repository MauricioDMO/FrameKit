import type { TemplateDataValidationError } from '../core/validation'
import type { EditorMessages } from './types'

export function translateValidationError(error: TemplateDataValidationError, messages: EditorMessages) {
  switch (error.code) {
    case 'required': return messages.errorRequired
    case 'invalid_number': return messages.errorInvalidNumber
    case 'number_too_small': return messages.errorNumberTooSmall.replace('{min}', String(error.min ?? ''))
    case 'number_too_large': return messages.errorNumberTooLarge.replace('{max}', String(error.max ?? ''))
    case 'text_too_short': return messages.errorTextTooShort.replace('{minLength}', String(error.minLength ?? ''))
    case 'text_too_long': return messages.errorTextTooLong.replace('{maxLength}', String(error.maxLength ?? ''))
    case 'invalid_color': return messages.errorInvalidColor
  }
}
