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

const invalidDescription: TemplateMeta = {
  title: 'Invalid',
  // @ts-expect-error description must be a string
  description: 1,
}

const invalidMarketingDescription: TemplateMeta = {
  title: 'Invalid',
  // @ts-expect-error marketingDescription must be a string
  marketingDescription: 1,
}

const invalidTags: TemplateMeta = {
  title: 'Invalid',
  // @ts-expect-error tags must be an array of strings
  tags: [1],
}

const unsupportedProperty: TemplateMeta = {
  title: 'Invalid',
  // @ts-expect-error unsupported metadata properties are rejected
  revision: 1,
}

void missingTitle
void invalidDescription
void invalidMarketingDescription
void invalidTags
void unsupportedProperty
