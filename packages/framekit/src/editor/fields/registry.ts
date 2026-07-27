import type { ComponentType } from 'react'

import { ColorField } from './components/color-field'
import { NumberField } from './components/number-field'
import { TextareaField } from './components/textarea-field'
import { TextField } from './components/text-field'
import { ImageField } from './components/image-field'
import type { EditorFieldProps } from '../types'

export const fieldComponents = {
  text: TextField,
  textarea: TextareaField,
  color: ColorField,
  number: NumberField,
  image: ImageField,
} satisfies Record<string, ComponentType<EditorFieldProps>>
