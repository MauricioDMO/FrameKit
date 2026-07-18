// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { findTemplates, generateRegistry } from './generate-template-registry.mjs'

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
          segments: ['social', 'campaign'],
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

describe('generateRegistry', () => {
  it('generates sorted exact manifest and registry output', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-registry-'))
    const templatesRoot = path.join(root, 'templates')
    const framekitDir = path.join(root, '.framekit')

    try {
      const firstTemplate = path.join(templatesRoot, 'social', 'campaign')
      const secondTemplate = path.join(templatesRoot, 'marketing', 'email', 'launch')
      await mkdir(path.join(firstTemplate, 'helpers'), { recursive: true })
      await mkdir(path.join(templatesRoot, 'empty', 'category'), { recursive: true })
      await mkdir(secondTemplate, { recursive: true })
      await writeFile(path.join(firstTemplate, 'template.tsx'), '')
      await writeFile(path.join(firstTemplate, 'helpers', 'template.tsx'), '')
      await writeFile(path.join(secondTemplate, 'template.tsx'), '')

      await expect(generateRegistry({ templatesRoot, framekitDir })).resolves.toEqual([
        {
          slug: 'marketing/email/launch',
          segments: ['marketing', 'email', 'launch'],
        },
        {
          slug: 'social/campaign',
          segments: ['social', 'campaign'],
        },
      ])

      await expect(readFile(path.join(framekitDir, 'manifest.ts'), 'utf8')).resolves.toBe(`/* Archivo generado automáticamente. No modificar. */

export const templateManifest: Array<{
  slug: string
  title: string
  segments: string[]
}> = [
  {
    slug: "marketing/email/launch",
    title: "Launch",
    segments: ["marketing","email","launch"],
  },
  {
    slug: "social/campaign",
    title: "Campaign",
    segments: ["social","campaign"],
  }
]
`)
      await expect(readFile(path.join(framekitDir, 'registry.ts'), 'utf8')).resolves.toBe(`/* Archivo generado automáticamente. No modificar. */
'use client'

import type { TemplateDefinition } from '@/lib/framekit'

export const templateRegistry: Record<string, () => Promise<{ default: TemplateDefinition }>> = {
  "marketing/email/launch": () => import("../templates/marketing/email/launch/template"),
  "social/campaign": () => import("../templates/social/campaign/template"),
}
`)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
