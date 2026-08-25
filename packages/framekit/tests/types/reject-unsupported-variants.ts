import type { TemplateVariants } from '@mauriciodmo/framekit'

const unsupported: TemplateVariants = {
  default: 'en',
  // @ts-expect-error mode is not part of the variant contract
  mode: 'language',
}

void unsupported
