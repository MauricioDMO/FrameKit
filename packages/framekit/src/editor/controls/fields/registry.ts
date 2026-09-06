import type { ComponentType } from 'react'

import { ColorField } from './color-field'
import { NumberField } from './number-field'
import { TextField } from './text-field'
import { ImageField } from './image-field'
import { ChoiceField } from './choice-field'
import { BooleanField } from './boolean-field'
import type { EditorFieldProps } from '../../types'

export const fieldComponents = {
  text: TextField,
  color: ColorField,
  number: NumberField,
  image: ImageField,
  choice: ChoiceField,
  boolean: BooleanField
} satisfies Record<string, ComponentType<EditorFieldProps>>
