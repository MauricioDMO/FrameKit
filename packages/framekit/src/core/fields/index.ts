import { text } from './text'
import { textarea } from './textarea'
import { color } from './color'
import { number } from './number'
import { image } from './image'

export const fields = { text, textarea, color, number, image }

export type {
  TextFieldDescriptor,
  TextareaFieldDescriptor,
  ColorFieldDescriptor,
  NumberFieldDescriptor,
  ImageFieldDescriptor,
} from '../../types'
