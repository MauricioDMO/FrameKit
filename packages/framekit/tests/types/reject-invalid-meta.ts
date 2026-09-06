import type { TemplateMeta } from '@mauriciodmo/framekit'

export const validMeta: TemplateMeta = {
  title: 'Valid template',
  description: 'A description',
  marketingDescription: 'A communication goal',
  tags: ['social']
}

// @ts-expect-error title is required
export const missingTitle: TemplateMeta = { description: 'Missing title' }

export const invalidDescription: TemplateMeta = {
  title: 'Invalid',
  // @ts-expect-error description must be a string
  description: 1
}

export const invalidMarketingDescription: TemplateMeta = {
  title: 'Invalid',
  // @ts-expect-error marketingDescription must be a string
  marketingDescription: 1
}

export const invalidTags: TemplateMeta = {
  title: 'Invalid',
  // @ts-expect-error tags must be an array of strings
  tags: [1]
}

export const unsupportedProperty: TemplateMeta = {
  title: 'Invalid',
  // @ts-expect-error unsupported metadata properties are rejected
  revision: 1
}
