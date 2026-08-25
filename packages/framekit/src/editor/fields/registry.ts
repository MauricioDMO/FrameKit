import type { ComponentType } from 'react'

import { ColorField } from './components/color-field'
import { NumberField } from './components/number-field'
import { TextField } from './components/text-field'
import { ImageField } from './components/image-field'
import { ChoiceField } from './components/choice-field'
import { BooleanField } from './components/boolean-field'
import type { EditorFieldProps } from '../types'

export const fieldComponents = {
  text: TextField,
  color: ColorField,
  number: NumberField,
  image: ImageField,
  choice: ChoiceField,
  boolean: BooleanField,
} satisfies Record<string, ComponentType<EditorFieldProps>>
