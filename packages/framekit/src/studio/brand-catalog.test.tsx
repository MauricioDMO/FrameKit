// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { FrameKitBrandCatalog } from './brand-catalog'

afterEach(cleanup)

describe('FrameKitBrandCatalog', () => {
  it('renders the preview and generated README description', () => {
    function Preview() {
      return <div>Preview content</div>
    }

    render(
      <FrameKitBrandCatalog
        title="Person Quote"
        description="Reusable quote block for a person-led message."
        preview={Preview}
        messages={{ componentLabel: 'Brand component', previewLabel: 'Component preview', descriptionLabel: 'Description', editHint: 'Edit in code.' }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Person Quote' })).toBeTruthy()
    expect(screen.getByText('Preview content')).toBeTruthy()
    expect(screen.getByText('Reusable quote block for a person-led message.')).toBeTruthy()
  })
})
