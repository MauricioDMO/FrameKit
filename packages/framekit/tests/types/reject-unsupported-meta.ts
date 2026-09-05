import { defineTemplate, field } from '@mauriciodmo/framekit'

defineTemplate({
  meta: {
    title: 'Invalid template',
    // @ts-expect-error revision is not part of template metadata
    revision: 1,
  },
  width: 1080,
  height: 1080,
  fields: { title: field.text({ label: 'Title' }) },
  content: { en: { title: 'Test' } },
  variants: { default: 'en' },
  render: () => null,
})

defineTemplate({
  meta: {
    title: 'Invalid template',
    // @ts-expect-error status is not part of template metadata
    status: 'draft',
  },
  width: 1080,
  height: 1080,
  fields: { title: field.text({ label: 'Title' }) },
  content: { en: { title: 'Test' } },
  variants: { default: 'en' },
  render: () => null,
})

defineTemplate({
  meta: {
    title: 'Invalid template',
    // @ts-expect-error keywords is not part of template metadata
    keywords: ['social'],
  },
  width: 1080,
  height: 1080,
  fields: { title: field.text({ label: 'Title' }) },
  content: { en: { title: 'Test' } },
  variants: { default: 'en' },
  render: () => null,
})

defineTemplate({
  meta: {
    title: 'Invalid template',
    // @ts-expect-error order is not part of template metadata
    order: 1,
  },
  width: 1080,
  height: 1080,
  fields: { title: field.text({ label: 'Title' }) },
  content: { en: { title: 'Test' } },
  variants: { default: 'en' },
  render: () => null,
})
