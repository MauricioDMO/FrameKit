import { defineTemplate, fields } from '@mauriciodmo/framekit'

defineTemplate({
  // @ts-expect-error revision is not part of template metadata
  meta: { title: 'Invalid template', revision: 1 },
  width: 1080,
  height: 1080,
  fields: { title: fields.text({ label: 'Title' }) },
  content: { en: { title: 'Test' } },
  variants: { default: 'en' },
  render() {
    return null
  },
})

defineTemplate({
  // @ts-expect-error status is not part of template metadata
  meta: { title: 'Invalid template', status: 'draft' },
  width: 1080,
  height: 1080,
  fields: { title: fields.text({ label: 'Title' }) },
  content: { en: { title: 'Test' } },
  variants: { default: 'en' },
  render() {
    return null
  },
})

defineTemplate({
  // @ts-expect-error keywords is not part of template metadata
  meta: { title: 'Invalid template', keywords: ['social'] },
  width: 1080,
  height: 1080,
  fields: { title: fields.text({ label: 'Title' }) },
  content: { en: { title: 'Test' } },
  variants: { default: 'en' },
  render() {
    return null
  },
})

defineTemplate({
  // @ts-expect-error order is not part of template metadata
  meta: { title: 'Invalid template', order: 1 },
  width: 1080,
  height: 1080,
  fields: { title: fields.text({ label: 'Title' }) },
  content: { en: { title: 'Test' } },
  variants: { default: 'en' },
  render() {
    return null
  },
})
