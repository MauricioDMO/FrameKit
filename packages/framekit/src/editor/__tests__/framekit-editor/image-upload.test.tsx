// @vitest-environment jsdom

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '@/index'

import { renderDefinition } from './fixtures'
import { messages } from './messages'
import { setupFrameKitEditorTests } from './setup'

setupFrameKitEditorTests()

describe('FrameKitEditor image upload', () => {
  it('shows a localized accessible error when image upload response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 413 })
    vi.stubGlobal('fetch', fetchMock)

    try {
      const definition = defineTemplate({
        meta: { title: 'Image editor test' },
        width: 100,
        height: 100,
        fields: { logo: field.image({ label: 'Logo', scope: 'variant' }) },
        content: { en: {} },
        variants: { default: 'en' },
        render: ({ data }) => <span>{data.logo}</span>
      })
      renderDefinition(definition)
      const input = screen.getByLabelText('Logo')
      const file = new File(['image'], 'logo.png', { type: 'image/png' })
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => expect(screen.getByText(messages.imageUploadError)).toBeTruthy())
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.getAttribute('aria-describedby')).toBe('logo-error')
      expect(screen.getByText(messages.imageUploadError).id).toBe('logo-error')
      expect((input as HTMLInputElement).value).toBe('')
      expect(fetchMock).toHaveBeenCalledWith('/__framekit/assets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          templateSlug: 'social/campaign',
          variant: 'en',
          fieldKey: 'logo',
          filename: 'logo.png',
          mimeType: 'image/png',
          data: 'aW1hZ2U='
        })
      })
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
