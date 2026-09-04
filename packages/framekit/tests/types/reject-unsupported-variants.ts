import { defineTemplate, defineTemplateBase } from '@mauriciodmo/framekit'
import type { TemplateVariants } from '@mauriciodmo/framekit'

const unsupported: TemplateVariants = {
  default: 'en',
  // @ts-expect-error mode is not part of the variant contract
  mode: 'language',
}

void unsupported

defineTemplate({
  meta: { title: 'Invalid variant property' },
  width: 100,
  height: 100,
  fields: {},
  content: { en: {}, es: {} },
  variants: {
    default: 'en',
    // @ts-expect-error unsupported variant properties are rejected by the factory
    mode: 'language',
  },
  render: () => null,
})

defineTemplateBase({
  meta: { title: 'Invalid variant property' },
  width: 100,
  height: 100,
  fields: {},
  content: { en: {} },
  variants: {
    default: 'en',
    // @ts-expect-error unsupported variant properties are rejected by the base factory
    fallback: 'en',
  },
})

defineTemplate({
  meta: { title: 'Invalid variant label' },
  width: 100,
  height: 100,
  fields: {},
  content: { en: {}, es: {} },
  variants: {
    default: 'en',
    labels: {
      en: 'English',
      // @ts-expect-error labels must name a content variant
      fr: 'French',
    },
  },
  render: () => null,
})

defineTemplate({
  meta: { title: 'Invalid default variant' },
  width: 100,
  height: 100,
  fields: {},
  content: { en: {} },
  variants: {
    // @ts-expect-error default must name a content variant
    default: 'es',
  },
  render: () => null,
})
