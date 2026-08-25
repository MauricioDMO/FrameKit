import { text } from './text'
import { color } from './color'
import { number } from './number'
import { image } from './image'

export const field = { text, color, number, image }

export type {
  TextFieldDescriptor,
  ColorFieldDescriptor,
  NumberFieldDescriptor,
  ImageFieldDescriptor,
} from '../../types'
