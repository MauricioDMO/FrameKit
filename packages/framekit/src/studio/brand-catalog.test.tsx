// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { FrameKitBrandCatalog } from './brand-catalog'

afterEach(cleanup)

describe('FrameKitBrandCatalog', () => {
  it('renders the component preview, description, and catalog labels', () => {
    function Preview() {
      return <div>Preview content</div>
    }

    render(
      <FrameKitBrandCatalog
        title="Person Quote"
        description="Reusable quote block for a person-led message."
        preview={Preview}
        messages={{ componentLabel: 'Brand component', previewLabel: 'Component preview', descriptionLabel: 'Description', editHint: 'Edit in code.', badgeLabel: 'Brand', sourceLabel: 'component.tsx' }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Person Quote' })).toBeTruthy()

    const header = screen.getByRole('banner')
    expect(within(header).getByText('Brand component')).toBeTruthy()
    expect(within(header).getByText('Brand')).toBeTruthy()

    const preview = screen.getByRole('region', { name: 'Component preview' })
    expect(within(preview).getByText('Preview content')).toBeTruthy()

    const details = screen.getByRole('complementary')
    expect(within(details).getByText('Description')).toBeTruthy()
    expect(within(details).getByText('component.tsx')).toBeTruthy()
    expect(within(details).getByText('Edit in code.')).toBeTruthy()
    expect(within(details).getByText('Reusable quote block for a person-led message.')).toBeTruthy()
  })
})
