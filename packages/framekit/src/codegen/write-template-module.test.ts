// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { findTemplates } from '../discovery/find-templates'
import { writeTemplateModule } from './write-template-module'

describe('findTemplates', () => {
  it('stops at a template and ignores its private auxiliary directories', async () => {
    const templatesRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-templates-'))

    try {
      const templateRoot = path.join(templatesRoot, 'social', 'campaign')
      await mkdir(path.join(templateRoot, 'components', 'private'), { recursive: true })
      await mkdir(path.join(templateRoot, 'helpers'), { recursive: true })
      await mkdir(path.join(templateRoot, 'assets'), { recursive: true })
      await writeFile(path.join(templateRoot, 'template.tsx'), '')
      await writeFile(path.join(templateRoot, 'definition.ts'), '')
      await writeFile(path.join(templateRoot, 'artwork.tsx'), '')
      await writeFile(path.join(templateRoot, 'components', 'private', 'template.tsx'), '')

      await expect(findTemplates(templatesRoot)).resolves.toEqual([
        {
          slug: 'social/campaign',
          title: 'Campaign',
          segments: ['social', 'campaign'],
          absolutePath: templateRoot,
        },
      ])
    } finally {
      await rm(templatesRoot, { recursive: true, force: true })
    }
  })

  it('ignores dot and underscore directories', async () => {
    const templatesRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-templates-'))

    try {
      await mkdir(path.join(templatesRoot, '.hidden', 'template'), { recursive: true })
      await mkdir(path.join(templatesRoot, '_private', 'template'), { recursive: true })
      await writeFile(path.join(templatesRoot, '.hidden', 'template', 'template.tsx'), '')
      await writeFile(path.join(templatesRoot, '_private', 'template', 'template.tsx'), '')

      await expect(findTemplates(templatesRoot)).resolves.toEqual([])
    } finally {
      await rm(templatesRoot, { recursive: true, force: true })
    }
  })

  it.each(['Uppercase', 'with_underscore', 'with space', 'conácento'])
    ('rejects invalid segment %j', async (segment) => {
      const templatesRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-templates-'))

      try {
        const templateRoot = path.join(templatesRoot, segment)
        await mkdir(templateRoot, { recursive: true })
        await writeFile(path.join(templateRoot, 'template.tsx'), '')

        await expect(findTemplates(templatesRoot)).rejects.toThrow(
          new RegExp(`Segmento inválido '${segment}'.*${templateRoot.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`),
        )
      } finally {
        await rm(templatesRoot, { recursive: true, force: true })
      }
    })
})

describe('writeTemplateModule', () => {
  it('rejects a catalog without templates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-empty-'))
    const templatesRoot = path.join(root, 'src', 'templates')

    try {
      await mkdir(templatesRoot, { recursive: true })

      await expect(writeTemplateModule({ projectRoot: root })).rejects.toThrow(
        `No se encontraron plantillas en: ${templatesRoot}`,
      )
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('generates sorted exact module output', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-registry-'))
    const templatesRoot = path.join(root, 'src', 'templates')
    const outputDirectory = path.join(root, 'src', 'generated', 'framekit')

    try {
      const firstTemplate = path.join(templatesRoot, 'social', 'campaign')
      const secondTemplate = path.join(templatesRoot, 'marketing', 'email', 'launch')
      await mkdir(path.join(firstTemplate, 'helpers'), { recursive: true })
      await mkdir(path.join(templatesRoot, 'empty', 'category'), { recursive: true })
      await mkdir(secondTemplate, { recursive: true })
      await writeFile(path.join(firstTemplate, 'template.tsx'), '')
      await writeFile(path.join(firstTemplate, 'helpers', 'template.tsx'), '')
      await writeFile(path.join(secondTemplate, 'template.tsx'), '')

      await expect(writeTemplateModule({ projectRoot: root })).resolves.toEqual([
        {
          slug: 'marketing/email/launch',
          title: 'Launch',
          segments: ['marketing', 'email', 'launch'],
          absolutePath: secondTemplate,
        },
        {
          slug: 'social/campaign',
          title: 'Campaign',
          segments: ['social', 'campaign'],
          absolutePath: firstTemplate,
        },
      ])

      await expect(readFile(path.join(outputDirectory, 'templates.ts'), 'utf8')).resolves.toBe(`/* Archivo generado automáticamente. No modificar. */

import type { TemplateDefinition } from '@mauriciodmo/framekit'

type TemplateLoader = () => Promise<{
  default: TemplateDefinition
}>

export const templates = [
  {
    slug: "marketing/email/launch",
    title: "Launch",
    segments: ["marketing","email","launch"],
    load: () => import("../../templates/marketing/email/launch/template"),
  },
  {
    slug: "social/campaign",
    title: "Campaign",
    segments: ["social","campaign"],
    load: () => import("../../templates/social/campaign/template"),
  }
] satisfies Array<{
  slug: string
  title: string
  segments: string[]
  load: TemplateLoader
}>

export const templateManifest = templates.map(
  ({ load: _, ...metadata }) => metadata,
)

export const templateRegistry: Record<string, TemplateLoader> =
  Object.fromEntries(templates.map(({ slug, load }) => [slug, load]))
`)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
