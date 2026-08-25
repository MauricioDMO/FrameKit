import { text } from './text'
import { color } from './color'
import { number } from './number'
import { image } from './image'
import { choice } from './choice'

export const field = { text, color, number, image, choice }

export type {
  TextFieldDescriptor,
  ColorFieldDescriptor,
  NumberFieldDescriptor,
  ImageFieldDescriptor,
  ChoiceFieldDescriptor,
} from '../../types'
