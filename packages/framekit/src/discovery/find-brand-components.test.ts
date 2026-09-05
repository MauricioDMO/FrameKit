// @vitest-environment node

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { findBrandComponents } from './find-brand-components'

async function withTempDirectory<T>(prefix: string, callback: (root: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix))
  try {
    return await callback(root)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

describe('findBrandComponents', () => {
  it('discovers a nested component and extracts its first README paragraph', () => withTempDirectory('framekit-brand-', async (root) => {
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
  }))

  it('returns no components when the brand directory does not exist', () => withTempDirectory('framekit-brand-empty-', async (root) => {
    await expect(findBrandComponents(path.join(root, 'brand'))).resolves.toEqual([])
  }))

  it('ignores files and directories prefixed with . or _', () => withTempDirectory('framekit-brand-filter-', async (root) => {
    const component = path.join(root, 'visible', 'brand-card')
    await mkdir(component, { recursive: true })
    await writeFile(path.join(component, 'component.tsx'), '')
    await writeFile(path.join(component, 'preview.tsx'), '')
    await writeFile(path.join(component, 'README.md'), 'Visible brand card.')
    await writeFile(path.join(root, 'not-a-component.txt'), '')

    for (const ignoredDirectory of ['.hidden', '_internal']) {
      const ignoredComponent = path.join(root, ignoredDirectory, 'broken')
      await mkdir(ignoredComponent, { recursive: true })
      await writeFile(path.join(ignoredComponent, 'component.tsx'), '')
    }

    await expect(findBrandComponents(root)).resolves.toEqual([{
      slug: 'visible/brand-card',
      title: 'Brand Card',
      segments: ['visible', 'brand-card'],
      absolutePath: component,
      description: 'Visible brand card.',
    }])
  }))

  it.each([
    { label: 'uppercase', segment: 'Brand' },
    { label: 'underscore', segment: 'brand_name' },
  ])('rejects $label segments with the exact physical path', ({ segment }) => withTempDirectory('framekit-brand-segment-', async (root) => {
    const invalidDirectory = path.join(root, segment)
    await mkdir(invalidDirectory)

    await expect(findBrandComponents(root)).rejects.toThrowError(
      new Error(`Segmento inválido '${segment}' en ruta física: ${invalidDirectory}`),
    )
  }))

  it('discovers multiple leaves in slug order, including deep segments', () => withTempDirectory('framekit-brand-order-', async (root) => {
    for (const relativePath of ['zeta', 'identity/voice/hero-card', 'alpha/card', 'alpha/another']) {
      const component = path.join(root, ...relativePath.split('/'))
      await mkdir(component, { recursive: true })
      await writeFile(path.join(component, 'component.tsx'), '')
      await writeFile(path.join(component, 'preview.tsx'), '')
      await writeFile(path.join(component, 'README.md'), 'A component.')
    }

    const components = await findBrandComponents(root)

    expect(components.map(({ slug, segments }) => ({ slug, segments }))).toEqual([
      { slug: 'alpha/another', segments: ['alpha', 'another'] },
      { slug: 'alpha/card', segments: ['alpha', 'card'] },
      { slug: 'identity/voice/hero-card', segments: ['identity', 'voice', 'hero-card'] },
      { slug: 'zeta', segments: ['zeta'] },
    ])
  }))

  it.each([
    { label: 'empty', readme: '' },
    { label: 'headings-only', readme: '# Brand card\n## Details\n### Notes\n' },
  ])('rejects $label README files with the exact description error', ({ readme }) => withTempDirectory('framekit-brand-readme-', async (root) => {
    const component = path.join(root, 'identity', 'brand-card')
    const readmePath = path.join(component, 'README.md')
    await mkdir(component, { recursive: true })
    await writeFile(path.join(component, 'component.tsx'), '')
    await writeFile(path.join(component, 'preview.tsx'), '')
    await writeFile(readmePath, readme)

    await expect(findBrandComponents(root)).rejects.toThrowError(
      new Error(`README sin descripción en: ${readmePath}`),
    )
  }))

  it('extracts multiline Markdown links while ignoring lists and fenced code with CRLF', () => withTempDirectory('framekit-brand-markdown-', async (root) => {
    const component = path.join(root, 'identity', 'voice', 'hero-card')
    await mkdir(component, { recursive: true })
    await writeFile(path.join(component, 'component.tsx'), '')
    await writeFile(path.join(component, 'preview.tsx'), '')
    await writeFile(path.join(component, 'README.md'), [
      '# Hero card',
      '',
      '- a list item',
      '1. a numbered item',
      '```tsx',
      'const ignored = "[not a description](https://example.com)"',
      '```',
      '',
      'A **multiline** [brand message](https://example.com)',
      'that keeps flowing.',
      '',
      '## Notes',
    ].join('\r\n'))

    await expect(findBrandComponents(root)).resolves.toEqual([{
      slug: 'identity/voice/hero-card',
      title: 'Hero Card',
      segments: ['identity', 'voice', 'hero-card'],
      absolutePath: component,
      description: 'A multiline brand message that keeps flowing.',
    }])
  }))

  it('reports exact missing preview and README errors for every component', () => withTempDirectory('framekit-brand-contract-', async (root) => {
    const component = path.join(root, 'identity', 'logo')
    await mkdir(component, { recursive: true })
    await writeFile(path.join(component, 'component.tsx'), '')

    await expect(findBrandComponents(root)).rejects.toThrow(`Falta preview.tsx en: ${component}`)

    await writeFile(path.join(component, 'preview.tsx'), '')
    await expect(findBrandComponents(root)).rejects.toThrow(`Falta README.md en: ${component}`)
  }))
})
