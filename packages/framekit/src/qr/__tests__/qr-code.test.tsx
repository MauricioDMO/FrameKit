// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { QRCode } from '@/qr'

afterEach(cleanup)

describe('QRCode', () => {
  it('renders an SVG inside a div and forwards container attributes', () => {
    const { container } = render(
      <QRCode
        value="https://framekit.mauriciodmo.com"
        className="absolute bottom-8 right-8 rounded-xl bg-white p-3"
        aria-label="FrameKit QR code"
        data-testid="framekit-qr"
      />
    )

    const wrapper = container.firstElementChild as HTMLDivElement
    const svg = wrapper.querySelector('svg')

    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper.className).toBe('absolute bottom-8 right-8 rounded-xl bg-white p-3')
    expect(wrapper.getAttribute('aria-label')).toBe('FrameKit QR code')
    expect(wrapper.getAttribute('data-testid')).toBe('framekit-qr')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('width')).toBe('128')
    expect(svg?.getAttribute('height')).toBe('128')
  })

  it('keeps SVG styling separate from the wrapper', () => {
    const { container } = render(
      <QRCode
        value="FrameKit"
        size={240}
        qrClassName="size-full"
        className="relative"
      />
    )

    const wrapper = container.firstElementChild as HTMLDivElement
    const svg = wrapper.querySelector('svg')

    expect(wrapper.className).toBe('relative')
    expect(svg?.getAttribute('class')).toBe('size-full')
    expect(svg?.getAttribute('width')).toBe('240')
    expect(svg?.getAttribute('height')).toBe('240')
  })

  it('forwards custom QR colors to the generated SVG paths', () => {
    const { container } = render(
      <QRCode
        value="FrameKit"
        foreground="#173d31"
        background="#faf9f5"
        level="H"
        margin={2}
      />
    )

    const paths = container.querySelectorAll('svg path')

    expect(paths.length).toBeGreaterThanOrEqual(2)
    expect(paths[0]?.getAttribute('fill')).toBe('#faf9f5')
    expect(paths[1]?.getAttribute('fill')).toBe('#173d31')
  })
})
