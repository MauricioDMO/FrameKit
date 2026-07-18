import { text } from './text'
import { textarea } from './textarea'
import { color } from './color'
import { url } from './url'
import { number } from './number'

export const fields = { text, textarea, color, url, number }

export type {
  TextFieldDescriptor,
  TextareaFieldDescriptor,
  ColorFieldDescriptor,
  UrlFieldDescriptor,
  NumberFieldDescriptor,
} from '../../types'
