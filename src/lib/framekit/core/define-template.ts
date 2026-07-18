import type {
  NoLanguageFields,
  TemplateBase,
  TemplateContent,
  TemplateDefinition,
  TemplateFields,
  TemplateInput,
  TemplateRenderProps,
} from '../types'
import type { ReactNode } from 'react'

import { validateTemplateBase, validateTemplateDefinition } from './validation'

function assertValid(result: { success: true } | { success: false; error: string }): void {
  if (!result.success) throw new Error(result.error)
}

export function defineTemplateBase<
  const Fields extends TemplateFields,
  const Content extends TemplateContent<Fields>,
  const Width extends number,
  const Height extends number,
>(
  definition: TemplateInput<Fields, Content, Width, Height> & NoLanguageFields<Fields>,
): TemplateBase<Fields, Content, Width, Height> {
  assertValid(validateTemplateBase(definition))
  return definition
}

export function defineTemplate<
  const Fields extends TemplateFields,
  const Content extends TemplateContent<Fields>,
  const Width extends number,
  const Height extends number,
>(
  definition: TemplateInput<Fields, Content, Width, Height> & {
    render(props: TemplateRenderProps<TemplateBase<Fields, Content, Width, Height>>): ReactNode
  } & NoLanguageFields<Fields>,
): TemplateDefinition<Fields, Content, Width, Height> {
  assertValid(validateTemplateDefinition(definition))
  return definition
}
