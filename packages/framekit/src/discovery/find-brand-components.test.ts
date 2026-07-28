// @vitest-environment node

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { findBrandComponents } from './find-brand-components'

describe('findBrandComponents', () => {
  it('discovers nested components and extracts their README description', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-brand-'))

    try {
      const component = path.join(root, 'people', 'person-quote')
      await mkdir(component, { recursive: true })
      await writeFile(path.join(component, 'component.tsx'), 'export function PersonQuote() { return null }')
      await writeFile(path.join(component, 'preview.tsx'), 'export default function Preview() { return null }')
      await writeFile(path.join(component, 'README.md'), '# Person quote\n\nReusable quote block for a person-led message.\n\n## Use when\n\nUse it for editorial statements.')

      await expect(findBrandComponents(root)).resolves.toEqual([{
        slug: 'people/person-quote',
        title: 'Person Quote',
        segments: ['people', 'person-quote'],
        absolutePath: component,
        description: 'Reusable quote block for a person-led message.',
      }])
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('returns an empty catalog when src/brand does not exist', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-brand-empty-'))

    try {
      await expect(findBrandComponents(path.join(root, 'brand'))).resolves.toEqual([])
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('requires a preview and README for every component', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-brand-contract-'))

    try {
      const component = path.join(root, 'identity', 'logo')
      await mkdir(component, { recursive: true })
      await writeFile(path.join(component, 'component.tsx'), '')

      await expect(findBrandComponents(root)).rejects.toThrow(`Falta preview.tsx en: ${component}`)

      await writeFile(path.join(component, 'preview.tsx'), '')
      await expect(findBrandComponents(root)).rejects.toThrow(`Falta README.md en: ${component}`)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
