import type { TemplateMeta } from '@mauriciodmo/framekit'

const validMeta: TemplateMeta = {
  title: 'Valid template',
  description: 'A description',
  marketingDescription: 'A communication goal',
  tags: ['social'],
}

void validMeta

// @ts-expect-error title is required
const missingTitle: TemplateMeta = { description: 'Missing title' }

// @ts-expect-error description must be a string
const invalidDescription: TemplateMeta = { title: 'Invalid', description: 1 }

// @ts-expect-error marketingDescription must be a string
const invalidMarketingDescription: TemplateMeta = { title: 'Invalid', marketingDescription: 1 }

// @ts-expect-error tags must be an array of strings
const invalidTags: TemplateMeta = { title: 'Invalid', tags: [1] }

// @ts-expect-error unsupported metadata properties are rejected
const unsupportedProperty: TemplateMeta = { title: 'Invalid', revision: 1 }

void missingTitle
void invalidDescription
void invalidMarketingDescription
void invalidTags
void unsupportedProperty
