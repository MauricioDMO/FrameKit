import type {
  NoLanguageFields,
  TemplateBase,
  TemplateContent,
  TemplateDefinition,
  TemplateFields,
  TemplateMeta,
  TemplateInput,
  TemplateRenderProps,
  TemplateVariants,
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
  const Meta extends TemplateMeta,
  const Variants extends TemplateVariants,
>(
  definition: TemplateInput<Fields, Content, Width, Height, Meta, Variants> & NoLanguageFields<Fields>,
): TemplateBase<Fields, Content, Width, Height, Meta, Variants> {
  assertValid(validateTemplateBase(definition))
  return definition
}

export function defineTemplate<
  const Fields extends TemplateFields,
  const Content extends TemplateContent<Fields>,
  const Width extends number,
  const Height extends number,
  const Meta extends TemplateMeta,
  const Variants extends TemplateVariants,
>(
  definition: TemplateInput<Fields, Content, Width, Height, Meta, Variants> & {
    render(props: TemplateRenderProps<TemplateBase<Fields, Content, Width, Height, Meta, Variants>>): ReactNode
  } & NoLanguageFields<Fields>,
): TemplateDefinition<Fields, Content, Width, Height, Meta, Variants> {
  assertValid(validateTemplateDefinition(definition))
  return definition
}
