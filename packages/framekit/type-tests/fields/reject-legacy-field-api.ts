// @ts-expect-error the plural field namespace was removed
import { field, fields } from '@mauriciodmo/framekit'

// @ts-expect-error textarea is not a canonical field kind
export const legacyTextField = field.textarea

export const legacyFields = fields
