// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { humanizeSegment, manifestToNavigation } from './navigation'

const manifest = [
  { slug: 'redes-sociales/instagram/promocion-cuadrada', meta: { title: 'Promocion Cuadrada' }, segments: ['redes-sociales', 'instagram', 'promocion-cuadrada'] },
  { slug: 'marketing/email/newsletter', meta: { title: 'Newsletter' }, segments: ['marketing', 'email', 'newsletter'] },
  { slug: 'redes-sociales/facebook/anuncio', meta: { title: 'Anuncio' }, segments: ['redes-sociales', 'facebook', 'anuncio'] },
  { slug: 'redes-sociales/instagram/otra', meta: { title: 'Otra' }, segments: ['redes-sociales', 'instagram', 'otra'] },
]

describe('manifest navigation', () => {
  it('humanizes template segments', () => {
    expect(humanizeSegment('promocion-cuadrada')).toBe('Promocion Cuadrada')
  })

  it('shares nested categories, excludes empty categories, sorts, and links templates', () => {
    expect(manifestToNavigation(manifest)).toEqual([
      {
        type: 'folder',
        id: 'marketing',
        slug: 'marketing',
        title: 'Marketing',
        children: [
          {
            type: 'folder',
            id: 'marketing/email',
            slug: 'marketing/email',
            title: 'Email',
            children: [{ type: 'template', id: 'marketing/email/newsletter', slug: 'marketing/email/newsletter', title: 'Newsletter', href: '/editor/marketing/email/newsletter' }],
          },
        ],
      },
      {
        type: 'folder',
        id: 'redes-sociales',
        slug: 'redes-sociales',
        title: 'Redes Sociales',
        children: [
          {
            type: 'folder',
            id: 'redes-sociales/facebook',
            slug: 'redes-sociales/facebook',
            title: 'Facebook',
            children: [{ type: 'template', id: 'redes-sociales/facebook/anuncio', slug: 'redes-sociales/facebook/anuncio', title: 'Anuncio', href: '/editor/redes-sociales/facebook/anuncio' }],
          },
          {
            type: 'folder',
            id: 'redes-sociales/instagram',
            slug: 'redes-sociales/instagram',
            title: 'Instagram',
            children: [
              { type: 'template', id: 'redes-sociales/instagram/otra', slug: 'redes-sociales/instagram/otra', title: 'Otra', href: '/editor/redes-sociales/instagram/otra' },
              { type: 'template', id: 'redes-sociales/instagram/promocion-cuadrada', slug: 'redes-sociales/instagram/promocion-cuadrada', title: 'Promocion Cuadrada', href: '/editor/redes-sociales/instagram/promocion-cuadrada' },
            ],
          },
        ],
      },
    ])
  })

  it('supports a separate catalog base path', () => {
    expect(manifestToNavigation([{ slug: 'people/quote', title: 'Quote', segments: ['people', 'quote'] }], '/brand')).toEqual([
      {
        type: 'folder',
        id: 'people',
        slug: 'people',
        title: 'People',
        children: [{ type: 'template', id: 'people/quote', slug: 'people/quote', title: 'Quote', href: '/brand/people/quote' }],
      },
    ])
  })

  it('sorts template children by title rather than slug', () => {
    expect(manifestToNavigation([
      { slug: 'catalog/zulu', meta: { title: 'Alpha' }, segments: ['catalog', 'zulu'] },
      { slug: 'catalog/alpha', meta: { title: 'Zulu' }, segments: ['catalog', 'alpha'] },
    ])).toMatchObject([{
      type: 'folder',
      title: 'Catalog',
      children: [
        { type: 'template', slug: 'catalog/zulu', title: 'Alpha' },
        { type: 'template', slug: 'catalog/alpha', title: 'Zulu' },
      ],
    }])
  })

  it('does not mutate the manifest', () => {
    const before = manifest.map((entry) => ({ ...entry, meta: { ...entry.meta }, segments: [...entry.segments] }))

    manifestToNavigation(manifest)

    expect(manifest).toEqual(before)
  })
})
