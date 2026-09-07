// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '@/index'
import { TemplateCanvas } from '@/editor'
import type { TemplateAssetManifest } from '@/types'

afterEach(cleanup)

describe('TemplateCanvas', () => {
  it('renders an exact-size shared canvas with canonical props and ref identity', () => {
    const definition = defineTemplate({
      meta: { title: 'Canvas test' },
      width: 320,
      height: 180,
      fields: { title: field.text({ label: 'Title' }) },
      content: { en: { title: 'Hello' } },
      variants: { default: 'en' },
      render: ({ data, assets, variant, width, height }) => <span>{`${data.title}:${assets.common.logo}:${variant}:${width}x${height}`}</span>
    })
    const data = { title: 'Rendered title' }
    const assets: TemplateAssetManifest = { common: { logo: '/logo.svg' }, variants: { en: {} } }
    const canvasRef = createRef<HTMLDivElement>()
    const renderTemplate = vi.spyOn(definition, 'render')
    const { container } = render(<TemplateCanvas definition={definition} data={data} assets={assets} variant="en" canvasRef={canvasRef} />)
    const canvas = container.querySelector<HTMLDivElement>('[data-framekit-render-root]')
    const renderProps = renderTemplate.mock.calls[0]?.[0]

    expect(canvas).toBeTruthy()
    expect(container.children).toHaveLength(1)
    expect(container.firstElementChild).toBe(canvas)
    expect(container.querySelectorAll('[data-framekit-render-root]')).toHaveLength(1)
    expect(canvas?.style.width).toBe('320px')
    expect(canvas?.style.height).toBe('180px')
    expect(canvasRef.current).toBe(canvas)
    expect(renderTemplate).toHaveBeenCalledOnce()
    expect(renderTemplate).toHaveBeenCalledWith({ data, assets, variant: 'en', width: 320, height: 180 })
    expect(renderProps?.data).toBe(data)
    expect(renderProps?.assets).toBe(assets)
    expect(canvas?.textContent).toBe('Rendered title:/logo.svg:en:320x180')
  })
})
