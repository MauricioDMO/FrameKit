import { text } from './text'
import { color } from './color'
import { number } from './number'
import { image } from './image'
import { choice } from './choice'
import { boolean } from './boolean'

export const field = { text, color, number, image, choice, boolean }

export type {
  TextFieldDescriptor,
  ColorFieldDescriptor,
  NumberFieldDescriptor,
  ImageFieldDescriptor,
  ChoiceFieldDescriptor,
  BooleanFieldDescriptor,
} from '../../types'
