// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { humanizeSegment, manifestToNavigation, type TemplateManifestEntry } from './manifest-to-navigation'

const manifest: TemplateManifestEntry[] = [
  { slug: 'redes-sociales/instagram/promocion-cuadrada', title: 'Promocion Cuadrada', segments: ['redes-sociales', 'instagram', 'promocion-cuadrada'] },
  { slug: 'marketing/email/newsletter', title: 'Newsletter', segments: ['marketing', 'email', 'newsletter'] },
  { slug: 'redes-sociales/facebook/anuncio', title: 'Anuncio', segments: ['redes-sociales', 'facebook', 'anuncio'] },
  { slug: 'redes-sociales/instagram/otra', title: 'Otra', segments: ['redes-sociales', 'instagram', 'otra'] },
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
})
