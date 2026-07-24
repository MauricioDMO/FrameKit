import { text } from './text'
import { textarea } from './textarea'
import { color } from './color'
import { url } from './url'
import { number } from './number'
import { image } from './image'

export const fields = { text, textarea, color, url, number, image }

export type {
  TextFieldDescriptor,
  TextareaFieldDescriptor,
  ColorFieldDescriptor,
  UrlFieldDescriptor,
  NumberFieldDescriptor,
  ImageFieldDescriptor,
} from '../../types'
