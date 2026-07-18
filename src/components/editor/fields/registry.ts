import type { ComponentType } from 'react'

import { ColorField } from './components/color-field'
import { NumberField } from './components/number-field'
import { TextareaField } from './components/textarea-field'
import { TextField } from './components/text-field'
import { UrlField } from './components/url-field'
import type { EditorFieldProps } from './types'

export const fieldComponents = {
  text: TextField,
  textarea: TextareaField,
  url: UrlField,
  color: ColorField,
  number: NumberField,
} satisfies Record<string, ComponentType<EditorFieldProps>>
